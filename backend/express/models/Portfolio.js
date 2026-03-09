const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema({
  ticker: { type: String, required: true, uppercase: true },
  shares: { type: Number, required: true },
  buyPrice: { type: Number, required: true },
  buyDate: { type: String, required: true },
  addedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Portfolio", portfolioSchema);