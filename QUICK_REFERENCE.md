# Quick Reference Guide

## 📋 Prompt Execution Checklist

Use this checklist when executing each prompt:

### Before Starting a Prompt

- [ ] Previous prompt completed successfully
- [ ] All acceptance criteria from previous prompt met
- [ ] Changes committed to git
- [ ] Starting in a **fresh conversation** (new context)
- [ ] Read the entire prompt before starting

### During Execution

- [ ] Following tasks sequentially
- [ ] Not skipping any steps
- [ ] Checking code for errors as you go
- [ ] Testing incrementally
- [ ] Using Context7 for library documentation when needed

### After Completion

- [ ] All acceptance criteria met
- [ ] All testing steps completed successfully
- [ ] No TypeScript compilation errors
- [ ] Application runs without errors
- [ ] Changes committed to git
- [ ] INDEX.md updated with status

## 🎯 Quick Commands Reference

### Project Setup
```bash
# Navigate to project
cd "/Users/rachidzaiter/Documents/DENTIL CLINIC 2"

# Create backend directory
mkdir -p backend

# Navigate to backend
cd backend
```

### NestJS Commands
```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Build project
npm run build

# Run in production mode
npm run start:prod
```

### MikroORM Commands
```bash
# Create migration
npm run migration:create -- --name=migration_name

# Run migrations
npm run migration:up

# Rollback migration
npm run migration:down

# Fresh database (drop and recreate)
npm run migration:fresh

# View MikroORM help
npm run mikro-orm -- --help
```

### Database Commands
```bash
# Create database
createdb dental_clinic

# Connect to database
psql -U postgres -d dental_clinic

# List tables
\dt

# Describe table
\d+ table_name

# Drop database (careful!)
dropdb dental_clinic
```

### Git Commands
```bash
# Initialize repository
git init

# Add files
git add .

# Commit
git commit -m "feat: completed prompt X - description"

# Create tag after phase
git tag -a "phase-1-complete" -m "Completed Phase 1"

# View history
git log --oneline
```

## 🔍 Troubleshooting Quick Guide

### Application Won't Start

1. Check PostgreSQL is running:
   ```bash
   pg_isready
   ```

2. Check environment variables:
   ```bash
   cat .env
   ```

3. Check for TypeScript errors:
   ```bash
   npm run build
   ```

4. Check logs in terminal

### Migration Errors

1. Check entity decorators
2. Verify database connection
3. Check migration file syntax
4. Try dropping and recreating database (development only)

### Import Errors

1. Check file paths
2. Verify exports in index files
3. Check tsconfig.json paths
4. Rebuild project

### Swagger Not Loading

1. Check main.ts configuration
2. Verify decorators on DTOs
3. Check for circular dependencies
4. Clear browser cache

## 📊 Progress Tracking Template

Copy this to track your progress:

