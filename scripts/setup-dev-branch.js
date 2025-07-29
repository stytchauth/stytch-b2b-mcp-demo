#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'late-silence-21816472';

function runCommand(command, description) {
  console.log(`\n${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    return output.trim();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (error.stdout) console.log('stdout:', error.stdout);
    if (error.stderr) console.log('stderr:', error.stderr);
    throw error;
  }
}

function getUserName() {
  try {
    return execSync('git config user.name', { encoding: 'utf8' }).trim().toLowerCase().replace(/\s+/g, '-');
  } catch {
    return 'dev';
  }
}

async function main() {
  console.log('🚀 Setting up your personal development branch...\n');

  // Get developer name for branch naming
  const userName = getUserName();
  const branchName = `dev-${userName}-${Date.now()}`;
  
  console.log(`Creating branch: ${branchName}`);

  try {
    // Check if neon CLI is available
    runCommand('neon --version', 'Checking Neon CLI');

    // Create the branch
    const createOutput = runCommand(
      `neon branches create --project-id ${PROJECT_ID} --name ${branchName} --parent main`,
      `Creating development branch "${branchName}"`
    );

    // Extract connection details
    const pooledConnectionString = runCommand(
      `neon connection-string --project-id ${PROJECT_ID} --branch ${branchName} --database-name stytch --pooled`,
      'Getting pooled connection string'
    );

    const unpooledConnectionString = runCommand(
      `neon connection-string --project-id ${PROJECT_ID} --branch ${branchName} --database-name stytch`,
      'Getting unpooled connection string'
    );

    // Parse connection details for individual parameters
    const url = new URL(pooledConnectionString);
    const host = url.hostname;
    const unpooledUrl = new URL(unpooledConnectionString);
    const unpooledHost = unpooledUrl.hostname;

    console.log('\n✅ Branch created successfully!');
    console.log('\n📝 Update your .env.local file with these values:\n');

    console.log(`# Database Configuration - Your Personal Development Branch`);
    console.log(`DATABASE_URL=${pooledConnectionString}`);
    console.log(`DATABASE_URL_UNPOOLED=${unpooledConnectionString}`);
    console.log(`PGHOST=${host}`);
    console.log(`PGHOST_UNPOOLED=${unpooledHost}`);
    console.log(`PGUSER=${url.username}`);
    console.log(`PGDATABASE=${url.pathname.slice(1)}`);
    console.log(`PGPASSWORD=${url.password}`);
    console.log(`POSTGRES_URL=${pooledConnectionString}`);
    console.log(`POSTGRES_URL_NON_POOLING=${unpooledConnectionString}`);
    console.log(`POSTGRES_HOST=${host}`);
    console.log(`POSTGRES_PASSWORD=${url.password}`);
    console.log(`POSTGRES_DATABASE=${url.pathname.slice(1)}`);
    console.log(`POSTGRES_URL_NO_SSL=${pooledConnectionString.replace('?sslmode=require&channel_binding=require', '')}`);
    console.log(`POSTGRES_PRISMA_URL=${pooledConnectionString}`);

    // Initialize database tables
    console.log('\n🗃️  Initializing database tables...');
    runCommand(
      `DATABASE_URL="${pooledConnectionString}" npm run migrate`,
      'Setting up database tables'
    );

    console.log('\n🎉 Setup complete!');
    console.log('\nNext steps:');
    console.log('1. Copy the environment variables above to your .env.local file');
    console.log('2. Run: npm run dev');
    console.log('3. Your app will now use your personal development database branch');
    console.log(`\nYour branch name: ${branchName}`);
    console.log(`\n💡 To delete this branch later: neon branches delete ${branchName} --project-id ${PROJECT_ID}`);

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\nPlease ensure:');
    console.log('1. Neon CLI is installed and authenticated');
    console.log('2. You have access to the Neon project');
    console.log('3. You have permission to create branches');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main }; 