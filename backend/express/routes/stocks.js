const express = require('express');
const { getDailyPrices } = require('../services/alphaVantage.js');
const router = express.Router();

router.get("/:ticker", async(req, res) => {
    try{
        const ticker = req.params.ticker.toUpperCase();
        console.log(`fetching Data for ${ticker}`);

        const prices = await getDailyPrices(ticker);
        
        res.json({
            ticker,
            count: prices.length,
            prices
        })
    }catch(err){
        console.error(err.message);
        res.status(500).json({message: "error Occured while Processing the Request"});
    }
})

module.exports = router;