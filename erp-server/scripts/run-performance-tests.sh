#!/bin/bash

# Performance Testing Script for ERP System

echo "🚀 Starting Performance Tests for ERP System"
echo "=========================================="

# Check if server is running
echo "🔍 Checking if server is running..."
curl -s http://localhost:3000/ > /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Server is not running. Please start the server first:"
    echo "   npm run start:dev"
    exit 1
fi

echo "✅ Server is running"

# Create results directory
mkdir -p performance-results

# Run basic load test
echo "🏃 Running basic load test..."
npx artillery run performance-tests/basic-load-test.yaml \
    --output performance-results/basic-load-report.json

# Generate HTML report
echo "📊 Generating HTML report..."
npx artillery report performance-results/basic-load-report.json \
    --output performance-results/basic-load-report.html

echo "✅ Performance tests completed!"
echo ""
echo "📋 Results:"
echo "   - JSON Report: performance-results/basic-load-report.json"
echo "   - HTML Report: performance-results/basic-load-report.html"
echo ""
echo "📈 Key Metrics to Monitor:"
echo "   - Response Time (avg, min, max, median)"
echo "   - Requests Per Second"
echo "   - Error Rate"
echo "   - Virtual Users"

# Show summary
echo ""
echo "📋 Quick Summary:"
node -e "
const fs = require('fs');
const report = JSON.parse(fs.readFileSync('performance-results/basic-load-report.json'));
const stats = report.aggregate;
console.log('Total Requests:', stats.requestsCompleted);
console.log('Average Response Time:', stats.latency.mean.toFixed(2) + 'ms');
console.log('Error Rate:', ((stats.errors || 0) / stats.requestsCompleted * 100).toFixed(2) + '%');
console.log('Requests Per Second:', stats.rps.mean.toFixed(2));
"