require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const { getDailyPrices } = require("../services/alphaVantage");

const TICKERS = ["AAPL", "TSLA", "GOOGL", "MSFT"];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  for (const ticker of TICKERS) {
    const { source } = await getDailyPrices(ticker);
    console.log(`  → ${ticker} cached from ${source}`);
    
    if (ticker !== TICKERS.at(-1)) {
      await new Promise(r => setTimeout(r, 15000));
    }
  }

  console.log("Cache seeded! Ready for demo.");
  process.exit(0);
}

seed().catch(console.error);