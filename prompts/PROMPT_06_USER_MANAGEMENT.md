# Prompt 6: User Management APIs

## Objective
Implement user management APIs with multi-organization support, allowing admins to create, update, and manage users within their organization.

## Context
- Prompts 1-5 completed: Auth and RBAC working
- Users can belong to multiple organizations
- UserOrganization junction table manages roles per org
- Only admins can manage users

## Prerequisites
- Prompts 1-5 completed successfully
- Authentication and authorization working
- Database has User and UserOrganization entities

## Tasks

### 1. Create User DTOs

**File: `src/modules/users/dto/create-user.dto.ts`**
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { UserRole } from '../../../common/entities';

export class CreateUserDto {
  @ApiProperty({ example: 'Dr. John Doe' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'john.doe@dentalclinic.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: '+1 (555) 123-4567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.DENTIST })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiProperty({ example: 30, required: false, description: 'Commission percentage for dentists' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage?: number;
}
```

**File: `src/modules/users/dto/update-user.dto.ts`**
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { UserRole, UserStatus } from '../../../common/entities';

export class UpdateUserDto {
  @ApiProperty({ example: 'Dr. John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '+1 (555) 123-4567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ enum: UserStatus, required: false })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage?: number;
}
```

**File: `src/modules/users/dto/user-response.dto.ts`**
```typescript
import { ApiProperty } from '@nestjs/swagger';

export class UserOrgResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  orgId!: string;

  @ApiProperty()
  role!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ required: false })
  wallet?: number;

  @ApiProperty({ required: false })
  percentage?: number;
}

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ type: [UserOrgResponseDto] })
  organizations!: UserOrgResponseDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
```

### 2. Create Users Service

**File: `src/modules/users/users.service.ts`**
```typescript
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import * as bcrypt from 'bcrypt';
import { User, UserOrganization, UserRole, UserStatus } from '../../common/entities';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(private em: EntityManager) {}

  async create(createUserDto: CreateUserDto, orgId: string, createdBy: string) {
    // Check if user with email already exists
    const existingUser = await this.em.findOne(User, { email: createUserDto.email });

    let user: User;

    if (existingUser) {
      // User exists - check if they're already in this organization
      const existingUserOrg = await this.em.findOne(UserOrganization, {
        userId: existingUser.id,
        orgId,
      });

      if (existingUserOrg) {
        throw new ConflictException('User already exists in this organization');
      }

      user = existingUser;
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      user = new User(createUserDto.name, createUserDto.email, hashedPassword);
      user.phone = createUserDto.phone;
      user.createdBy = createdBy;
      user.orgId = orgId; // Set for audit purposes

      this.em.persist(user);
    }

    // Create user-organization relationship
    const userOrg = new UserOrganization(user.id, orgId, createUserDto.role);
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

    const userOrg = await this.em.findOne(UserOrganization, { userId, orgId });

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
    const userOrg = await this.em.findOne(UserOrganization, { userId, orgId });

    if (!userOrg) {
      throw new NotFoundException('User not found in this organization');
    }

    // Soft delete - set status to inactive instead of removing
    userOrg.status = UserStatus.INACTIVE;
    await this.em.flush();

    return { message: 'User deactivated successfully' };
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
```

### 3. Create Users Controller

**File: `src/modules/users/users.controller.ts`**
```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
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
  constructor(private readonly usersService: UsersService) {}

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
```

### 4. Create Users Module

**File: `src/modules/users/users.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserOrganization } from '../../common/entities';

@Module({
  imports: [MikroOrmModule.forFeature([User, UserOrganization])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

### 5. Update App Module

**File: `src/app.module.ts`** (add UsersModule):
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import mikroOrmConfig from './mikro-orm.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TestModule } from './modules/test/test.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
      envFilePath: '.env',
    }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    AuthModule,
    UsersModule,
    TestModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
```

## Acceptance Criteria

- [ ] Users module created
- [ ] Create user endpoint working
- [ ] List users endpoint working with pagination
- [ ] Get user by ID endpoint working
- [ ] Update user endpoint working
- [ ] Deactivate user endpoint working
- [ ] Get dentists endpoint working
- [ ] Only admins can manage users
- [ ] Secretaries can view dentists
- [ ] Users scoped to organization
- [ ] Passwords hashed on creation
- [ ] Multi-org support working
- [ ] Swagger documentation complete

## Testing Steps

1. **Login as Admin**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"james.wilson@dentalclinic.com","password":"password123"}'
   ```

2. **Create a new user**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/users \
     -H "Authorization: Bearer ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Dr. New Dentist",
       "email": "new.dentist@dentalclinic.com",
       "password": "password123",
       "phone": "+1 (555) 999-9999",
       "role": "dentist",
       "percentage": 35
     }'
   ```

3. **List all users**:
   ```bash
   curl -X GET "http://localhost:3000/api/v1/users?page=1&limit=10" \
     -H "Authorization: Bearer ADMIN_TOKEN"
   ```

4. **Get dentists list**:
   ```bash
   curl -X GET http://localhost:3000/api/v1/users/dentists \
     -H "Authorization: Bearer ADMIN_TOKEN"
   ```

5. **Update user**:
   ```bash
   curl -X PATCH http://localhost:3000/api/v1/users/USER_ID \
     -H "Authorization: Bearer ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"percentage": 40}'
   ```

6. **Test with non-admin** (should fail):
   ```bash
   curl -X GET http://localhost:3000/api/v1/users \
     -H "Authorization: Bearer DENTIST_TOKEN"
   ```

## Files Created

```
src/modules/users/
├── users.module.ts
├── users.controller.ts
├── users.service.ts
└── dto/
    ├── create-user.dto.ts
    ├── update-user.dto.ts
    └── user-response.dto.ts
```

## Common Issues & Solutions

1. **Duplicate email error**: User already exists globally
2. **User already in org**: Check UserOrganization table
3. **Permission denied**: Ensure user is admin

## Next Steps

After completing this prompt:
- Proceed to **Prompt 7: Organization Module**
- Do not proceed until all acceptance criteria are met

## Notes

- Users can belong to multiple organizations
- Email is globally unique
- Passwords are hashed with bcrypt
- Soft delete (deactivate) instead of hard delete
- Wallet and percentage only for dentists

---

**Estimated Time**: 45-60 minutes
**Difficulty**: Medium
**Dependencies**: Prompts 1-5
