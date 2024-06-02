// server/models/Harcama.js

const mongoose = require("mongoose")

const MaasSchema = new mongoose.Schema({
  aciklama: String,
  kullanim: {
    type: Number,
    enum: [0, 1, 2, 3], // 0: İhtiyaç, 1: Yatırım, 2: Lüks
  },
  miktar: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
})

module.exports = mongoose.model("Harcama", MaasSchema)
