# Prompt 2: Common Module Setup - Decorators, Filters, Interceptors & DTOs

## Objective
Create reusable common utilities including custom decorators, exception filters, interceptors, pipes, and standardized DTOs that will be used across all modules.

## Context
- Prompt 1 completed: NestJS project initialized with MikroORM
- Application is running successfully
- Database connection established
- This prompt sets up the foundation for all future modules

## Prerequisites
- Prompt 1 completed successfully
- Application running on `http://localhost:3000`

## Tasks

### 1. Create Base Entity

**File: `src/common/entities/base.entity.ts`**
```typescript
import { PrimaryKey, Property, BaseEntity as MikroBaseEntity } from '@mikro-orm/core';
import { v4 } from 'uuid';

export abstract class BaseEntity extends MikroBaseEntity<BaseEntity, 'id'> {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ type: 'uuid', nullable: true })
  createdBy?: string;

  @Property({ type: 'uuid', nullable: true, onUpdate: () => null })
  updatedBy?: string;

  @Property({ type: 'uuid' })
  orgId!: string; // Multi-tenancy: All entities belong to an organization
}
```

### 2. Create Custom Decorators

**File: `src/common/decorators/current-user.decorator.ts`**
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

**File: `src/common/decorators/roles.decorator.ts`**
```typescript
import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  ADMIN = 'admin',
  DENTIST = 'dentist',
  SECRETARY = 'secretary',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

**File: `src/common/decorators/public.decorator.ts`**
```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**File: `src/common/decorators/api-standard-response.decorator.ts`**
```typescript
import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { StandardResponse } from '../dto/standard-response.dto';
import { ErrorResponse } from '../dto/error-response.dto';

export const ApiStandardResponse = <TModel extends Type<any>>(
  model: TModel,
  isArray = false,
  status: 'ok' | 'created' = 'ok',
) => {
  const ResponseDecorator =
    status === 'created' ? ApiCreatedResponse : ApiOkResponse;

  return applyDecorators(
    ApiExtraModels(StandardResponse, model, ErrorResponse),
    ResponseDecorator({
      description: 'Successful response',
      schema: {
        allOf: [
          { $ref: getSchemaPath(StandardResponse) },
          {
            properties: {
              data: isArray
                ? {
                    type: 'array',
                    items: { $ref: getSchemaPath(model) },
                  }
                : { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
    ApiBadRequestResponse({
      description: 'Bad Request',
      type: ErrorResponse,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      type: ErrorResponse,
    }),
    ApiForbiddenResponse({
      description: 'Forbidden',
      type: ErrorResponse,
    }),
    ApiNotFoundResponse({
      description: 'Not Found',
      type: ErrorResponse,
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal Server Error',
      type: ErrorResponse,
    }),
  );
};
```

### 3. Create Standard DTOs

**File: `src/common/dto/standard-response.dto.ts`**
```typescript
import { ApiProperty } from '@nestjs/swagger';

export class StandardResponse<T = any> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;

  @ApiProperty()
  data?: T;

  @ApiProperty({ example: '2025-12-27T10:00:00Z' })
  timestamp: string;

  constructor(data?: T, message = 'Success') {
    this.success = true;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}
```

**File: `src/common/dto/error-response.dto.ts`**
```typescript
import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Error message' })
  message: string;

  @ApiProperty({ example: 'BAD_REQUEST' })
  error?: string;

  @ApiProperty({ example: ['field1 is required', 'field2 must be a string'] })
  details?: string[];

  @ApiProperty({ example: '2025-12-27T10:00:00Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/v1/patients' })
  path?: string;

  constructor(message: string, error?: string, details?: string[], path?: string) {
    this.success = false;
    this.message = message;
    this.error = error;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.path = path;
  }
}
```

**File: `src/common/dto/pagination.dto.ts`**
```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, Max } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;
}

export class PaginatedResponse<T> {
  @ApiProperty()
  data: T[];

  @ApiProperty()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.meta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
```

**File: `src/common/dto/filter.dto.ts`**
```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class FilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
```

### 4. Create Exception Filters

**File: `src/common/filters/http-exception.filter.ts`**
```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponse } from '../dto/error-response.dto';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = exception.message;
    let details: string[] | undefined;

    if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
      const responseMessage = (exceptionResponse as any).message;
      if (Array.isArray(responseMessage)) {
        details = responseMessage;
        message = 'Validation failed';
      } else {
        message = responseMessage;
      }
    }

    const errorResponse = new ErrorResponse(
      message,
      HttpStatus[status],
      details,
      request.url,
    );

    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
      exception.stack,
    );

    response.status(status).json(errorResponse);
  }
}
```

