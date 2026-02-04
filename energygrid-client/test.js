const client = require("./client");
const crypto = require("crypto");

console.log("🧪 Running Unit Tests for EnergyGrid Client\n");

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.log(`❌ FAIL: ${testName}`);
    testsFailed++;
  }
}

// Test 1: Serial Number Generation
console.log("\n📝 Test Suite 1: Serial Number Generation");
console.log("-".repeat(50));

const sns = client.generateSerialNumbers(10);
assert(sns.length === 10, "Should generate 10 serial numbers");
assert(sns[0] === "SN-000", "First serial should be SN-000");
assert(sns[9] === "SN-009", "10th serial should be SN-009");
assert(Array.isArray(sns), "Should return an array");

const sns500 = client.generateSerialNumbers(500);
assert(sns500.length === 500, "Should generate 500 serial numbers");
assert(sns500[499] === "SN-499", "Last serial should be SN-499");

// Test 2: Signature Generation
console.log("\n🔐 Test Suite 2: Signature Generation");
console.log("-".repeat(50));

const testUrl = "/device/real/query";
const testToken = "interview_token_123";
const testTimestamp = "1234567890";

const signature = client.createSignature(testUrl, testToken, testTimestamp);
const expectedSignature = crypto
  .createHash("md5")
  .update(testUrl + testToken + testTimestamp)
  .digest("hex");

assert(signature === expectedSignature, "Signature should match expected MD5 hash");
assert(signature.length === 32, "MD5 hash should be 32 characters");
assert(/^[a-f0-9]+$/.test(signature), "Signature should be hexadecimal");

// Test different inputs
const sig1 = client.createSignature("/test", "token", "123");
const sig2 = client.createSignature("/test", "token", "456");
assert(sig1 !== sig2, "Different timestamps should produce different signatures");

// Test 3: Batch Creation
console.log("\n📦 Test Suite 3: Batch Creation");
console.log("-".repeat(50));

const testSNs = client.generateSerialNumbers(25);
const batches = client.createBatches(testSNs, 10);

assert(batches.length === 3, "Should create 3 batches from 25 items (10+10+5)");
assert(batches[0].length === 10, "First batch should have 10 items");
assert(batches[1].length === 10, "Second batch should have 10 items");
assert(batches[2].length === 5, "Last batch should have 5 items");
assert(batches[0][0] === "SN-000", "First item of first batch should be SN-000");
assert(batches[2][4] === "SN-024", "Last item of last batch should be SN-024");

// Edge case: exactly divisible
const exactBatches = client.createBatches(client.generateSerialNumbers(30), 10);
assert(exactBatches.length === 3, "Should create exactly 3 batches from 30 items");
assert(exactBatches[2].length === 10, "All batches should have 10 items");

// Edge case: single batch
const singleBatch = client.createBatches(client.generateSerialNumbers(5), 10);
assert(singleBatch.length === 1, "Should create 1 batch from 5 items");
assert(singleBatch[0].length === 5, "Single batch should have 5 items");

// Test 4: Data Structure Validation
console.log("\n🏗️ Test Suite 4: Data Structure");
console.log("-".repeat(50));

const serialNumbers = client.generateSerialNumbers(500);
assert(
  serialNumbers.every((sn) => typeof sn === "string"),
  "All serial numbers should be strings"
);
assert(
  serialNumbers.every((sn) => /^SN-\d{3}$/.test(sn)),
  "All serial numbers should match pattern SN-XXX"
);
assert(
  new Set(serialNumbers).size === 500,
  "All serial numbers should be unique"
);

// Summary
console.log("\n" + "=".repeat(50));
console.log("📊 Test Summary");
console.log("=".repeat(50));
console.log(`✅ Tests Passed: ${testsPassed}`);
console.log(`❌ Tests Failed: ${testsFailed}`);
console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
console.log("=".repeat(50) + "\n");

if (testsFailed === 0) {
  console.log("🎉 All tests passed! The client is ready to use.\n");
  process.exit(0);
} else {
  console.log("⚠️  Some tests failed. Please review the implementation.\n");
  process.exit(1);
}
