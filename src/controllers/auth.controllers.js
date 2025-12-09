// NOU: Importăm modelul User Mongoose
const User = require("../models/User"); 
// VECHI: const users = require("../data/users.json");

// Eliminăm require('fs') și 'path' deoarece Mongoose gestionează persistența
// VECHI: const fs = require("fs");
// VECHI: const path = require("path");

// Eliminăm funcția saveUsers, deoarece Mongoose salvează direct în DB
// VECHI: const saveUsers = (data) => { ... };


// Modificat pentru a fi funcție ASYNC
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // 1. Căutăm userul în MongoDB (folosim .findOne)
  // NOU: Caută un singur document care se potrivește cu email-ul și parola
  const user = await User.findOne({ email, password }); 
  // VECHI: const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Email sau parolă incorectă" });
  }

  // 2. Returnăm un token "fake"
  // Folosim _id-ul generat de MongoDB
  const token = `fake-jwt-token-for-${user._id}`;

  res.json({
    token,
    user: {
      id: user._id, // Folosim _id-ul MongoDB
      name: user.name,
      email: user.email,
      role: user.role,
      faculty: user.faculty
    }
  });
};

// Modificat pentru a fi funcție ASYNC
exports.register = async (req, res) => {
  const { name, email, password, role, faculty } = req.body;

  // 1. Verificăm dacă există deja în MongoDB (folosim .findOne)
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Emailul este deja folosit." });
  }

  // 2. Creăm userul nou folosind modelul Mongoose
  const newUser = new User({
    // Eliminăm id: "u" + Date.now() - MongoDB va genera _id automat
    name,
    email,
    password,
    role: role || "STUDENT", 
    faculty: faculty || ""
  });

  // 3. Salvăm userul în MongoDB
  const savedUser = await newUser.save(); 
  // VECHI: users.push(newUser);
  // VECHI: saveUsers(users); 

  res.status(201).json({ message: "Cont creat cu succes!", userId: savedUser._id });
};

// --- LOGICĂ NOUĂ --- (nu necesită modificări, nu accesează DB)
exports.logout = (req, res) => {
    res.status(200).json({ message: "Logout realizat cu succes." });
};
