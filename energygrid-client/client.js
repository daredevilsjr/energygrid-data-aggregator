const crypto = require("crypto");
const axios = require("axios");

// Configuration
const CONFIG = {
  API_URL: "http://localhost:3000/device/real/query",
  SECRET_TOKEN: "interview_token_123",
  TOTAL_DEVICES: 500,
  BATCH_SIZE: 10,
  RATE_LIMIT_MS: 1000, // 1 request per second
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000,
};

/**
 * Generate Serial Numbers for all devices
 */
function generateSerialNumbers(count) {
  const serialNumbers = [];
  for (let i = 0; i < count; i++) {
    serialNumbers.push(`SN-${String(i).padStart(3, "0")}`);
  }
  return serialNumbers;
}

/**
 * Create MD5 signature for request authentication
 */
function createSignature(url, token, timestamp) {
  const payload = url + token + timestamp;
  return crypto.createHash("md5").update(payload).digest("hex");
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Make API request with proper headers and retry logic
 */
async function makeRequest(snList, retryCount = 0) {
  const timestamp = Date.now().toString();
  const url = "/device/real/query";
  const signature = createSignature(url, CONFIG.SECRET_TOKEN, timestamp);

  const headers = {
    "Content-Type": "application/json",
    timestamp: timestamp,
    signature: signature,
  };

  try {
    const response = await axios.post(
      CONFIG.API_URL,
      { sn_list: snList },
      { headers }
    );
    return { success: true, data: response.data.data };
  } catch (error) {
    if (error.response?.status === 429 && retryCount < CONFIG.MAX_RETRIES) {
      console.log(
        `⚠️  Rate limit hit for batch. Retrying in ${CONFIG.RETRY_DELAY_MS}ms... (Attempt ${retryCount + 1}/${CONFIG.MAX_RETRIES})`
      );
      await sleep(CONFIG.RETRY_DELAY_MS);
      return makeRequest(snList, retryCount + 1);
    }

    if (error.response?.status === 401) {
      console.error("❌ Authentication failed. Check signature logic.");
      return { success: false, error: "Authentication failed", batch: snList };
    }

    if (retryCount < CONFIG.MAX_RETRIES) {
      console.log(
        `⚠️  Request failed. Retrying... (Attempt ${retryCount + 1}/${CONFIG.MAX_RETRIES})`
      );
      await sleep(CONFIG.RETRY_DELAY_MS);
      return makeRequest(snList, retryCount + 1);
    }

    return {
      success: false,
      error: error.message,
      batch: snList,
    };
  }
}

/**
 * Split serial numbers into batches
 */
function createBatches(serialNumbers, batchSize) {
  const batches = [];
  for (let i = 0; i < serialNumbers.length; i += batchSize) {
    batches.push(serialNumbers.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * Process all batches with rate limiting
 */
async function fetchAllDeviceData(serialNumbers) {
  const batches = createBatches(serialNumbers, CONFIG.BATCH_SIZE);
  const totalBatches = batches.length;
  const allResults = [];
  const errors = [];

  console.log(`\n📊 Starting data aggregation...`);
  console.log(`   Total devices: ${serialNumbers.length}`);
  console.log(`   Batch size: ${CONFIG.BATCH_SIZE}`);
  console.log(`   Total batches: ${totalBatches}`);
  console.log(
    `   Estimated time: ~${Math.ceil(totalBatches * (CONFIG.RATE_LIMIT_MS / 1000))}s\n`
  );

  const startTime = Date.now();

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const batchStartTime = Date.now();

    console.log(
      `🔄 Processing batch ${i + 1}/${totalBatches} (${batch.length} devices)...`
    );

    const result = await makeRequest(batch);

    if (result.success) {
      allResults.push(...result.data);
      console.log(`✅ Batch ${i + 1} completed successfully`);
    } else {
      errors.push(result);
      console.error(`❌ Batch ${i + 1} failed: ${result.error}`);
    }

    // Rate limiting: ensure 1 second between requests
    if (i < batches.length - 1) {
      const elapsed = Date.now() - batchStartTime;
      const waitTime = Math.max(0, CONFIG.RATE_LIMIT_MS - elapsed);
      if (waitTime > 0) {
        await sleep(waitTime);
      }
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

  return {
    results: allResults,
    errors: errors,
    summary: {
      totalRequested: serialNumbers.length,
      totalFetched: allResults.length,
      totalErrors: errors.length,
      totalTime: totalTime,
      averageTimePerBatch: (totalTime / totalBatches).toFixed(2),
    },
  };
}

/**
 * Generate aggregated report
 */
function generateReport(data) {
  const { results, errors, summary } = data;

  console.log("\n" + "=".repeat(60));
  console.log("📈 AGGREGATION REPORT");
  console.log("=".repeat(60));

  // Summary Statistics
  console.log("\n📊 Summary:");
  console.log(`   Total Devices Requested: ${summary.totalRequested}`);
  console.log(`   Successfully Fetched: ${summary.totalFetched}`);
  console.log(`   Failed: ${summary.totalErrors}`);
  console.log(`   Total Time: ${summary.totalTime}s`);
  console.log(`   Average Time/Batch: ${summary.averageTimePerBatch}s`);

  // Device Status Analysis
  const onlineDevices = results.filter((d) => d.status === "Online").length;
  const offlineDevices = results.filter((d) => d.status === "Offline").length;

  console.log("\n⚡ Device Status:");
  console.log(`   Online: ${onlineDevices} (${((onlineDevices / results.length) * 100).toFixed(1)}%)`);
  console.log(`   Offline: ${offlineDevices} (${((offlineDevices / results.length) * 100).toFixed(1)}%)`);

  // Power Statistics
  const totalPower = results.reduce(
    (sum, d) => sum + parseFloat(d.power),
    0
  );
  const avgPower = (totalPower / results.length).toFixed(2);
  const maxPower = Math.max(...results.map((d) => parseFloat(d.power))).toFixed(2);
  const minPower = Math.min(...results.map((d) => parseFloat(d.power))).toFixed(2);

  console.log("\n🔋 Power Statistics:");
  console.log(`   Total Power: ${totalPower.toFixed(2)} kW`);
  console.log(`   Average Power: ${avgPower} kW`);
  console.log(`   Max Power: ${maxPower} kW`);
  console.log(`   Min Power: ${minPower} kW`);

  // Errors
  if (errors.length > 0) {
    console.log("\n❌ Errors:");
    errors.forEach((err, idx) => {
      console.log(`   ${idx + 1}. ${err.error} - Batch: ${err.batch.join(", ")}`);
    });
  }

  console.log("\n" + "=".repeat(60) + "\n");

  return {
    summary,
    deviceStatus: { online: onlineDevices, offline: offlineDevices },
    powerStats: {
      total: totalPower.toFixed(2),
      average: avgPower,
      max: maxPower,
      min: minPower,
    },
    errors: errors,
  };
}

/**
 * Save results to JSON file
 */
async function saveResults(data, report) {
  const fs = require("fs").promises;
  const outputDir = "./output";

  try {
    await fs.mkdir(outputDir, { recursive: true });

    // Save detailed results
    await fs.writeFile(
      `${outputDir}/device_data.json`,
      JSON.stringify(data.results, null, 2)
    );

    // Save report
    await fs.writeFile(
      `${outputDir}/report.json`,
      JSON.stringify(report, null, 2)
    );

    console.log(`💾 Results saved to ${outputDir}/`);
    console.log(`   - device_data.json (${data.results.length} devices)`);
    console.log(`   - report.json (summary and statistics)`);
  } catch (error) {
    console.error("❌ Error saving results:", error.message);
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log("⚡ EnergyGrid Data Aggregator Client");
  console.log("=====================================\n");

  try {
    // Step 1: Generate serial numbers
    console.log("🔧 Generating serial numbers...");
    const serialNumbers = generateSerialNumbers(CONFIG.TOTAL_DEVICES);
    console.log(`✅ Generated ${serialNumbers.length} serial numbers\n`);

    // Step 2: Fetch data from API
    const data = await fetchAllDeviceData(serialNumbers);

    // Step 3: Generate report
    const report = generateReport(data);

    // Step 4: Save results
    await saveResults(data, report);

    console.log("✅ Data aggregation completed successfully!");

    // Exit with appropriate code
    process.exit(data.errors.length > 0 ? 1 : 0);
  } catch (error) {
    console.error("\n❌ Fatal error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the application
if (require.main === module) {
  main();
}

module.exports = {
  generateSerialNumbers,
  createSignature,
  makeRequest,
  createBatches,
  fetchAllDeviceData,
  generateReport,
};
