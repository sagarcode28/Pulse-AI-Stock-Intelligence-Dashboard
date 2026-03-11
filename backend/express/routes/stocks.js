const express = require('express');
const { getDailyPrices } = require('../services/alphaVantage.js');
const router = express.Router();
const axios = require('axios');

const PY_SERVICE_URL = process.env.PY_SERVICE_URL || "http://127.0.0.1:8000";
const INVALID_TICKER_REGEX = /[^A-Z0-9.]/;

router.get("/:ticker", async (req, res) => {
    try {
        const ticker = req.params.ticker.toUpperCase();

        if (ticker.length > 10 || INVALID_TICKER_REGEX.test(ticker)) {
            return res.status(400).json({
                error: `"${ticker}" doesn't look like a valid ticker symbol.`
            });
        }

        console.log(`fetching Data for ${ticker}`);

        const { prices, source } = await getDailyPrices(ticker);

        const recent = prices.slice(-30);

        //call fast API 
        let anamolies = [];
        try {
            const airesponse = await axios.post(`${PY_SERVICE_URL}/api/anomaly`, {
                ticker: ticker,
                prices: recent
            }, { timeout: 30000 });
        } catch (err) {
            console.error("Error Occured from Anamoly detection");
        }

        res.json({
            ticker,
            source,
            count: recent.length,
            prices: recent,
            anamolies,
            anamolies_found: anamolies.length
        })
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message.tostring() });
    }
})

module.exports = router;