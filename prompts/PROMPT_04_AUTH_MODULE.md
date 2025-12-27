# Prompt 4: Authentication Module with JWT & Multi-Org Support

## Objective
Implement a complete authentication module with JWT-based OAuth2 flow, supporting multi-organization users, refresh tokens, and secure HTTP-only cookies.

## Context
- Prompts 1-3 completed: Project setup, common utilities, and database entities
- Multi-org architecture: Users can belong to multiple organizations
- User and UserOrganization entities created
- Ready to implement authentication

## Prerequisites
- Prompts 1, 2, and 3 completed successfully
- Database migrations run
- Application running without errors

## Tasks

### 1. Install Additional Dependencies

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local bcrypt cookie-parser
npm install -D @types/passport-jwt @types/passport-local @types/bcrypt @types/cookie-parser
```

### 2. Create JWT Configuration

**File: `src/config/jwt.config.ts`**
```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-change-in-production',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production',
  accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
  refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
}));
```

### 3. Create Auth DTOs

**File: `src/modules/auth/dto/login.dto.ts`**
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'sarah.smith@dentalclinic.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password!: string;
}
```

**File: `src/modules/auth/dto/select-organization.dto.ts`**
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SelectOrganizationDto {
  @ApiProperty({ example: 'org-uuid-here' })
  @IsUUID()
  orgId!: string;
}
```

**File: `src/modules/auth/dto/auth-response.dto.ts`**
```typescript
import { ApiProperty } from '@nestjs/swagger';

export class UserOrgDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  orgId!: string;

  @ApiProperty({ enum: ['admin', 'dentist', 'secretary'] })
  role!: string;

  @ApiProperty({ enum: ['active', 'inactive'] })
  status!: string;

  @ApiProperty({ required: false })
  wallet?: number;

  @ApiProperty({ required: false })
  percentage?: number;
}

export class UserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ type: [UserOrgDto], required: false })
  organizations?: UserOrgDto[];

  @ApiProperty({ type: UserOrgDto, required: false })
  currentOrg?: UserOrgDto;
}

export class LoginResponseDto {
  @ApiProperty({ type: UserDto })
  user!: UserDto;

  @ApiProperty()
  needsOrgSelection!: boolean;

  @ApiProperty({ required: false })
  accessToken?: string;
}

export class SelectOrgResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ type: UserOrgDto })
  currentOrg!: UserOrgDto;
}

export class RefreshResponseDto {
  @ApiProperty()
  accessToken!: string;
}
```

### 4. Create JWT Payload Interface

**File: `src/modules/auth/interfaces/jwt-payload.interface.ts`**
```typescript
export interface JwtPayload {
  sub: string; // userId
  email: string;
  orgId: string;
  role: string;
  iat?: number;
  exp?: number;
}
```

### 5. Create JWT Strategy

**File: `src/modules/auth/strategies/jwt.strategy.ts`**
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { CurrentUserData } from '../../../common/decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.accessSecret'),
    });
  }

  async validate(payload: JwtPayload): Promise<CurrentUserData> {
    if (!payload.sub || !payload.orgId || !payload.role) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      orgId: payload.orgId,
    };
  }
}
```

### 6. Create JWT Auth Guard

