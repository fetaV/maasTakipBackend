const mongoose = require("mongoose")
const express = require("express")
const router = express.Router()

const HarcamaSchema = new mongoose.Schema(
  {
    aciklama: String,
    kullanim: {
      type: Number,
      enum: [0, 1, 2, 3], // 0: İhtiyaç, 1: Yatırım, 2: Lüks, 3: Diğer
    },
    miktar: Number,
  },
  { timestamps: true }
)

const UserHarcamalarSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    harcamalar: [HarcamaSchema],
  },
  { timestamps: true }
)

const UserHarcamalar = mongoose.model("UserHarcamalar", UserHarcamalarSchema)
