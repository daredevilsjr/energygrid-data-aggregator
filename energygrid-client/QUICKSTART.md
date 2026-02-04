# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Setup Mock API Server
```bash
# Navigate to mock-api directory (from the assignment files)
cd mock-api

# Install dependencies
npm install

# Start the server
npm start
```

You should see:
```
⚡ EnergyGrid Mock API running on port 3000
   Constraints: 1 req/sec, Max 10 items/batch
```

### Step 2: Setup Client Application
```bash
# In a NEW terminal, navigate to the client directory
cd energygrid-client

# Run the setup script (installs dependencies and runs tests)
./setup.sh

# OR manually:
npm install
node test.js
```

### Step 3: Run the Client
```bash
npm start
```

Watch the progress as it:
- Generates 500 serial numbers
- Processes 50 batches (10 devices each)
- Fetches telemetry data
- Generates comprehensive report

**Expected runtime**: ~50 seconds

## 📊 View Results

After completion, check the `output/` directory:

```bash
cd output
cat report.json        # View summary statistics
cat device_data.json   # View all device data
```

## ✅ Verify Success

You should see:
- ✅ All 500 devices fetched
- ✅ 50 batches processed
- ✅ 0 errors (or minimal with retries)
- ✅ Statistics on power and device status

## 🔍 Troubleshooting

**Issue**: `Connection refused`
- **Fix**: Ensure mock API is running on port 3000

**Issue**: `429 Too Many Requests`
- **Fix**: Already handled with retry logic; if persistent, check server logs

**Issue**: `401 Authentication Error`
- **Fix**: Verify SECRET_TOKEN matches in both client and server

## 📝 Project Structure

```
energygrid-client/
├── client.js          # Main application
├── package.json       # Dependencies
├── README.md          # Full documentation
├── SOLUTION.md        # Implementation details
├── test.js           # Unit tests
├── setup.sh          # Setup script
└── output/           # Generated results
    ├── device_data.json
    └── report.json
```

## 🎯 What This Client Does

1. **Generates** 500 serial numbers (SN-000 to SN-499)
2. **Batches** them into groups of 10
3. **Fetches** data from the API with proper:
   - Rate limiting (1 req/sec)
   - Authentication (MD5 signature)
   - Error handling (retry logic)
4. **Aggregates** all results
5. **Generates** comprehensive report with statistics

## 📚 Further Reading

- **README.md**: Complete documentation
- **SOLUTION.md**: Detailed implementation approach
- **instructions.md**: Original assignment requirements

---

**Ready to submit?** This project is complete and ready to push to your repository! 🎉
