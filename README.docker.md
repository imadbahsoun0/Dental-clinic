# Docker Setup for Dental Clinic

This project includes Docker configurations for both production and development environments.

## Prerequisites

- Docker (v20.10+)
- Docker Compose (v2.0+)

## Production Environment

The production setup builds optimized images and runs the application in production mode.

### Start Services

```bash
docker-compose up -d
```

### Stop Services

```bash
docker-compose down
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Rebuild Images

```bash
docker-compose up -d --build
```

## Development Environment

The development setup includes hot-reload for both backend and frontend with volume mounts.

### Start Services

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Stop Services

```bash
docker-compose -f docker-compose.dev.yml down
```

### View Logs

```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### Rebuild Images

```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

## Service URLs

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **PostgreSQL**: localhost:5432

## Database Management

### Access PostgreSQL Container

```bash
docker exec -it dental-clinic-db psql -U postgres -d dental_clinic
```

### Backup Database

```bash
docker exec dental-clinic-db pg_dump -U postgres dental_clinic > backup.sql
```

### Restore Database

```bash
docker exec -i dental-clinic-db psql -U postgres dental_clinic < backup.sql
```

### Run Migrations

Migrations run automatically on container startup. To run manually:

```bash
# Production
docker exec dental-clinic-backend npm run migration:up

# Development
docker exec dental-clinic-backend-dev npm run migration:up
```

## Environment Variables

Update environment variables in:
- `docker-compose.yml` for production
- `docker-compose.dev.yml` for development

Or create a `.env` file in the root directory:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=dental_clinic

# Backend Port
BACKEND_PORT=3000

# Frontend Port
FRONTEND_PORT=3001
```

## Troubleshooting

### Reset Everything

```bash
# Stop and remove containers, volumes, and networks
docker-compose down -v

# Rebuild from scratch
docker-compose up -d --build
```

### Check Container Status

```bash
docker-compose ps
```

### Access Container Shell

```bash
# Backend
docker exec -it dental-clinic-backend sh

# Frontend
docker exec -it dental-clinic-frontend sh

# Database
docker exec -it dental-clinic-db sh
```

### Remove All Images

```bash
docker-compose down --rmi all
```

## Production Deployment Notes

1. **Change JWT Secrets**: Update `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` in production
2. **Update CORS**: Set `CORS_ORIGIN` to your production frontend URL
3. **Configure Email**: Update SMTP settings with production credentials
4. **AWS Configuration**: Update AWS credentials if using S3/SQS
5. **Database Backup**: Set up automated database backups
6. **SSL/TLS**: Configure reverse proxy (nginx) for HTTPS
7. **Resource Limits**: Add resource limits in docker-compose.yml:

```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

## Network Architecture

All services run on an isolated bridge network (`dental-clinic-network`), allowing internal communication while exposing only necessary ports to the host.

```
Host Machine
├── Port 3001 → Frontend Container
├── Port 3000 → Backend Container
└── Port 5432 → PostgreSQL Container

dental-clinic-network (bridge)
├── frontend (communicates with backend via internal DNS)
├── backend (communicates with postgres via internal DNS)
└── postgres
```
