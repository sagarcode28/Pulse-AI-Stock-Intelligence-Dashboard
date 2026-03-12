const express = require("express");
const router = express.Router();
const axios = require("axios");
const { getDailyPrices } = require("../services/alphaVantage");

const PY_SERVICE_URL = (process.env.PY_SERVICE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

router.get("/:ticker", async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  console.log(`[insights] ticker=${ticker} PY_URL=${PY_SERVICE_URL}`);

  try {
    const { prices } = await getDailyPrices(ticker);
    const clean = prices.slice(-30).map(p => ({
      date:   p.date,
      open:   Number(p.open),
      high:   Number(p.high),
      low:    Number(p.low),
      close:  Number(p.close),
      volume: parseInt(p.volume)
    }));

    console.log(`[insights] sending ${clean.length} prices to ${PY_SERVICE_URL}/api/insights`);

    const response = await axios.post(
      `${PY_SERVICE_URL}/api/insights`,
      { ticker, prices: clean },
      { timeout: 120000 }
    );

    console.log(`[insights] FastAPI responded OK for ${ticker}`);
    return res.json({ ticker, ...response.data });

  } catch (err) {
    console.error(`[insights] ERROR: ${err.message}`);
    if (err.response) {
      console.error(`[insights] FastAPI status: ${err.response.status}`);
      console.error(`[insights] FastAPI body: ${JSON.stringify(err.response.data)}`);
    }
    return res.json({
      ticker,
      insight: {
        trend: "Neutral",
        risk_level: "Medium",
        summary: "AI service warming up. Try again in 30 seconds.",
        price_target_hint: "Retry for full analysis.",
        error_message: err.message,
        fastapi_url: PY_SERVICE_URL
      }
    });
  }
});

module.exports = router;