const axios = require("axios");
const CachedPrice = require("../models/CatchedPrices.js")

const BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = process.env.ALPHA_VANTAGE_KEY;

const DEMO_PRICES = (basePrice) => {
    const prices = [];
    let price = basePrice;
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        if (date.getDay() === 0 || date.getDay() === 6) continue;
        const change = (Math.random() - 0.48) * (price * 0.03);
        price = Math.max(price + change, 1);
        prices.push({
            date: date.toISOString().split("T")[0],
            open: parseFloat((price * 0.998).toFixed(2)),
            high: parseFloat((price * 1.015).toFixed(2)),
            low: parseFloat((price * 0.985).toFixed(2)),
            close: parseFloat(price.toFixed(2)),
            volume: Math.floor(Math.random() * 50000000) + 10000000,
        });
    }
    return prices;
};

const DEMO_BASE_PRICES = {
    AAPL: 195, TSLA: 400, GOOGL: 175, MSFT: 420,
    AMZN: 200, META: 550, NVDA: 900, DAWN: 21,
};

async function getDailyPrices(ticker) {

    ticker = ticker.toUpperCase();

    const cachedData = await CachedPrice.findOne({ ticker });

    if (cachedData) {
        console.log("Cached Data from MongoDB");
        return { prices: cachedData.prices, source: "mongoDB" };
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

    if (response.data["Note"] || response.data["Information"]) {
        console.warn("Alpha Vantage rate limit — using demo data");
        return buildDemoFallback(ticker);
    }

    const raw = response.data["Time Series (Daily)"];

    if (!raw) {
        throw new Error(`No data returned for ticker: ${ticker}`);
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

function buildDemoFallback(ticker) {
    const basePrice = DEMO_BASE_PRICES[ticker] || 100;
    const prices = DEMO_PRICES(basePrice);
    return { prices, source: "demo" };
}

module.exports = { getDailyPrices };