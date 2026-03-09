const express = require("express");
const router = express.Router();
const Portfolio = require("../models/Portfolio");
const { getDailyPrices } = require("../services/alphaVantage");

router.get("/", async (req, res) => {
  try {
    const holdings = await Portfolio.find().sort({ addedAt: -1 });

    const enriched = await Promise.all(
      holdings.map(async (h) => {
        try {
          const { prices } = await getDailyPrices(h.ticker);
          const currentPrice = prices.at(-1)?.close ?? h.buyPrice;
          const totalCost = h.buyPrice * h.shares;
          const currentValue = currentPrice * h.shares;
          const pnl = currentValue - totalCost;
          const pnlPct = ((pnl / totalCost) * 100);

          return {
            _id: h._id,
            ticker: h.ticker,
            shares: h.shares,
            buyPrice: h.buyPrice,
            buyDate: h.buyDate,
            currentPrice: parseFloat(currentPrice.toFixed(2)),
            totalCost: parseFloat(totalCost.toFixed(2)),
            currentValue: parseFloat(currentValue.toFixed(2)),
            pnl: parseFloat(pnl.toFixed(2)),
            pnlPct: parseFloat(pnlPct.toFixed(2)),
          };

        } catch {
          return {
            _id: h._id,
            ticker: h.ticker,
            shares: h.shares,
            buyPrice: h.buyPrice,
            buyDate: h.buyDate,
            currentPrice: null,
            pnl: null,
            pnlPct: null,
          };
        }
      })
    );

    const totalCost = enriched.reduce((s, h) => s + (h.totalCost || 0), 0);
    const totalValue = enriched.reduce((s, h) => s + (h.currentValue || 0), 0);
    const totalPnl = totalValue - totalCost;

    res.json({
      holdings: enriched,
      summary: {
        totalCost: parseFloat(totalCost.toFixed(2)),
        totalValue: parseFloat(totalValue.toFixed(2)),
        totalPnl: parseFloat(totalPnl.toFixed(2)),
        totalPnlPct: totalCost > 0
          ? parseFloat(((totalPnl / totalCost) * 100).toFixed(2))
          : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { ticker, shares, buyPrice, buyDate } = req.body;

    if (!ticker || !shares || !buyPrice || !buyDate) {
      return res.status(400).json({ error: "ticker, shares, buyPrice, buyDate are required" });
    }

    const holding = await Portfolio.create({
      ticker: ticker.toUpperCase(),
      shares: parseFloat(shares),
      buyPrice: parseFloat(buyPrice),
      buyDate,
    });

    res.status(201).json({ message: "Holding added", holding });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Portfolio.findByIdAndDelete(req.params.id);
    res.json({ message: "Holding removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;