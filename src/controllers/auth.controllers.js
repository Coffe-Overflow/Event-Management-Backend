const User = require("../models/User"); 

const bcrypt = require('bcryptjs'); 

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {

 const user = await User.findOne({ email }); 

if (!user) {
return res.status(401).json({ message: "Email sau parolă incorectă" });
}

 const isMatch = await bcrypt.compare(password, user.password);

if (!isMatch) {
 return res.status(401).json({ message: "Email sau parolă incorectă" });
 }
    

const token = `fake-jwt-token-for-${user._id}`;

    res.json({
      token,
      user: {
        id: user._id, 
        name: user.name,
        email: user.email,
        role: user.role,
        faculty: user.faculty
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Eroare internă la autentificare." });
  }
console.log("LOGIN BODY:", req.body);
console.log("EMAIL:", email);
console.log("PASSWORD:", password);
};

exports.register = async (req, res) => {
  const { name, email, password, role, faculty } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Emailul este deja folosit." });
    }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    const newUser = new User({
      name,
      email,
      password: hashedPassword, 
      role:  "STUDENT", 
      faculty: faculty || ""
    });

    const savedUser = await newUser.save(); 

    res.status(201).json({ message: "Cont creat cu succes!", userId: savedUser._id });
  } catch (error) {

    console.error("Registration Error:", error);
    res.status(400).json({ 
        message: "Eroare la înregistrare. Datele trimise sunt invalide sau lipsesc câmpuri obligatorii.", 
        error: error.message 
    });
  }
};

exports.logout = (req, res) => {
    res.status(200).json({ message: "Logout realizat cu succes." });
};

