# E2E Test Scenarios for Price Calculation

## Test Suite Overview
This directory contains end-to-end tests for complex price calculation scenarios with various modifier combinations.

## Test Categories

### 1. Complex Modifier Combinations
Tests that verify correct price calculation when multiple modifiers are applied:
- Percentage modifiers (+20% premium, -10% discount)
- Fixed amount modifiers (+500 rubles)
- Multiplier modifiers (×0.85 seasonal discount)
- Mixed modifier types in single calculation

### 2. Edge Case Scenarios
- Conflicting modifiers handling
- Expired temporal modifiers
- Non-existent property values
- Invalid modifier combinations

### 3. Performance Tests
- Bulk price calculations for multiple items
- Concurrent price calculation requests
- Large order processing performance

### 4. Order Total Verification
- Complete order price calculation
- Section-level price aggregation
- Cross-section price consistency

## Test Execution

### Local Testing
```bash
# Run all pricing E2E tests
npm run test:e2e -- --testPathPattern=pricing

# Run specific test suite
npm run test:e2e test/e2e/pricing/price-combinations.e2e-spec.ts
```

### CI/CD Pipeline Integration
```yaml
# GitHub Actions example
- name: Run E2E Tests
  run: |
    npm run test:setup-db
    npm run test:e2e -- --testPathPattern=pricing
  env:
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

## Test Data Requirements

### Required Test Database Setup
- Price modifiers with different types and priorities
- Sample products with base prices
- Test clients for order creation
- Predefined property mappings

### Expected Test Results
Each test verifies:
- Correct application of modifier precedence
- Accurate price calculations
- Proper error handling
- Performance within acceptable limits

## Monitoring and Reporting

### Test Metrics Collected
- Execution time per test case
- Memory usage during tests
- Database query performance
- API response times

### Failure Analysis
- Detailed error logs
- Performance degradation alerts
- Database constraint violations
- Integration point failures

## Maintenance Guidelines

### Regular Updates Needed
- Update test data when business rules change
- Adjust price calculation expectations
- Modify modifier test scenarios
- Update performance benchmarks

### Version Compatibility
- Ensure tests work with current API versions
- Maintain backward compatibility
- Update deprecated endpoint calls
- Adapt to database schema changes