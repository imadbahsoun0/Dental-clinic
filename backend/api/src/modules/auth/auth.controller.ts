import { Controller, Post, Body, Res, Req, HttpCode, HttpStatus, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SelectOrganizationDto } from './dto/select-organization.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginResponseDto, SelectOrgResponseDto, RefreshResponseDto } from './dto/auth-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, type CurrentUserData } from '../../common/decorators/current-user.decorator';
import { ApiStandardResponse } from '../../common/decorators/api-standard-response.decorator';
import { StandardResponse } from '../../common/dto/standard-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiStandardResponse(LoginResponseDto)
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const result = await this.authService.login(loginDto);

        // Set refresh token in HTTP-only cookie if provided
        // Set refresh token in HTTP-only cookie if provided
        if (result.refreshToken) {
            response.cookie('refresh_token', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
        }

        // Set access token in HTTP-only cookie
        if (result.accessToken) {
            response.cookie('access_token', result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000, // 15 minutes
            });
        }

        return new StandardResponse({
            user: result.user,
            needsOrgSelection: result.needsOrgSelection,
            accessToken: result.accessToken,
        });
    }

    @Post('select-organization')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Select organization for multi-org users' })
    @ApiStandardResponse(SelectOrgResponseDto)
    async selectOrganization(
        @CurrentUser() user: CurrentUserData,
        @Body() selectOrgDto: SelectOrganizationDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const userId = user.id;

        const result = await this.authService.selectOrganization(userId, selectOrgDto);

        // Set refresh token in HTTP-only cookie
        response.cookie('refresh_token', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Set access token in HTTP-only cookie
        response.cookie('access_token', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        return new StandardResponse({
            accessToken: result.accessToken,
            currentOrg: result.currentOrg,
        });
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiStandardResponse(RefreshResponseDto)
    async refresh(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ) {
        const refreshToken = request.cookies['refresh_token'];

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }

        // Decode to get userId
        const decoded = this.authService.decodeToken(refreshToken) as any;
        const result = await this.authService.refreshToken(decoded.sub, refreshToken);

        // Set new access token in HTTP-only cookie
        if (result.accessToken) {
            response.cookie('access_token', result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000, // 15 minutes
            });
        }

        // Also update refresh token cookie if it was rotated (present in result)
        if ((result as any).refreshToken) {
            response.cookie('refresh_token', (result as any).refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
        }

        return new StandardResponse(result);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Logout and revoke refresh token' })
    @ApiStandardResponse(Object)
    async logout(
        @CurrentUser() user: CurrentUserData,
        @Res({ passthrough: true }) response: Response,
    ) {
        await this.authService.logout(user.id);

        // Clear refresh token cookie
        response.clearCookie('refresh_token');
        // Clear access token cookie
        response.clearCookie('access_token');

        return new StandardResponse({ message: 'Logged out successfully' });
    }

    @Public()
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Request password reset' })
    @ApiStandardResponse(Object)
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        await this.authService.forgotPassword(forgotPasswordDto.email);
        return new StandardResponse({ message: 'If an account exists with this email, a password reset link has been sent.' });
    }

    @Public()
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reset password using token' })
    @ApiStandardResponse(Object)
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        await this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
        return new StandardResponse({ message: 'Password successfully reset' });
    }
}
