// server/routes/harcama.js

const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const Harcama = require("../models/Harcama")
const User = require("../models/User")

// Middleware: JWT doğrulama
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization
  if (!token) return res.status(403).send("Token required")
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) return res.status(401).send("Invalid token")
    req.user = decoded
    next()
  })
}

// Yeni harcama kaydı oluşturma
router.post("/", verifyToken, async (req, res) => {
  try {
    const { aciklama, kullanim, miktar } = req.body
    const user = await User.findOne({ email: req.user.email })

    const newMaas = new Harcama({
      aciklama,
      kullanim,
      miktar,
      user: user._id,
    })

    await newMaas.save()
    res.status(201).json(newMaas)
  } catch (error) {
    console.error("Error saving data:", error)
    res.status(500).json({ error: "Failed to save the data" })
  }
})

// Tüm harcamaları getir
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email })
    const harcamalar = await Harcama.find({ user: user._id })
    res.status(200).json(harcamalar)
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
})

// Harcama sil
router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const harcama = await Harcama.findByIdAndDelete(id)

    if (!harcama) {
      return res.status(404).json({ message: "Harcama bulunamadı" })
    }

    res.status(204).end()
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Harcama düzenle
router.put("/:id", async (req, res) => {
  const { id } = req.params
  const { aciklama, kullanim, miktar } = req.body

  try {
    const updatedHarcama = await Harcama.findByIdAndUpdate(
      id,
      { aciklama, kullanim, miktar },
      { new: true }
    )

    if (!updatedHarcama) {
      return res.status(404).json({ message: "Harcama düzenlenemedi" })
    }

    res.json(updatedHarcama)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
