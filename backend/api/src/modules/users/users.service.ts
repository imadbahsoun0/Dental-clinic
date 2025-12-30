import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserOrganization, UserStatus, Organization } from '../../common/entities';
import { UserRole } from '../../common/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {
    constructor(
        private em: EntityManager,
        private emailService: EmailService
    ) { }

    async create(createUserDto: CreateUserDto, orgId: string, createdBy: string) {
        // Check if user with email already exists
        const existingUser = await this.em.findOne(User, { email: createUserDto.email });

        let user: User;

        if (existingUser) {
            // User exists - check if they're already in this organization
            const existingUserOrg = await this.em.findOne(UserOrganization, {
                user: existingUser,
                orgId,
            });

            if (existingUserOrg) {
                throw new ConflictException('User already exists in this organization');
            }

            user = existingUser;
        } else {
            // Create new user
            // If password provided use it, else generate random for invitation
            const temporaryPassword = createUserDto.password || crypto.randomBytes(12).toString('hex');
            const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

            user = new User(createUserDto.name, createUserDto.email, hashedPassword);
            user.phone = createUserDto.phone;
            user.createdBy = createdBy;
            user.orgId = orgId; // Set for audit purposes

            // If no password provided, initiate Invitation flow via Password Reset
            if (!createUserDto.password) {
                const resetToken = crypto.randomBytes(32).toString('hex');
                user.resetPasswordToken = resetToken;
                user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

                // Send Invitation Email (using Password Reset template) - Fire and forget
                this.emailService.sendPasswordResetEmail(user.email, resetToken)
                    .then(() => console.log(`[INVITATION] Invitation sent to ${user.email}`))
                    .catch((error) => console.error(`[INVITATION] Failed to send email to ${user.email}`, error));
            }

            this.em.persist(user);
        }

        // Create user-organization relationship
        const userOrg = new UserOrganization(user, orgId, createUserDto.role);
        // Explicitly set organization reference
        userOrg.organization = this.em.getReference(Organization, orgId);
        userOrg.status = UserStatus.ACTIVE;
        userOrg.createdBy = createdBy;

        if (createUserDto.role === UserRole.DENTIST) {
            userOrg.wallet = 0;
            userOrg.percentage = createUserDto.percentage || 0;
        }

        this.em.persist(userOrg);
        await this.em.flush();

        return this.findOne(user.id, orgId);
    }

    async findAll(orgId: string, pagination: PaginationDto) {
        const { page = 1, limit = 10 } = pagination;
        const offset = (page - 1) * limit;

        const [userOrgs, total] = await this.em.findAndCount(
            UserOrganization,
            { orgId },
            {
                populate: ['user'],
                limit,
                offset,
                orderBy: { createdAt: 'DESC' },
            },
        );

        const users = userOrgs.map((userOrg) => this.mapToResponse(userOrg.user, [userOrg]));

        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(userId: string, orgId: string) {
        const user = await this.em.findOne(
            User,
            { id: userId },
            { populate: ['organizations'] },
        );

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Filter organizations to only show the current org
        const userOrgs = user.organizations.getItems().filter((org) => org.orgId === orgId);

        if (userOrgs.length === 0) {
            throw new NotFoundException('User not found in this organization');
        }

        return this.mapToResponse(user, userOrgs);
    }

    async update(userId: string, orgId: string, updateUserDto: UpdateUserDto, updatedBy: string) {
        const user = await this.em.findOne(User, { id: userId });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const userOrg = await this.em.findOne(UserOrganization, { user: { id: userId }, orgId });

        if (!userOrg) {
            throw new NotFoundException('User not found in this organization');
        }

        // Update user basic info
        if (updateUserDto.name) user.name = updateUserDto.name;
        if (updateUserDto.phone !== undefined) user.phone = updateUserDto.phone;
        user.updatedBy = updatedBy;

        // Update user-organization specific info
        if (updateUserDto.role) userOrg.role = updateUserDto.role;
        if (updateUserDto.status) userOrg.status = updateUserDto.status;
        if (updateUserDto.percentage !== undefined) {
            if (userOrg.role === UserRole.DENTIST) {
                userOrg.percentage = updateUserDto.percentage;
            }
        }
        userOrg.updatedBy = updatedBy;

        await this.em.flush();

        return this.findOne(userId, orgId);
    }

    async remove(userId: string, orgId: string) {
        const userOrg = await this.em.findOne(UserOrganization, { user: { id: userId }, orgId });

        if (!userOrg) {
            throw new NotFoundException('User not found in this organization');
        }

        // Hard delete - remove the relationship record
        this.em.remove(userOrg);
        await this.em.flush();

        return { message: 'User deleted successfully' };
    }

    async getDentists(orgId: string) {
        const dentistOrgs = await this.em.find(
            UserOrganization,
            { orgId, role: UserRole.DENTIST, status: UserStatus.ACTIVE },
            { populate: ['user'] },
        );

        return dentistOrgs.map((userOrg) => ({
            id: userOrg.user.id,
            name: userOrg.user.name,
            email: userOrg.user.email,
            wallet: userOrg.wallet,
            percentage: userOrg.percentage,
        }));
    }

    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
        const user = await this.em.findOne(User, { id: userId });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check if email is being changed and if it's already taken
        if (updateProfileDto.email && updateProfileDto.email !== user.email) {
            const existingUser = await this.em.findOne(User, { email: updateProfileDto.email });
            if (existingUser) {
                throw new ConflictException('Email already in use');
            }
            user.email = updateProfileDto.email;
        }

        if (updateProfileDto.name) user.name = updateProfileDto.name;
        if (updateProfileDto.phone !== undefined) user.phone = updateProfileDto.phone;

        await this.em.flush();

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
        };
    }

    private mapToResponse(user: User, userOrgs: UserOrganization[]) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            organizations: userOrgs.map((org) => ({
                id: org.id,
                orgId: org.orgId,
                role: org.role,
                status: org.status,
                wallet: org.wallet,
                percentage: org.percentage,
            })),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
