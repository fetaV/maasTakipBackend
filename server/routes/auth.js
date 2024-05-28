const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

function validatePassword(password) {
  if (password.length < 8) return "Password must be at least 8 characters long."
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter."
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter."
  if (!/[0-9]/.test(password))
    return "Password must contain at least one digit."
  if (!/[^A-Za-z0-9]/.test(password))
    return "Password must contain at least one special character."
  return null
}

router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 })
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

//Kullanıcı silme
router.delete("/users/:id", async (req, res) => {
  const { id } = req.params

  try {
    const user = await User.findOneAndDelete({ _id: id })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    console.log("User deleted:", user)
    res.status(204).end()
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Kullanıcı güncelleme
router.put("/users/:id", async (req, res) => {
  const { id } = req.params

  try {
    if (!req.body.username) {
      return res.status(400).json({ message: "Username is required." })
    }

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (req.body.password) {
      if (req.body.password.length < 8) {
        return res
          .status(400)
          .json({ message: "Password must be at least 8 characters long." })
      }
      if (!/[A-Z]/.test(req.body.password)) {
        return res.status(400).json({
          message: "Password must contain at least one uppercase letter.",
        })
      }
      if (!/[a-z]/.test(req.body.password)) {
        return res.status(400).json({
          message: "Password must contain at least one lowercase letter.",
        })
      }
      if (!/[0-9]/.test(req.body.password)) {
        return res
          .status(400)
          .json({ message: "Password must contain at least one digit." })
      }
      if (!/[^A-Za-z0-9]/.test(req.body.password)) {
        return res.status(400).json({
          message: "Password must contain at least one special character.",
        })
      }
      req.body.password = await bcrypt.hash(req.body.password, 10)
    }
    if (req.body.email) {
      user.email = req.body.email
    }
    if (req.body.username) {
      user.username = req.body.username
    }

    const updatedUser = await user.save()

    console.log("User updated:", updatedUser)
    res.status(200).json(updatedUser)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Kullanıcı kaydı
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body

    const passwordError = validatePassword(password)

    const hashedPassword = await bcrypt.hash(password, 10)
    const existingUser = await User.findOne({ email })

    if (!username) {
      return res.status(400).json({ message: "Username is required." })
    }

    if (existingUser) {
      return res.status(400).json({
        message:
          "This email address is already in use. Please enter another email address.",
      })
    }
    if (passwordError) {
      return res.status(400).json({ message: passwordError })
    }
    const user = new User({
      username,
      email,
      password: hashedPassword,
    })
    await user.save()
    res.status(201).send("User registered successfully")
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Kullanıcı girişi
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) throw new Error("User not found")

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) throw new Error("Wrong password, please check it!")

    let isAdmin = false

    if (user.email === "admin@admin.com") {
      isAdmin = true
    }

    const token = jwt.sign(
      { email: user.email, username: user.username, isAdmin },
      process.env.SECRET,
      {
        expiresIn: "1h",
      }
    )
    res.status(200).json({ token, username: user.username })
  } catch (err) {
    res.status(401).json({ message: err.message })
  }
})

// Özel bir middleware oluşturarak token geçerliliğini kontrol et
function verifyToken(req, res, next) {
  const token = req.headers["authorization"]
  if (!token) return res.status(401).send("Token not provided")

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).send("Token expired")
      } else {
        return res.status(401).send("Invalid token")
      }
    }
    req.user = decoded
    next()
  })
}

// Kullanıcıya token geçerliliğini kontrol eden middleware'ı uygula
router.get("/protected_route", verifyToken, (req, res) => {
  res.status(200).send("You have access")
})

module.exports = router
