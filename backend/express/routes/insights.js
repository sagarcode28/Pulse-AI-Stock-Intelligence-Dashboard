const express = require("express");
const router = express.Router();
const axios = require("axios");
const { getDailyPrices } = require("../services/alphaVantage");

const PY_SERVICE_URL = process.env.PY_SERVICE_URL || "http://127.0.0.1:8000";

// GET /api/insights/:ticker
router.get("/:ticker", async (req, res) => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    console.log(`Generating AI insight for ${ticker}...`);

    const { prices } = await getDailyPrices(ticker);
    const recent = prices.slice(-30);

    try {
      await axios.get(`${PY_SERVICE_URL}/health`, { timeout: 30000 });
      console.log("FastAPI is live");
    } catch {
      console.warn("FastAPI health check failed");
    }

    const aiResponse = await axios.post(
      `${PY_SERVICE_URL}/api/insights`,
      { ticker, prices: recent },
      { timeout: 120000 } 
    );

    res.json({ ticker, ...aiResponse.data });

  } catch (error) {
    console.error("Insight error:", error.message);
    res.json({
      ticker: req.params.ticker.toUpperCase(),
      insight: {
        trend: "Neutral",
        risk_level: "Medium",
        summary: "Please try again in 30 seconds.",
        price_target_hint: "Retry for full AI analysis.",
        error_message: error.message
      }
    });
  }
});

module.exports = router;