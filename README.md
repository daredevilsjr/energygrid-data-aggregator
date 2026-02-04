# EnergyGrid Data Aggregator

Complete solution for the EnergyGrid Data Aggregator coding assignment.

## 📁 Project Structure

- `energygrid-client/` - Main client application
- `mock-api/` - Mock server for testing

## 🚀 Quick Start
1. Start the mock API:
```bash
   cd energygrid-data-aggregator/mock-api
   npm install && npm start
```

You should see:
```
⚡ EnergyGrid Mock API running on port 3000
   Constraints: 1 req/sec, Max 10 items/batch
```
2. Run the client (new terminal):
```bash
   cd energygrid-data-aggregator/energygrid-client
   npm install && npm start
```
Take about ~50 seconds
Create an output/ folder with results

## 📚 Documentation
See `energygrid-client/README.md` for complete documentation.

## ✅ Requirements Met

- ✅ Fetches 500 devices
- ✅ Rate limiting (1 req/sec)
- ✅ Batch processing (10 devices/request)
- ✅ MD5 signature authentication
- ✅ Error handling with retries
- ✅ Clean, modular code
