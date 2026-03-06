const express = require('express');
const cors = require('cors');

require("dotenv").config();

const stocksrouter = require('../express/routes/stocks.js');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

app.use("/api/stocks", stocksrouter);

app.get("/health", async(req, res) => {
    res.json({message: "API is Working Fine.."});
})

app.listen(PORT, () => {
     console.log(`API Running on http://localhost:${PORT}`);
});