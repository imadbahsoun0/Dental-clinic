import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { ApiStandardResponse } from '../../common/decorators/api-standard-response.decorator';
import { StandardResponse } from '../../common/dto/standard-response.dto';
import { PaginationDto, PaginatedResponse } from '../../common/dto/pagination.dto';
import { ParseUUIDPipe } from '../../common/pipes/parse-uuid.pipe';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@Roles(UserRole.ADMIN) // Only admins can manage users
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new user in the organization' })
    @ApiStandardResponse(UserResponseDto, false, 'created')
    async create(
        @Body() createUserDto: CreateUserDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        const result = await this.usersService.create(
            createUserDto,
            user.orgId,
            user.id,
        );
        return new StandardResponse(result, 'User created successfully');
    }

    @Get()
    @ApiOperation({ summary: 'Get all users in the organization' })
    @ApiStandardResponse(UserResponseDto, true)
    async findAll(
        @CurrentUser() user: CurrentUserData,
        @Query() pagination: PaginationDto,
    ) {
        const result = await this.usersService.findAll(user.orgId, pagination);
        return new StandardResponse(result);
    }

    @Get('dentists')
    @Roles(UserRole.ADMIN, UserRole.SECRETARY) // Secretaries can view dentists
    @ApiOperation({ summary: 'Get all dentists in the organization' })
    @ApiStandardResponse(Object, true)
    async getDentists(@CurrentUser() user: CurrentUserData) {
        const result = await this.usersService.getDentists(user.orgId);
        return new StandardResponse(result);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a user by ID' })
    @ApiStandardResponse(UserResponseDto)
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: CurrentUserData,
    ) {
        const result = await this.usersService.findOne(id, user.orgId);
        return new StandardResponse(result);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a user' })
    @ApiStandardResponse(UserResponseDto)
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateUserDto: UpdateUserDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        const result = await this.usersService.update(
            id,
            user.orgId,
            updateUserDto,
            user.id,
        );
        return new StandardResponse(result, 'User updated successfully');
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Deactivate a user' })
    @ApiStandardResponse(Object)
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: CurrentUserData,
    ) {
        const result = await this.usersService.remove(id, user.orgId);
        return new StandardResponse(result);
    }
}
