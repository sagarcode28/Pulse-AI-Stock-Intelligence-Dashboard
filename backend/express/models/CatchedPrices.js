const moongose = require('mongoose');

const PriceEntryScheme = new moongose.Schema({
    date: String,
    open: Number,
    high: Number,
    low: Number,
    close: Number,
    volume: Number
});

const cachedPriceScheme = new moongose.Schema({
    ticker : { type: String, required: true, unique: true, uppercase: true },
    prices : [ PriceEntryScheme ],
    cachedAT : { type: Date, default: Date.Now }
});

//This Line Enables MongoDB : To Remove the Document after 3600sec
cachedPriceScheme.index({cachedAt: 1}, {expireAfterSeconds: 3600});

module.exports = moongose.model("CachedPrice", cachedPriceScheme);