```markdown
## My Progress

**Started**: [Date]
**Target Completion**: [Date]

### Phase 1: Foundation
- [ ] Prompt 1: Project Setup (Est: 30-45 min) - Started: ___ Completed: ___
- [ ] Prompt 2: Common Module (Est: 45-60 min) - Started: ___ Completed: ___
- [ ] Prompt 3: Entities (Est: 60-90 min) - Started: ___ Completed: ___

### Phase 2: Security
- [ ] Prompt 4: Auth Module (Est: 60-75 min) - Started: ___ Completed: ___
- [ ] Prompt 5: RBAC Guards (Est: 30-45 min) - Started: ___ Completed: ___
- [ ] Prompt 6: User Management (Est: 45-60 min) - Started: ___ Completed: ___

### Phase 3: Core Business
- [ ] Prompt 7: Organization (Est: 45-60 min) - Started: ___ Completed: ___
- [ ] Prompt 8: Patient Module (Est: 60-75 min) - Started: ___ Completed: ___
- [ ] Prompt 9: Appointment Module (Est: 60-75 min) - Started: ___ Completed: ___
- [ ] Prompt 10: Treatment Module (Est: 60-75 min) - Started: ___ Completed: ___
- [ ] Prompt 11: Payment Module (Est: 45-60 min) - Started: ___ Completed: ___
- [ ] Prompt 12: Expense Module (Est: 45-60 min) - Started: ___ Completed: ___
- [ ] Prompt 13: Settings Module (Est: 60-75 min) - Started: ___ Completed: ___

### Phase 4: Advanced
- [ ] Prompt 14: Doctor Wallet (Est: 45-60 min) - Started: ___ Completed: ___
- [ ] Prompt 15: Revenue & Analytics (Est: 60-75 min) - Started: ___ Completed: ___
- [ ] Prompt 16: Notification Service (Est: 90-120 min) - Started: ___ Completed: ___

### Phase 5: Frontend
- [ ] Prompt 17: Swagger Client (Est: 30-45 min) - Started: ___ Completed: ___
- [ ] Prompt 18: Frontend API (Est: 90-120 min) - Started: ___ Completed: ___
- [ ] Prompt 19: Form Validation (Est: 60-90 min) - Started: ___ Completed: ___
- [ ] Prompt 20: RBAC UI (Est: 60-75 min) - Started: ___ Completed: ___

### Phase 6: Deployment
- [ ] Prompt 21: API Testing (Est: 60-90 min) - Started: ___ Completed: ___
- [ ] Prompt 22: Production Ready (Est: 45-60 min) - Started: ___ Completed: ___

**Total Time Spent**: ___ hours
**Issues Encountered**: ___
**Notes**: ___
```

## 🎯 Key Files Reference

### Configuration Files
```
backend/api/
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── nest-cli.json                 # NestJS config
└── src/
    └── mikro-orm.config.ts       # ORM configuration
```

### Core Application Files
```
src/
├── main.ts                       # Application entry point
├── app.module.ts                 # Root module
├── config/                       # Configuration modules
├── common/                       # Shared utilities
│   ├── decorators/              # Custom decorators
│   ├── filters/                 # Exception filters
│   ├── interceptors/            # Interceptors
│   ├── pipes/                   # Validation pipes
│   ├── guards/                  # Auth guards
│   ├── dto/                     # Shared DTOs
│   └── entities/                # Database entities
└── modules/                     # Feature modules
    ├── auth/
    ├── users/
    ├── patients/
    ├── appointments/
    ├── treatments/
    ├── payments/
    ├── expenses/
    └── settings/
```

## 🔗 Important URLs

### Development
- **API**: http://localhost:3000/api/v1
- **Swagger**: http://localhost:3000/api/docs
- **Frontend**: http://localhost:3001

### Documentation
- **NestJS**: https://docs.nestjs.com
- **MikroORM**: https://mikro-orm.io
- **PostgreSQL**: https://www.postgresql.org/docs

## 💡 Best Practices Reminders

### Code Quality
- ✅ Use TypeScript strict mode
- ✅ Follow NestJS conventions
- ✅ Use dependency injection
- ✅ Keep controllers thin
- ✅ Business logic in services
- ✅ Data access in repositories

### Security
- ✅ Never commit .env files
- ✅ Hash passwords with bcrypt
- ✅ Validate all inputs
- ✅ Use parameterized queries
- ✅ Implement rate limiting
- ✅ Use HTTPS in production

### Database
- ✅ Always use migrations
- ✅ Never modify migrations after running
- ✅ Use transactions for multi-step operations
- ✅ Add indexes for frequently queried fields
- ✅ Use proper data types
- ✅ Implement soft deletes where needed

### API Design
- ✅ Use standard HTTP methods
- ✅ Return proper status codes
- ✅ Implement pagination
- ✅ Version your APIs
- ✅ Document with Swagger
- ✅ Use standard response format

## 📞 Getting Help

### When Stuck
1. Check the prompt's "Common Issues" section
2. Review the acceptance criteria
3. Verify prerequisites are met
4. Check the dependencies graph
5. Use Context7 for library docs
6. Review previous prompts

### Before Asking for Help
- [ ] Read the entire prompt
- [ ] Checked error messages
- [ ] Verified environment variables
- [ ] Checked database connection
- [ ] Reviewed recent changes
- [ ] Tried rebuilding the project

---

**Keep this guide handy while executing prompts!**
