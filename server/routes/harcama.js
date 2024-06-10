const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const UserHarcamalar = require("../models/UserHarcamalar")
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

    let userHarcamalar = await UserHarcamalar.findOne({ user: user._id })
    if (!userHarcamalar) {
      userHarcamalar = new UserHarcamalar({ user: user._id, harcamalar: [] })
    }

    userHarcamalar.harcamalar.push({ aciklama, kullanim, miktar })
    await userHarcamalar.save()

    res.status(201).json(userHarcamalar)
  } catch (error) {
    console.error("Error saving data:", error)
    res.status(500).json({ error: "Failed to save the data" })
  }
})

// Tüm harcamaları getir
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email })
    const userHarcamalar = await UserHarcamalar.findOne({ user: user._id })

    if (!userHarcamalar) {
      return res
        .status(404)
        .json({ message: "No expenses found for this user" })
    }

    res.status(200).json({ harcamalar: userHarcamalar.harcamalar })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
})

// Harcama sil
router.delete("/:harcamaId", verifyToken, async (req, res) => {
  const { harcamaId } = req.params

  try {
    const user = await User.findOne({ email: req.user.email })
    const userHarcamalar = await UserHarcamalar.findOne({ user: user._id })

    if (!userHarcamalar) {
      return res
        .status(404)
        .json({ message: "No expenses found for this user" })
    }

    console.log("userHarcamalar:", userHarcamalar)

    const harcama = userHarcamalar.harcamalar.id(harcamaId)
    if (!harcama) {
      return res.status(404).json({ message: "Expense not found" })
    }

    await harcama.remove()
    await userHarcamalar.save()

    res.status(204).end()
  } catch (error) {
    console.error("Error deleting the expense:", error)
    res.status(500).json({ message: error.message })
  }
})

// Harcama düzenle
router.put("/:harcamaId", verifyToken, async (req, res) => {
  const { harcamaId } = req.params
  const { aciklama, kullanim, miktar } = req.body

  try {
    const user = await User.findOne({ email: req.user.email })
    const userHarcamalar = await UserHarcamalar.findOne({ user: user._id })

    if (!userHarcamalar) {
      return res
        .status(404)
        .json({ message: "No expenses found for this user" })
    }

    const harcama = userHarcamalar.harcamalar.id(harcamaId)
    if (!harcama) {
      return res.status(404).json({ message: "Expense not found" })
    }

    harcama.aciklama = aciklama
    harcama.kullanim = kullanim
    harcama.miktar = miktar

    await userHarcamalar.save()

    res.json(userHarcamalar)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