**File: `src/common/guards/jwt-auth.guard.ts`**
```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

### 7. Create Auth Service

**File: `src/modules/auth/auth.service.ts`**
```typescript
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from '@mikro-orm/core';
import * as bcrypt from 'bcrypt';
import { User, UserOrganization, UserStatus } from '../../common/entities';
import { LoginDto } from './dto/login.dto';
import { SelectOrganizationDto } from './dto/select-organization.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private em: EntityManager,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

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
      const tokens = await this.generateTokens(user, org);
      
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
    return {
      user: this.sanitizeUser(user),
      needsOrgSelection: true,
    };
  }

  async selectOrganization(userId: string, selectOrgDto: SelectOrganizationDto) {
    const user = await this.em.findOne(User, { id: userId }, {
      populate: ['organizations'],
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

    const tokens = await this.generateTokens(user, selectedOrg);
    
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

  async logout(userId: string) {
    const user = await this.em.findOne(User, { id: userId });
    if (user) {
      user.refreshToken = null;
      user.refreshTokenExpiresAt = null;
      await this.em.flush();
    }
  }

  private async generateTokens(user: User, userOrg: UserOrganization) {
    const accessToken = await this.generateAccessToken(user, userOrg.orgId, userOrg.role);
    const refreshToken = await this.generateRefreshToken(user, userOrg.orgId, userOrg.role);

    return { accessToken, refreshToken };
  }

  private async generateAccessToken(user: User, orgId: string, role: string): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      orgId,
      role,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiration'),
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
      expiresIn: this.configService.get<string>('jwt.refreshExpiration'),
    });
  }

  private async saveRefreshToken(user: User, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    const expiresIn = this.configService.get<string>('jwt.refreshExpiration');
    
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
      userId: userOrg.userId,
      orgId: userOrg.orgId,
      role: userOrg.role,
      status: userOrg.status,
      wallet: userOrg.wallet,
      percentage: userOrg.percentage,
    };
  }
}
```

### 8. Create Auth Controller

**File: `src/modules/auth/auth.controller.ts`**
```typescript
import { Controller, Post, Body, Res, Req, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SelectOrganizationDto } from './dto/select-organization.dto';
import { LoginResponseDto, SelectOrgResponseDto, RefreshResponseDto } from './dto/auth-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { ApiStandardResponse } from '../../common/decorators/api-standard-response.decorator';
import { StandardResponse } from '../../common/dto/standard-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
    if (result.refreshToken) {
      response.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    return new StandardResponse({
      user: result.user,
      needsOrgSelection: result.needsOrgSelection,
      accessToken: result.accessToken,
    });
  }

  @Public()
  @Post('select-organization')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Select organization for multi-org users' })
  @ApiStandardResponse(SelectOrgResponseDto)
  async selectOrganization(
    @Body() selectOrgDto: SelectOrganizationDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    // For now, we'll need userId from request body or session
    // In production, this would come from a temporary session token
    const userId = (request.body as any).userId;
    
    const result = await this.authService.selectOrganization(userId, selectOrgDto);

    // Set refresh token in HTTP-only cookie
    response.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
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
  ) {
    const refreshToken = request.cookies['refresh_token'];
    
    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    // Decode to get userId
    const decoded = this.authService['jwtService'].decode(refreshToken) as any;
    const result = await this.authService.refreshToken(decoded.sub, refreshToken);

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

    return new StandardResponse({ message: 'Logged out successfully' });
  }
}
```

### 9. Create Auth Module

**File: `src/modules/auth/auth.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User, UserOrganization } from '../../common/entities';
import jwtConfig from '../../config/jwt.config';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    PassportModule,
    JwtModule.register({}), // Configuration done in service
    MikroOrmModule.forFeature([User, UserOrganization]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

### 10. Update App Module

**File: `src/app.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import mikroOrmConfig from './mikro-orm.config';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
      envFilePath: '.env',
    }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
```

### 11. Update CurrentUser Decorator

**File: `src/common/decorators/current-user.decorator.ts`** (already exists, verify it matches):
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  id: string;
  email: string;
  role: string;
  orgId: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

## Acceptance Criteria

- [ ] Auth module created and imported
- [ ] JWT strategy implemented
- [ ] Login endpoint working
- [ ] Organization selection endpoint working
- [ ] Refresh token endpoint working
- [ ] Logout endpoint working
- [ ] Passwords hashed with bcrypt
- [ ] Refresh tokens stored securely
- [ ] HTTP-only cookies for refresh tokens
- [ ] JWT auth guard applied globally
- [ ] Public decorator working
- [ ] Swagger documentation complete
- [ ] No TypeScript compilation errors

## Testing Steps

1. **Start application**:
   ```bash
   npm run start:dev
   ```

2. **Test login (single org user)** via Swagger or curl:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"sarah.smith@dentalclinic.com","password":"password123"}'
   ```

3. **Test login (multi-org user)**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"alex.martinez@dentalclinic.com","password":"password123"}'
   ```

4. **Test protected endpoint**:
   ```bash
   curl -X GET http://localhost:3000/api/v1/some-protected-route \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

5. **Test refresh token**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/refresh \
     --cookie "refresh_token=YOUR_REFRESH_TOKEN"
   ```

6. **Test logout**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/logout \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

## Files Created

```
src/config/
└── jwt.config.ts

src/modules/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── dto/
│   ├── login.dto.ts
│   ├── select-organization.dto.ts
│   └── auth-response.dto.ts
├── interfaces/
│   └── jwt-payload.interface.ts
└── strategies/
    └── jwt.strategy.ts

src/common/guards/
└── jwt-auth.guard.ts
```

## Common Issues & Solutions

1. **JWT secret not found**: Check `.env` file has JWT secrets
2. **Cookie not set**: Verify cookie-parser middleware is installed
3. **Unauthorized errors**: Check JWT token is valid and not expired
4. **Refresh token not working**: Verify token is sent in cookie

## Next Steps

After completing this prompt:
- Proceed to **Prompt 5: Role-Based Guards**
- Do not proceed until all acceptance criteria are met

## Notes

- Refresh tokens are hashed before storing
- Access tokens are short-lived (15 minutes)
- Refresh tokens are long-lived (7 days)
- Multi-org users must select organization after login
- Single-org users are auto-logged in

---

**Estimated Time**: 60-75 minutes
**Difficulty**: High
**Dependencies**: Prompts 1, 2, 3
