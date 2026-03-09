const express = require('express');
const { getDailyPrices } = require('../services/alphaVantage.js');
const router = express.Router();
const axios = require('axios');

const PY_SERVICE_URL = process.env.PY_SERVICE_URL || "http://127.0.0.1:8000";

router.get("/:ticker", async (req, res) => {
    try {
        const ticker = req.params.ticker.toUpperCase();
        console.log(`fetching Data for ${ticker}`);

        const { prices, source } = await getDailyPrices(ticker);

        const recent = prices.slice(-30);
        
        const aiResponse = await axios.post(
            `${PY_SERVICE_URL}/api/insights`,
            { ticker, prices: recent },
            { timeout: 15000 }  
        );

        res.json({
            ticker,
            ...aiResponse.data
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "error Occured while Processing the Request" });
    }
})

module.exports = router;