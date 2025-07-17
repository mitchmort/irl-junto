#!/usr/bin/env node

/**
 * Calendar Functionality Test Script
 * Tests calendar export functionality to ensure blob URL errors are resolved
 */

const fs = require('fs');
const path = require('path');

console.log('🗓️ Calendar Functionality Test\n');

// Test 1: Check if calendar export files exist and are properly structured
const testCalendarExportExists = () => {
  console.log('✅ Test 1: Calendar export files...');
  
  const calendarExportPath = path.join(__dirname, '../lib/calendar-export.ts');
  const calendarDropdownPath = path.join(__dirname, '../components/event-detail/calendar-dropdown.tsx');
  const errorSuppressionPath = path.join(__dirname, '../components/error-suppression-client.tsx');
  
  const files = [
    { path: calendarExportPath, name: 'Calendar Export' },
    { path: calendarDropdownPath, name: 'Calendar Dropdown' },
    { path: errorSuppressionPath, name: 'Error Suppression' }
  ];
  
  let allExist = true;
  files.forEach(file => {
    if (fs.existsSync(file.path)) {
      console.log(`   ✓ ${file.name} exists`);
    } else {
      console.log(`   ✗ ${file.name} missing`);
      allExist = false;
    }
  });
  
  return allExist;
};

// Test 2: Check if calendar export has proper error handling
const testCalendarExportErrorHandling = () => {
  console.log('\n✅ Test 2: Calendar export error handling...');
  
  const calendarExportPath = path.join(__dirname, '../lib/calendar-export.ts');
  const content = fs.readFileSync(calendarExportPath, 'utf8');
  
  const checks = [
    { pattern: /try\s*{/, description: 'Has try-catch blocks' },
    { pattern: /setTimeout.*URL\.revokeObjectURL/, description: 'Delayed blob cleanup' },
    { pattern: /style\.display.*=.*['"]none['"]/, description: 'Hidden download element' },
    { pattern: /catch.*error/, description: 'Error catching' },
    { pattern: /fallback/i, description: 'Fallback mechanisms' }
  ];
  
  let allPassed = true;
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`   ✓ ${check.description}`);
    } else {
      console.log(`   ✗ ${check.description}`);
      allPassed = false;
    }
  });
  
  return allPassed;
};

// Test 3: Check if error suppression is enhanced
const testErrorSuppression = () => {
  console.log('\n✅ Test 3: Error suppression enhancements...');
  
  const errorSuppressionPath = path.join(__dirname, '../components/error-suppression-client.tsx');
  const content = fs.readFileSync(errorSuppressionPath, 'utf8');
  
  const checks = [
    { pattern: /console\.warn/, description: 'Suppresses warnings' },
    { pattern: /unhandledrejection/, description: 'Handles promise rejections' },
    { pattern: /addEventListener/, description: 'Uses proper event listeners' },
    { pattern: /removeEventListener/, description: 'Cleans up event listeners' },
    { pattern: /blob.*URL/i, description: 'Blob URL error suppression' }
  ];
  
  let allPassed = true;
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`   ✓ ${check.description}`);
    } else {
      console.log(`   ✗ ${check.description}`);
      allPassed = false;
    }
  });
  
  return allPassed;
};

// Test 4: Check if calendar dropdown has loading states
const testCalendarDropdownEnhancements = () => {
  console.log('\n✅ Test 4: Calendar dropdown enhancements...');
  
  const calendarDropdownPath = path.join(__dirname, '../components/event-detail/calendar-dropdown.tsx');
  const content = fs.readFileSync(calendarDropdownPath, 'utf8');
  
  const checks = [
    { pattern: /useState.*isDownloading/, description: 'Loading state management' },
    { pattern: /Loader2/, description: 'Loading spinner component' },
    { pattern: /disabled.*isDownloading/, description: 'Disabled state handling' },
    { pattern: /try.*catch/, description: 'Error handling in handlers' },
    { pattern: /toast\.error/, description: 'Error notifications' }
  ];
  
  let allPassed = true;
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`   ✓ ${check.description}`);
    } else {
      console.log(`   ✗ ${check.description}`);
      allPassed = false;
    }
  });
  
  return allPassed;
};

// Test 5: Check calendar store improvements
const testCalendarStoreImprovements = () => {
  console.log('\n✅ Test 5: Calendar store improvements...');
  
  const calendarStorePath = path.join(__dirname, '../store/useCalendarEventStore.ts');
  const content = fs.readFileSync(calendarStorePath, 'utf8');
  
  const checks = [
    { pattern: /currentState\.loading/, description: 'Prevents multiple fetches' },
    { pattern: /Network error/, description: 'Specific error messages' },
    { pattern: /error\.message\?\.includes/, description: 'Error message checking' }
  ];
  
  let allPassed = true;
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`   ✓ ${check.description}`);
    } else {
      console.log(`   ✗ ${check.description}`);
      allPassed = false;
    }
  });
  
  return allPassed;
};

// Run all tests
const runTests = () => {
  const results = [
    testCalendarExportExists(),
    testCalendarExportErrorHandling(),
    testErrorSuppression(),
    testCalendarDropdownEnhancements(),
    testCalendarStoreImprovements()
  ];
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All calendar functionality fixes are in place!');
    console.log('\nNext steps:');
    console.log('1. Test the calendar page in your browser');
    console.log('2. Try downloading calendar files');
    console.log('3. Check that blob URL errors are suppressed');
    return true;
  } else {
    console.log('❌ Some tests failed. Please review the implementation.');
    return false;
  }
};

// Check if this is being run directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests }; 