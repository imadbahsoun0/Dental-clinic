import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from '@mikro-orm/core';
import * as bcrypt from 'bcrypt';
import { User, UserOrganization, UserStatus } from '../../common/entities';
import { LoginDto } from './dto/login.dto';
import { SelectOrganizationDto } from './dto/select-organization.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
    constructor(
        private em: EntityManager,
        private jwtService: JwtService,
        private configService: ConfigService,
        private emailService: EmailService,
    ) { }

    async login(loginDto: LoginDto) {
        // Find user by email
        const user = await this.em.findOne(User, { email: loginDto.email }, {
            populate: ['organizations', 'organizations.organization'],
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Get active organizations
        const activeOrgs = user.organizations.getItems().filter(
            (org) => org.status === UserStatus.ACTIVE,
        );

        if (activeOrgs.length === 0) {
            throw new UnauthorizedException('No active organizations found');
        }

        // If user has only one organization, auto-select it
        if (activeOrgs.length === 1) {
            const org = activeOrgs[0];
            const tokens = await this.generateTokens(user, org.orgId, org.role);

            // Save refresh token
            await this.saveRefreshToken(user, tokens.refreshToken);

            return {
                user: this.sanitizeUser(user, org),
                needsOrgSelection: false,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            };
        }

        // User has multiple organizations - needs to select one
        // Issue intermediate token
        const accessToken = await this.generateAccessToken(user);

        return {
            user: this.sanitizeUser(user),
            needsOrgSelection: true,
            accessToken,
        };
    }
    async selectOrganization(userId: string, selectOrgDto: SelectOrganizationDto) {
        const user = await this.em.findOne(User, { id: userId }, {
            populate: ['organizations', 'organizations.organization'],
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const selectedOrg = user.organizations.getItems().find(
            (org) => org.orgId === selectOrgDto.orgId && org.status === UserStatus.ACTIVE,
        );

        if (!selectedOrg) {
            throw new BadRequestException('Organization not found or inactive');
        }

        const tokens = await this.generateTokens(user, selectedOrg.orgId, selectedOrg.role);

        // Save refresh token
        await this.saveRefreshToken(user, tokens.refreshToken);

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            currentOrg: this.sanitizeUserOrg(selectedOrg),
        };
    }

    async refreshToken(userId: string, refreshToken: string) {
        const user = await this.em.findOne(User, { id: userId });

        if (!user || !user.refreshToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        // Verify refresh token
        const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!isValid) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        // Check expiration
        if (user.refreshTokenExpiresAt && user.refreshTokenExpiresAt < new Date()) {
            throw new UnauthorizedException('Refresh token expired');
        }

        // Decode old token to get orgId and role
        try {
            const decoded = this.jwtService.decode(refreshToken) as JwtPayload;

            // Generate new access token
            const accessToken = await this.generateAccessToken(user, decoded.orgId, decoded.role);

            return { accessToken };
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    decodeToken(token: string) {
        return this.jwtService.decode(token);
    }

    async logout(userId: string) {
        const user = await this.em.findOne(User, { id: userId });
        if (user) {
            user.refreshToken = undefined;
            user.refreshTokenExpiresAt = undefined;
            await this.em.flush();
        }
    }

    async forgotPassword(email: string) {
        const user = await this.em.findOne(User, { email });
        // Faking success to prevent email enumeration if user not found,
        // but for now, if user not found, we just return.
        // Or we can throw, but security best practice is to always say "If email exists, instruction sent".
        if (!user) {
            return;
        }

        const resetToken = uuidv4();
        // Store plain token for easier lookup

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

        await this.em.flush();

        await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    }

    async resetPassword(token: string, newPassword: string) {
        // We need to find the user. Since we hashed the token, strict lookup by token is hard unless we used a lookup ID + token secret.
        // A common simple way: The token could be a plaintext random string. But looking it up is slow if hashed.
        // Better: The token passed to user is `userId|randomString`. OR we don't hash it in DB for simplicity in this MVP 
        // OR we iterate users with tokens (bad). 
        // OR we store it plain text (less secure).
        // OR we change the flow to send `userId` and `token` in the link.
        // Given I already defined `resetPasswordToken` in `User` entity and typically for password reset tokens, 
        // if they are short-lived, storing them plain text or just signed JWT is common.
        // However, I committed to hashing it in `forgotPassword` above.
        // To make it workable with hashing:
        // 1. The token sent to email should be the *input* to the hash.
        // 2. We need a way to find the user efficiently. 
        //    => Use `email` + `token` in the reset body? 
        //    => Or just store it plain text for now, as it is a random UUID and expires in 1 hour.

        // Let's switch to storing plain text for `resetPasswordToken` to allow easy lookup,
        // OR update the API to require email + token. 
        // The `ResetPasswordDto` only has `token` and `newPassword`.
        // So I will store the token as PLAIN TEXT in this implementation for simplicity and lookup speed,
        // relying on the UUID v4 entropy and short expiration time.

        // Find user by token
        const user = await this.em.findOne(User, {
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            throw new BadRequestException('Invalid or expired password reset token');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = null as any;
        user.resetPasswordExpires = null as any;

        await this.em.flush();
    }

    private async generateTokens(user: User, orgId: string, role: string) {
        const accessToken = await this.generateAccessToken(user, orgId, role);
        const refreshToken = await this.generateRefreshToken(user, orgId, role);

        return { accessToken, refreshToken };
    }

    private async generateAccessToken(user: User, orgId?: string, role?: string): Promise<string> {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            orgId,
            role,
        };

        return this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('jwt.accessSecret'),
            expiresIn: this.configService.get<string>('jwt.accessExpiration') as any,
        });
    }

    private async generateRefreshToken(user: User, orgId: string, role: string): Promise<string> {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            orgId,
            role,
        };

        return this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('jwt.refreshSecret'),
            expiresIn: this.configService.get<string>('jwt.refreshExpiration') as any,
        });
    }

    private async saveRefreshToken(user: User, refreshToken: string) {
        const hashedToken = await bcrypt.hash(refreshToken, 10);

        // Calculate expiration date (7 days)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        user.refreshToken = hashedToken;
        user.refreshTokenExpiresAt = expiresAt;
        await this.em.flush();
    }

    private sanitizeUser(user: User, currentOrg?: UserOrganization) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            organizations: user.organizations.getItems().map(org => this.sanitizeUserOrg(org)),
            currentOrg: currentOrg ? this.sanitizeUserOrg(currentOrg) : undefined,
        };
    }

    private sanitizeUserOrg(userOrg: UserOrganization) {
        return {
            id: userOrg.id,
            userId: userOrg.user.id,
            orgId: userOrg.orgId,
            orgName: userOrg.organization?.name,
            role: userOrg.role,
            status: userOrg.status,
            wallet: userOrg.wallet,
            percentage: userOrg.percentage,
        };
    }
}
