#!/usr/bin/env node

/**
 * Test setup script for SMS notification system
 * Installs dependencies and runs initial test suite
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Setting up SMS notification tests...\n');

// Check if package.json exists
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found. Please run from project root.');
  process.exit(1);
}

// Install test dependencies
console.log('📦 Installing test dependencies...');
try {
  execSync('npm install --save-dev @jest/globals @testing-library/jest-dom @testing-library/react @testing-library/user-event jest jest-environment-jsdom node-mocks-http ts-jest', {
    stdio: 'inherit'
  });
  console.log('✅ Dependencies installed successfully\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Verify Jest configuration
const jestConfigPath = path.join(process.cwd(), 'jest.config.js');
if (!fs.existsSync(jestConfigPath)) {
  console.error('❌ jest.config.js not found. Please ensure configuration file exists.');
  process.exit(1);
}

// Verify Jest setup file
const jestSetupPath = path.join(process.cwd(), 'jest.setup.js');
if (!fs.existsSync(jestSetupPath)) {
  console.error('❌ jest.setup.js not found. Please ensure setup file exists.');
  process.exit(1);
}

// Check if test directory exists
const testDir = path.join(process.cwd(), '__tests__');
if (!fs.existsSync(testDir)) {
  console.error('❌ __tests__ directory not found. Please ensure tests are in place.');
  process.exit(1);
}

// Run tests
console.log('🏃 Running SMS notification tests...\n');
try {
  execSync('npm test', { stdio: 'inherit' });
  console.log('\n✅ All tests completed successfully!');
} catch (error) {
  console.error('\n❌ Some tests failed. Please check the output above.');
  process.exit(1);
}

// Run with coverage
console.log('\n📊 Running coverage report...');
try {
  execSync('npm run test:coverage', { stdio: 'inherit' });
  console.log('\n✅ Coverage report generated successfully!');
} catch (error) {
  console.error('\n❌ Coverage report failed:', error.message);
}

console.log('\n🎉 SMS notification test setup complete!');
console.log('\nAvailable test commands:');
console.log('  npm test                 - Run all tests');
console.log('  npm run test:watch       - Run tests in watch mode');
console.log('  npm run test:coverage    - Run tests with coverage');
console.log('  npm run test:ci          - Run tests for CI/CD');
console.log('\nTest files are located in the __tests__ directory.');
console.log('Check __tests__/README.md for detailed testing documentation.');