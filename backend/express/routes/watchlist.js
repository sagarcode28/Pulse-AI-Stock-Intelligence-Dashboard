const express = require("express");
const router = express.Router();
const Watchlist = require("../models/Watchlist");
const { getDailyPrices } = require("../services/alphaVantage");

router.get("/", async (req, res) => {
  try {
    const items = await Watchlist.find().sort({ addedAt: -1 });

    const enriched = await Promise.all(
      items.map(async (item) => {
        try {
          const { prices } = await getDailyPrices(item.ticker);
          const latest = prices.at(-1);
          const prev = prices.at(-2);
          const change = latest && prev
            ? parseFloat((((latest.close - prev.close) / prev.close) * 100).toFixed(2))
            : 0;

          const sparkline = prices.slice(-7).map((p) => p.close);

          return {
            _id: item._id,
            ticker: item.ticker,
            price: latest?.close ?? null,
            change,
            sparkline,              // ← NEW
          };
        } catch {
          return {
            _id: item._id,
            ticker: item.ticker,
            price: null,
            change: null,
            sparkline: [],
          };
        }
      })
    );

    res.json({ watchlist: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { ticker } = req.body;
    if (!ticker) return res.status(400).json({ error: "ticker is required" });

    const item = await Watchlist.findOneAndUpdate(
      { ticker: ticker.toUpperCase() },
      { ticker: ticker.toUpperCase() },
      { upsert: true, new: true }
    );
    res.status(201).json({ message: "Added to watchlist ✅", item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:ticker", async (req, res) => {
  try {
    await Watchlist.findOneAndDelete({
      ticker: req.params.ticker.toUpperCase()
    });
    res.json({ message: "Removed from watchlist ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;