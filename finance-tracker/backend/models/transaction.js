const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  title: String,
  amount: Number,
  category: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", transactionSchema);
