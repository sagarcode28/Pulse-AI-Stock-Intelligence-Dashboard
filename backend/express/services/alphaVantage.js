const axios = require("axios");
const CachedPrice = require("../models/CatchedPrices.js")

const BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = process.env.ALPHA_VANTAGE_KEY;

async function getDailyPrices(ticker) {

    ticker = ticker.toUpperCase();

    const cachedData = await CachedPrice.findOne({ ticker });

    if (cachedData) {
        console.log("Cached Data from MongoDB");
        return { prices: cachedData.prices, source: "mongoDB"};
    }

    console.log("No Cached Data from MongoDB : New API Request");

    //Making Request to API : For Daily timeframe Data : 100 Days
    const response = await axios.get(BASE_URL, {
        params: {
            function: "TIME_SERIES_DAILY",
            symbol: ticker,
            outputsize: "compact", //last 100 days
            apikey: API_KEY
        }
    });

    const raw = response.data["Time Series (Daily)"];

    if (!raw) {
        throw new Error(response.data["Note"] ? "API Request Limit Exceeds" : "No Data found")
    }

    //Mapping Response [{date, open, high, low, close, volume}]
    const prices = Object.entries(raw).map(([date, values]) => ({
        date,
        open: parseFloat(values["1. open"]),
        high: parseFloat(values["2. high"]),
        low: parseFloat(values["3. low"]),
        close: parseFloat(values["4. close"]),
        volume: parseInt(values["5. volume"]),
    })).sort((a, b) => new Date(a.date) - new Date(b.date)); //Sort Old -> New

    await CachedPrice.findOneAndUpdate(
        { ticker },
        { ticker, prices, catchedAt: new Date() },
        { upsert: true, new: true }
    );

    console.log("Saved to Mongo DB..");

    return { prices, source: "api" };
}

module.exports = { getDailyPrices };