// models/User.js

const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  username: String,
  email: {
    type: String,
    required: [true, "Lütfen email adresi giriniz"],
    unique: [true, "Eposta adresi zaten mevcut"],
  },
  password: {
    type: String,
    required: [true, "Lütfen şifrenizi giriniz"],
  },
})

module.exports = mongoose.model("User", userSchema)
