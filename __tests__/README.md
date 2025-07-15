# SMS Notification Testing Suite

This directory contains comprehensive tests for the SMS notification system in JUNTO.

## Test Structure

### Unit Tests
- **`lib/twilio/sms-service.test.ts`** - Tests for the core SMS service functionality
- **`lib/twilio/phone-utils.test.ts`** - Tests for phone number validation and formatting utilities

### API Integration Tests
- **`api/auth/verify-phone.test.ts`** - Tests for phone verification endpoints
- **`api/notifications/send-sms.test.ts`** - Tests for SMS sending endpoints

### Component Tests
- **`components/auth/phone-verification.test.tsx`** - Tests for phone verification UI components

### End-to-End Tests
- **`e2e/sms-notification-flow.test.ts`** - Full workflow tests for the SMS notification system

## Test Coverage

The test suite covers:

### Core Functionality
- ✅ Phone number validation and formatting
- ✅ SMS sending (individual and bulk)
- ✅ Verification code generation and validation
- ✅ Rate limiting enforcement
- ✅ Error handling and recovery
- ✅ Webhook status updates

### API Endpoints
- ✅ Phone verification flow
- ✅ SMS sending endpoints
- ✅ Error responses and validation
- ✅ Authentication and authorization

### UI Components
- ✅ Phone input validation
- ✅ Verification code input
- ✅ Form submission handling
- ✅ Error display and user feedback
- ✅ Loading states

### Business Logic
- ✅ Event reminder scheduling
- ✅ Notification preferences
- ✅ Bulk notification processing
- ✅ Delivery tracking
- ✅ Performance optimization

## Running Tests

### Prerequisites
Make sure you have the required dependencies installed:

```bash
npm install --save-dev jest @jest/globals @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest node-mocks-http
```

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Unit tests only
npm test -- --testPathPattern="lib/"

# API tests only
npm test -- --testPathPattern="api/"

# Component tests only
npm test -- --testPathPattern="components/"

# E2E tests only
npm test -- --testPathPattern="e2e/"
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Watch Mode for Development
```bash
npm test -- --watch
```

## Test Configuration

### Jest Configuration
The tests use Jest with the following configuration:
- **Test Environment**: jsdom for component tests
- **TypeScript Support**: ts-jest for TypeScript compilation
- **Path Mapping**: `@/` alias for absolute imports
- **Coverage**: Collects coverage from `lib/`, `components/`, and `app/api/`

### Mocking Strategy
- **External APIs**: Twilio API calls are mocked
- **Database**: Supabase queries are mocked
- **Next.js**: Router and navigation are mocked
- **Environment**: Test environment variables are set

## Test Data

### Mock Users
```typescript
const mockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  phone_number: '+15551234567',
  phone_verified: true,
};
```

### Mock Events
```typescript
const mockEvent = {
  id: 'test-event-123',
  title: 'Basketball Game',
  date: new Date(Date.now() + 24 * 60 * 60 * 1000),
  location: 'Central Park',
  organizer: 'test-user-123',
  sport: 'basketball',
};
```

## Test Patterns

### API Testing Pattern
```typescript
describe('/api/endpoint', () => {
  it('should handle success case', async () => {
    // Mock dependencies
    mockSupabase.from.mockReturnValue(/* mock chain */);
    
    // Create request
    const { req } = createMocks({ method: 'POST', body: {} });
    
    // Call endpoint
    const response = await POST(req);
    
    // Assert response
    expect(response.status).toBe(200);
  });
});
```

### Component Testing Pattern
```typescript
describe('Component', () => {
  it('should render and handle interaction', async () => {
    // Render component
    render(<Component {...props} />);
    
    // Find elements
    const button = screen.getByRole('button');
    
    // Simulate interaction
    fireEvent.click(button);
    
    // Assert behavior
    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalled();
    });
  });
});
```

### E2E Testing Pattern
```typescript
describe('Complete Flow', () => {
  it('should complete entire user journey', async () => {
    // Step 1: Setup
    // Mock all dependencies
    
    // Step 2: Execute
    // Call services in sequence
    
    // Step 3: Verify
    // Assert all steps completed correctly
  });
});
```

## Best Practices

### Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Test both success and failure scenarios
- Test edge cases and error conditions

### Mocking Guidelines
- Mock external dependencies (APIs, databases)
- Keep mocks simple and focused
- Reset mocks between tests
- Use realistic mock data

### Assertions
- Test behavior, not implementation
- Use specific assertions (not just truthy)
- Assert on both success and error cases
- Verify side effects (API calls, state changes)

### Performance
- Keep tests fast and isolated
- Use parallel execution where possible
- Mock expensive operations
- Clean up after tests

## Debugging Tests

### Common Issues
1. **Mock not working**: Check mock is called before the test
2. **Async issues**: Use `await` and `waitFor` properly
3. **DOM not updating**: Use `waitFor` for async DOM updates
4. **Path issues**: Check `@/` alias is configured correctly

### Debug Commands
```bash
# Run single test with debugging
npm test -- --testNamePattern="specific test name" --verbose

# Run with console output
npm test -- --silent=false

# Run with coverage details
npm test -- --coverage --verbose
```

## Continuous Integration

### GitHub Actions
Add to `.github/workflows/test.yml`:
```yaml
name: Test SMS Notifications
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage
```

### Pre-commit Hooks
Add to `package.json`:
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test && npm run lint"
    }
  }
}
```

## Maintenance

### Adding New Tests
1. Follow existing patterns
2. Add to appropriate category (unit/integration/e2e)
3. Update coverage expectations
4. Document complex test scenarios

### Updating Mocks
1. Keep mocks in sync with actual APIs
2. Update mock data when schema changes
3. Add new mocks for new dependencies
4. Remove obsolete mocks

### Performance Monitoring
- Monitor test execution time
- Optimize slow tests
- Use test parallelization
- Profile memory usage for large test suites