# Prompt 22: Production Readiness

## Objective
Prepare the application for production deployment with security hardening, performance optimization, logging, monitoring, and deployment configuration.

## Context
- All prompts 1-21 completed
- Application fully functional
- Need to prepare for production

## Prerequisites
- All previous prompts completed
- Application tested and working

## Tasks

### 1. Environment Configuration

**File: `backend/api/.env.production`**
```env
# Database
DB_HOST=your-production-db-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
DB_NAME=dental_clinic_prod

# JWT
JWT_ACCESS_SECRET=your-very-secure-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-very-secure-refresh-secret-min-32-chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=https://yourdomain.com

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/account/queue

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# WhatsApp
WAHA_URL=https://your-waha-instance.com
WAHA_SESSION=production

# App
NODE_ENV=production
PORT=3000
```

### 2. Security Hardening

**Install Security Packages**
```bash
npm install helmet express-rate-limit
```

**File: `src/main.ts`** (update)
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  });

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP',
    }),
  );

  // Middleware
  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger (disable in production or protect)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Dental Clinic API')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT-auth')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
```

### 3. Logging Configuration

**Install Winston**
```bash
npm install winston nest-winston
```

**File: `src/config/logger.config.ts`**
```typescript
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const loggerConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context }) => {
          return `${timestamp} [${context}] ${level}: ${message}`;
        }),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});
```

### 4. Database Optimization

**Add Indexes** (if not already done)
```typescript
// In entities, ensure indexes on frequently queried fields
@Index({ properties: ['orgId'] })
@Index({ properties: ['email', 'orgId'] })
@Index({ properties: ['date', 'orgId'] })
```

**Connection Pooling** (MikroORM config)
```typescript
export default {
  // ... other config
  pool: {
    min: 2,
    max: 10,
  },
} as Options;
```

### 5. Build and Deployment Scripts

**File: `package.json`** (add scripts)
```json
{
  "scripts": {
    "build": "nest build",
    "start:prod": "node dist/main",
    "migration:run:prod": "NODE_ENV=production mikro-orm migration:up",
    "migration:create:prod": "NODE_ENV=production mikro-orm migration:create"
  }
}
```

### 6. Docker Setup (Optional)

**File: `Dockerfile`**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/migrations ./src/migrations

EXPOSE 3000

CMD ["node", "dist/main"]
```

**File: `docker-compose.yml`**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: dental_clinic_prod
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your-password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  postgres-data:
```

### 7. Frontend Production Build

**File: `frontend/.env.production`**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

**Build Frontend**
```bash
cd frontend
npm run build
```

### 8. Nginx Configuration

**File: `/etc/nginx/sites-available/dental-clinic`**
```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 9. SSL Configuration (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 10. PM2 Process Manager

**Install PM2**
```bash
npm install -g pm2
```

**File: `ecosystem.config.js`**
```javascript
module.exports = {
  apps: [
    {
      name: 'dental-clinic-api',
      script: 'dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'dental-clinic-notifications',
      script: '../notification-service/dist/main.js',
      instances: 1,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

**Start with PM2**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates obtained
- [ ] Backup strategy in place

### Deployment Steps
1. [ ] Build backend: `npm run build`
2. [ ] Build frontend: `npm run build`
3. [ ] Run migrations: `npm run migration:run:prod`
4. [ ] Start services with PM2
5. [ ] Configure Nginx
6. [ ] Enable SSL
7. [ ] Test all endpoints
8. [ ] Monitor logs

### Post-Deployment
- [ ] Verify all features working
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Set up backups
- [ ] Document deployment process

## Security Checklist

- [ ] HTTPS enabled
- [ ] Secure cookies (httpOnly, secure, sameSite)
- [ ] Rate limiting enabled
- [ ] Helmet middleware active
- [ ] CORS properly configured
- [ ] SQL injection prevention (ORM)
- [ ] XSS protection
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] JWT secrets strong (32+ chars)
- [ ] Swagger disabled or protected in production

## Monitoring & Maintenance

### Logging
- Check `logs/error.log` daily
- Monitor `logs/combined.log` for patterns
- Set up log rotation

### Database
- Regular backups (daily)
- Monitor query performance
- Check disk space

### Performance
- Monitor API response times
- Check memory usage
- Monitor CPU usage
- Database connection pool

## Acceptance Criteria

- [ ] Production environment configured
- [ ] Security hardening complete
- [ ] Logging configured
- [ ] Docker setup (optional)
- [ ] Nginx configured
- [ ] SSL enabled
- [ ] PM2 running services
- [ ] All security checks passed
- [ ] Deployment documented
- [ ] Monitoring in place

## Congratulations!

Your Dental Clinic Management System is now production-ready! 🎉

---
**Estimated Time**: 45-60 minutes
**Difficulty**: Medium-High
**Dependencies**: Prompts 1-21
