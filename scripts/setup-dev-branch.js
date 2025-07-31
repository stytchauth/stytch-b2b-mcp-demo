#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get project ID from environment variable
const PROJECT_ID = process.env.NEON_PROJECT_ID;

if (!PROJECT_ID) {
  console.error('❌ Error: NEON_PROJECT_ID environment variable is required');
  console.log('\nPlease set your Neon project ID:');
  console.log('export NEON_PROJECT_ID="your-project-id"');
  console.log('\nOr add it to your shell profile (.bashrc, .zshrc, etc.):');
  console.log('echo "export NEON_PROJECT_ID=your-project-id" >> ~/.zshrc');
  console.log(
    '\nYou can find your project ID in the Neon dashboard or by running:'
  );
  console.log('neon projects list');
  process.exit(1);
}

function runCommand(command, description) {
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    return output.trim();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
}

function getUserName() {
  try {
    return execSync('git config user.name', { encoding: 'utf8' })
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');
  } catch {
    return 'dev';
  }
}

async function main() {
  console.log('🚀 Setting up your personal development branch...\n');

  // Get developer name for branch naming
  const userName = getUserName();
  const branchName = `dev-${userName}-${Date.now()}`;

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

    // Check if .env.local exists
    const envLocalPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envLocalPath)) {
      throw new Error(
        '.env.local file not found. Please create a .env.local file first.'
      );
    }

    console.log('\n✅ Branch created successfully!');
    console.log('\n📝 Writing database configuration to .env.local...');

    // Prepare environment variables
    const envVars = [
      `# Database Configuration - Your Personal Development Branch`,
      `DATABASE_URL=${pooledConnectionString}`,
      `DATABASE_URL_UNPOOLED=${unpooledConnectionString}`,
      '', // Empty line at the end
    ].join('\n');

    // Write to .env.local
    fs.appendFileSync(envLocalPath, '\n' + envVars);

    // Initialize database tables
    runCommand(
      `DATABASE_URL="${pooledConnectionString}" npm run migrate`,
      'Setting up database tables'
    );

    console.log('\n🎉 Setup complete!');
    console.log('\nNext steps:');
    console.log(
      '1. Environment variables have been written to your .env.local file'
    );
    console.log('2. Run: npm run dev');
    console.log(
      '3. Your app will now use your personal development database branch'
    );
    console.log(`\nYour branch name: ${branchName}`);
    console.log(
      `\n💡 To delete this branch later: neon branches delete ${branchName} --project-id ${PROJECT_ID}`
    );
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\nPlease ensure:');
    console.log('1. Neon CLI is installed and authenticated');
    console.log('2. You have access to the Neon project');
    console.log('3. You have permission to create branches');
    console.log('4. .env.local file exists in the project root');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
