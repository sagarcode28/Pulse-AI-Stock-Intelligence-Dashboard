const mongoose = require("mongoose");

const watchlistSchema = new mongoose.Schema({
  ticker: { type: String, required: true, unique: true, uppercase: true },
  addedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Watchlist", watchlistSchema);