#!/usr/bin/env ts-node
import { MikroORM } from '@mikro-orm/core';
import * as readline from 'readline';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { join } from 'path';
import mikroOrmConfig from '../common/config/mikro-orm.config';
import { Organization } from '../common/entities/organization.entity';
import { User } from '../common/entities/user.entity';
import { UserOrganization } from '../common/entities/user-organization.entity';
import { UserRole } from '../common/decorators/roles.decorator';

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createOrganization() {
  let orm: MikroORM | undefined;

  try {
    console.log('🏥 Creating New Organization and Admin User\n');
    console.log('='.repeat(50));

    // Get organization details
    const orgName = await question('Organization Name: ');
    if (!orgName.trim()) {
      throw new Error('Organization name is required');
    }

    const orgLocation = await question('Location (optional): ');
    const orgPhone = await question('Phone (optional): ');
    const orgEmail = await question('Email (optional): ');
    const orgWebsite = await question('Website (optional): ');
    const timeZone = await question('Time Zone (default: UTC): ') || 'UTC';

    console.log('\n' + '='.repeat(50));
    console.log('👤 Admin User Details\n');

    // Get admin user details
    const userName = await question('Admin Name: ');
    if (!userName.trim()) {
      throw new Error('Admin name is required');
    }

    const userEmail = await question('Admin Email: ');
    if (!userEmail.trim()) {
      throw new Error('Admin email is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      throw new Error('Invalid email format');
    }

    const userPhone = await question('Admin Phone (optional): ');

    // Get password (with hidden input would be better, but keeping it simple)
    const password = await question('Admin Password: ');
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const confirmPassword = await question('Confirm Password: ');
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    console.log('\n' + '='.repeat(50));
    console.log('📝 Summary:\n');
    console.log(`Organization: ${orgName}`);
    if (orgLocation) console.log(`Location: ${orgLocation}`);
    if (orgPhone) console.log(`Phone: ${orgPhone}`);
    if (orgEmail) console.log(`Email: ${orgEmail}`);
    if (orgWebsite) console.log(`Website: ${orgWebsite}`);
    console.log(`Time Zone: ${timeZone}`);
    console.log(`\nAdmin: ${userName} (${userEmail})`);
    if (userPhone) console.log(`Phone: ${userPhone}`);
    console.log('='.repeat(50));

    const confirm = await question('\nCreate this organization? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('❌ Operation cancelled');
      rl.close();
      return;
    }

    console.log('\n⏳ Connecting to database...');

    // Initialize MikroORM
    orm = await MikroORM.init(mikroOrmConfig);
    const em = orm.em.fork();

    console.log('✅ Connected to database');
    console.log('⏳ Creating organization...');

    // Check if organization with same name exists
    const existingOrg = await em.findOne(Organization, { name: orgName });
    if (existingOrg) {
      throw new Error(`Organization with name "${orgName}" already exists`);
    }

    // Check if user with same email exists (case-insensitive)
    const existingUser = await em.findOne(User, { email: userEmail.toLowerCase() });
    if (existingUser) {
      throw new Error(`User with email "${userEmail}" already exists`);
    }

    // Create organization
    const organization = new Organization(orgName);
    organization.location = orgLocation || undefined;
    organization.phone = orgPhone || undefined;
    organization.email = orgEmail || undefined;
    organization.website = orgWebsite || undefined;
    organization.timeZone = timeZone;
    organization.isActive = true;

    await em.persistAndFlush(organization);
    console.log(`✅ Organization created with ID: ${organization.id}`);

    // Hash password
    console.log('⏳ Creating admin user...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const user = new User(userName, userEmail, hashedPassword);
    user.phone = userPhone || undefined;
    // User doesn't need orgId since it can belong to multiple orgs
    user.orgId = organization.id; // Set to first org for reference

    await em.persistAndFlush(user);
    console.log(`✅ Admin user created with ID: ${user.id}`);

    // Create user-organization relationship
    console.log('⏳ Creating user-organization relationship...');
    const userOrg = new UserOrganization(user, organization.id, UserRole.ADMIN);
    userOrg.organization = organization;

    await em.persistAndFlush(userOrg);
    console.log(`✅ User-organization relationship created with ID: ${userOrg.id}`);

    console.log('\n' + '='.repeat(50));
    console.log('🎉 SUCCESS! Organization and admin user created.\n');
    console.log('Organization Details:');
    console.log(`  ID: ${organization.id}`);
    console.log(`  Name: ${organization.name}`);
    console.log(`\nAdmin User Details:`);
    console.log(`  ID: ${user.id}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${UserRole.ADMIN}`);
    console.log('='.repeat(50));

  } catch (error: unknown) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    rl.close();
    if (orm) {
      await orm.close(true);
    }
  }
}

// Run the script
createOrganization()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
