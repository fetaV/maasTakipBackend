// server.js

const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const cors = require("cors")

require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Model ve Routerler
const authRouter = require("./routes/auth")
const maasRouter = require("./routes/maas")
const harcamaRouter = require("./routes/harcama")

app.use(cors())
app.use("/api/auth", authRouter)
app.use("/api/maas", maasRouter)
app.use("/api/harcama", harcamaRouter)

// Sunucu başlatma
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB")
    app.listen(process.env.PORT, () => {
      console.log("Listening on port", process.env.PORT)
    })
  })
  .catch(error => {
    console.error("Error connecting to MongoDB:", error)
  })
