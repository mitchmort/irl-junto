const { validatePhoneNumber, normalizePhoneNumber, formatPhoneNumberForDisplay } = require('./lib/twilio/phone-utils.ts');

// Test phone validation
console.log('Testing phone validation:');
const testNumbers = ['+1234567890', '(234) 567-8900', '234-567-8900'];

testNumbers.forEach(num => {
  const result = validatePhoneNumber(num);
  console.log(`${num} => isValid: ${result.isValid}, normalized: ${result.normalized}, error: ${result.error}`);
});

// Test normalization
console.log('\nTesting normalization:');
console.log('invalid =>', normalizePhoneNumber('invalid'));
console.log('123 =>', normalizePhoneNumber('123'));

// Test formatting
console.log('\nTesting formatting:');
console.log('invalid =>', formatPhoneNumberForDisplay('invalid'));
console.log('123 =>', formatPhoneNumberForDisplay('123'));