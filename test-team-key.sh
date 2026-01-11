#!/bin/bash

echo "🧪 Kodus CLI - Team API Key Test Script"
echo "========================================"
echo ""

CLI_CMD="node dist/index.js"

echo "📦 Step 1: Building CLI..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo "✅ Build successful"
echo ""

echo "🔍 Step 2: Testing Team Key Authentication"
echo "-------------------------------------------"
echo ""

echo "Test 1: Auth without key (should fail)"
$CLI_CMD auth team-key
echo ""

echo "Test 2: Auth with invalid format (should fail)"
$CLI_CMD auth team-key --key invalid_key_format
echo ""

echo "Test 3: Team status when not authenticated"
$CLI_CMD auth team-status
echo ""

if [ -z "$KODUS_TEST_KEY" ]; then
    echo "⚠️  KODUS_TEST_KEY not set. Skipping live API tests."
    echo ""
    echo "To run full tests, set your test key:"
    echo "  export KODUS_TEST_KEY=kodus_your_test_key"
    echo ""
else
    echo "Test 4: Auth with valid key"
    $CLI_CMD auth team-key --key "$KODUS_TEST_KEY"
    echo ""
    
    echo "Test 5: Team status after authentication"
    $CLI_CMD auth team-status
    echo ""
    
    echo "Test 6: Review command (if in git repo with changes)"
    if git rev-parse --git-dir > /dev/null 2>&1; then
        echo "Creating test changes..."
        echo "// Test comment for CLI testing" >> test-file-temp.js
        git add test-file-temp.js 2>/dev/null || true
        
        echo "Running review..."
        $CLI_CMD review
        
        echo "Cleaning up test file..."
        git reset test-file-temp.js 2>/dev/null || true
        rm -f test-file-temp.js
    else
        echo "⚠️  Not in a git repository. Skipping review test."
    fi
    echo ""
fi

echo "✅ Test script completed!"
echo ""
echo "📝 Manual tests still needed:"
echo "  - Test with revoked key (backend)"
echo "  - Test domain validation (backend)"
echo "  - Test license auto-assignment (backend)"
echo "  - Test with no git email configured"
echo "  - Test backward compatibility with user login"
