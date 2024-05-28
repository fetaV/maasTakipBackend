// server/models/Maas.js

const mongoose = require("mongoose")

const MaasSchema = new mongoose.Schema({
  maasMiktari: Number,
  tarih: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId, // ObjectId türünde yapıldı
    ref: "User", // Referans modeli belirtildi (varsayılan olarak 'User')
    required: true,
  },
})

module.exports = mongoose.model("Maas", MaasSchema)
