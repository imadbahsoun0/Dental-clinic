# Prompt 1: NestJS Project Initialization with MikroORM

## Objective
Initialize a production-ready NestJS project with MikroORM, PostgreSQL, and essential dependencies for the Dental Clinic Management API service.

## Context
- This is the first prompt in the implementation plan
- No backend code exists yet
- Frontend is already built and located in `/frontend` directory
- We're building a multi-tenant SaaS application

## Prerequisites
- Node.js LTS version installed
- PostgreSQL installed and running
- Access to Context7 for documentation

## Tasks

### 1. Create NestJS Project Structure
```bash
cd backend
npx @nestjs/cli new api --package-manager npm
cd api
```

### 2. Install Core Dependencies
Install the following packages:

**MikroORM & Database**:
```bash
npm install @mikro-orm/core @mikro-orm/postgresql @mikro-orm/migrations @mikro-orm/cli pg
```

**Authentication & Security**:
```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt
```

**Validation & Transformation**:
```bash
npm install class-validator class-transformer
```

**Configuration**:
```bash
npm install @nestjs/config
```

**Swagger**:
```bash
npm install @nestjs/swagger swagger-ui-express
```

**AWS SDK (for SQS)**:
```bash
npm install @aws-sdk/client-sqs
```

**Email**:
```bash
npm install nodemailer
npm install -D @types/nodemailer
```

**Utilities**:
```bash
npm install uuid
npm install -D @types/uuid
```

### 3. Project Structure Setup
Create the following directory structure under `src/`:

```
src/
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   ├── dto/
│   └── entities/
├── modules/
│   └── (will be created in later prompts)
├── config/
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── app.config.ts
├── mikro-orm.config.ts
├── main.ts
└── app.module.ts
```

### 4. Configure MikroORM

**Create `src/mikro-orm.config.ts`**:
```typescript
import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';

const config: Options = {
  driver: PostgreSqlDriver,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  dbName: process.env.DB_NAME || 'dental_clinic',
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/migrations',
    snapshot: false, // Disable snapshots for production
    disableForeignKeys: false,
  },
  extensions: [Migrator],
  debug: process.env.NODE_ENV !== 'production',
  allowGlobalContext: true, // For CLI usage
};

export default config;
```

**Create `src/config/database.config.ts`**:
```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  dbName: process.env.DB_NAME || 'dental_clinic',
}));
```

### 5. Configure Environment Variables

**Create `.env` file**:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=dental_clinic

# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# JWT
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:3001

# AWS SQS (will be configured later)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SQS_QUEUE_URL=

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

# WAHA WhatsApp Service
WAHA_API_URL=
WAHA_API_KEY=
```

**Create `.env.example`** (same as above but without sensitive values)

### 6. Update `package.json` Scripts

Add the following scripts:
```json
{
  "scripts": {
    "mikro-orm": "mikro-orm",
    "migration:create": "mikro-orm migration:create",
    "migration:up": "mikro-orm migration:up",
    "migration:down": "mikro-orm migration:down",
    "migration:fresh": "mikro-orm migration:fresh",
    "schema:drop": "mikro-orm schema:drop --run",
    "schema:create": "mikro-orm schema:create --run",
    "schema:update": "mikro-orm schema:update --run"
  }
}
```

### 7. Configure Main Application

**Update `src/main.ts`**:
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

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

### 8. Update `app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import databaseConfig from './config/database.config';
import mikroOrmConfig from './mikro-orm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      envFilePath: '.env',
    }),
    MikroOrmModule.forRoot(mikroOrmConfig),
  ],
})
export class AppModule {}
```

### 9. Create Database

```bash
# Create PostgreSQL database
createdb dental_clinic

# Or using psql
psql -U postgres -c "CREATE DATABASE dental_clinic;"
```

### 10. Install cookie-parser

```bash
npm install cookie-parser
npm install -D @types/cookie-parser
```

## Acceptance Criteria

- [ ] NestJS project created in `backend/api` directory
- [ ] All dependencies installed successfully
- [ ] Directory structure created as specified
- [ ] MikroORM configured with PostgreSQL
- [ ] Environment variables set up
- [ ] Database created
- [ ] Application starts without errors: `npm run start:dev`
- [ ] Swagger accessible at `http://localhost:3000/api/docs`
- [ ] No TypeScript compilation errors
- [ ] Git repository initialized with proper `.gitignore`

## Testing Steps

1. **Install dependencies**:
   ```bash
   cd backend/api
   npm install
   ```

2. **Create database**:
   ```bash
   createdb dental_clinic
   ```

3. **Start application**:
   ```bash
   npm run start:dev
   ```

4. **Verify**:
   - Application starts on port 3000
   - Visit `http://localhost:3000/api/docs` - Swagger UI should load
   - No errors in console

5. **Test MikroORM CLI**:
   ```bash
   npm run mikro-orm -- --help
   ```
   Should display MikroORM CLI help

## Files to Create

```
backend/api/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── nest-cli.json
└── src/
    ├── main.ts
    ├── app.module.ts
    ├── mikro-orm.config.ts
    ├── common/
    │   ├── decorators/
    │   ├── filters/
    │   ├── guards/
    │   ├── interceptors/
    │   ├── pipes/
    │   ├── dto/
    │   └── entities/
    ├── config/
    │   └── database.config.ts
    └── modules/
```

## Common Issues & Solutions

1. **PostgreSQL connection error**: Verify PostgreSQL is running and credentials are correct
2. **Port already in use**: Change PORT in `.env` file
3. **MikroORM CLI not working**: Ensure `mikro-orm.config.ts` is in the correct location

## Next Steps

After completing this prompt:
- Proceed to **Prompt 2: Common Module Setup**
- Do not proceed until all acceptance criteria are met

## Notes

- Keep the terminal open to see hot-reload working
- Use Context7 if you need documentation for any library
- Commit your changes after successful completion

---

**Estimated Time**: 30-45 minutes
**Difficulty**: Medium
**Dependencies**: None (first prompt)
