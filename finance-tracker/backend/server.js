const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Transaction = require("./models/transaction");

const app = express();
app.use(cors());
app.use(express.json());

// connect db
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("✅ MongoDB connected"))
.catch(err=>console.log(err));

// routes
app.get("/transactions", async (req,res)=>{
  const tx = await Transaction.find();
  res.json(tx);
});

app.post("/transactions", async (req,res)=>{
  const { title, amount, category } = req.body;
  const tx = new Transaction({ title, amount, category });
  await tx.save();
  res.json(tx);
});

app.delete("/transactions/:id", async (req,res)=>{
  await Transaction.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// start server
app.listen(process.env.PORT, ()=>console.log(`🚀 Server running on ${process.env.PORT}`));
