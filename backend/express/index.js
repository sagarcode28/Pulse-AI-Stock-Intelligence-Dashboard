const express = require('express');
const cors = require('cors');
const moongose = require('mongoose');

require("dotenv").config();

const stocksrouter = require('../express/routes/stocks.js');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

app.use("/api/stocks", stocksrouter);

app.get("/health", async(req, res) => {
    res.json({message: "API is Working Fine.."});
})

moongose.connect(process.env.MONGO_URI).then(() => {
    console.log("Mongo DB Connected");
    app.listen(PORT, () => {
        console.log(`API Running on http://localhost:${PORT}`);
    })
}).catch((err) => {
    console.error("MongoDB connection failed:", err.message);
})