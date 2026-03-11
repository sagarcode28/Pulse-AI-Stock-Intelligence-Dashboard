const express = require('express');
const cors = require('cors');
const moongose = require('mongoose');

require("dotenv").config();

const stocksrouter = require('../express/routes/stocks.js');
const insightsRouter = require('../express/routes/insights.js');
const portfolioRouter = require('../express/routes/portfolio.js');
const watchlistRouter = require("../express/routes/watchlist.js");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: "*",
  credentials: false,
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api/stocks", stocksrouter);
app.use("/api/insights", insightsRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api/watchlist", watchlistRouter);   

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Pulse AI running",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

moongose.connect(process.env.MONGO_URI).then(() => {
    console.log("Mongo DB Connected");
    app.listen(PORT, () => {
        console.log(`API Running on http://localhost:${PORT}`);
    })
}).catch((err) => {
    console.error("MongoDB connection failed:", err.message);
})