**File: `src/common/filters/all-exceptions.filter.ts`**
```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponse } from '../dto/error-response.dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errorResponse = new ErrorResponse(
      message,
      HttpStatus[status],
      undefined,
      request.url,
    );

    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
      exception instanceof Error ? exception.stack : 'No stack trace',
    );

    response.status(status).json(errorResponse);
  }
}
```

### 5. Create Interceptors

**File: `src/common/interceptors/transform.interceptor.ts`**
```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StandardResponse } from '../dto/standard-response.dto';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data is already a StandardResponse, return it
        if (data instanceof StandardResponse) {
          return data;
        }
        // Otherwise, wrap it
        return new StandardResponse(data);
      }),
    );
  }
}
```

**File: `src/common/interceptors/logging.interceptor.ts`**
```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  private readonly enableRequestLogging =
    process.env.ENABLE_REQUEST_LOGGING === 'true';

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (!this.enableRequestLogging) {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, body, query, params } = request;
    const now = Date.now();

    this.logger.log(
      `Incoming Request: ${method} ${url} - Body: ${JSON.stringify(body)} - Query: ${JSON.stringify(query)} - Params: ${JSON.stringify(params)}`,
    );

    return next.handle().pipe(
      tap((data) => {
        const delay = Date.now() - now;
        this.logger.log(
          `Outgoing Response: ${method} ${url} - Status: ${response.statusCode} - ${delay}ms - Data: ${JSON.stringify(data)}`,
        );
      }),
    );
  }
}
```

### 6. Create Pipes

**File: `src/common/pipes/parse-uuid.pipe.ts`**
```typescript
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validate as isUuid } from 'uuid';

@Injectable()
export class ParseUUIDPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!isUuid(value)) {
      throw new BadRequestException('Invalid UUID format');
    }
    return value;
  }
}
```

### 7. Update `main.ts` to Use Filters and Interceptors

**File: `src/main.ts`** (update):
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN'),
    credentials: true,
  });

  // Cookie parser
  app.use(cookieParser());

  // Global filters (order matters - most specific first)
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new HttpExceptionFilter(),
  );

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Dental Clinic Management API')
    .setDescription('API documentation for Dental Clinic Management System')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addCookieAuth('refresh_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refresh_token',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
```

### 8. Update `.env` File

Add the following:
```env
# Logging
ENABLE_REQUEST_LOGGING=false
```

## Acceptance Criteria

- [ ] All common decorators created and working
- [ ] Standard response and error DTOs created
- [ ] Pagination and filter DTOs created
- [ ] Exception filters implemented
- [ ] Interceptors implemented
- [ ] Base entity with audit fields created
- [ ] Application starts without errors
- [ ] Swagger documentation updated with new DTOs
- [ ] No TypeScript compilation errors

## Testing Steps

1. **Restart application**:
   ```bash
   npm run start:dev
   ```

2. **Verify Swagger**:
   - Visit `http://localhost:3000/api/docs`
   - Check that StandardResponse and ErrorResponse schemas are visible

3. **Test error handling** (create a test endpoint):
   - Create a simple test controller to verify filters work
   - Throw an error and verify the response format

4. **Verify logging**:
   - Set `ENABLE_REQUEST_LOGGING=true` in `.env`
   - Make a request and check console logs
   - Set back to `false`

## Files Created

```
src/common/
├── decorators/
│   ├── current-user.decorator.ts
│   ├── roles.decorator.ts
│   ├── public.decorator.ts
│   └── api-standard-response.decorator.ts
├── dto/
│   ├── standard-response.dto.ts
│   ├── error-response.dto.ts
│   ├── pagination.dto.ts
│   └── filter.dto.ts
├── entities/
│   └── base.entity.ts
├── filters/
│   ├── http-exception.filter.ts
│   └── all-exceptions.filter.ts
├── interceptors/
│   ├── transform.interceptor.ts
│   └── logging.interceptor.ts
└── pipes/
    └── parse-uuid.pipe.ts
```

## Common Issues & Solutions

1. **Import errors**: Ensure all imports are correct
2. **Swagger not showing DTOs**: Check `@ApiExtraModels` decorator
3. **Filters not working**: Verify order in `main.ts`

## Next Steps

After completing this prompt:
- Proceed to **Prompt 3: Database Entities and Migrations**
- Do not proceed until all acceptance criteria are met

## Notes

- These utilities will be used across all modules
- Test thoroughly as they form the foundation
- Commit your changes after successful completion

---

**Estimated Time**: 45-60 minutes
**Difficulty**: Medium-High
**Dependencies**: Prompt 1
