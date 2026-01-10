// src/app.js

const express = require("express");
const cors = require("cors");
const path = require("path"); 

// Import Rute
const eventsRouter = require("./routes/events.routes");
const organizersRouter = require("./routes/organizers.routes");
const utilityRouter = require("./routes/utility.routes"); // <-- LINIA 10: COMENTAT
const authRouter = require("./routes/auth.routes"); 
const adminRouter = require("./routes/admin.routes"); 

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json()); // Permite aplicației să parseze cererile cu body JSON

// Configurare pentru a servi fișierele statice (imagini uploadate)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- DEFINIRE RUTE API ---
app.use("/api/events", eventsRouter);
app.use("/api/organizers", organizersRouter);

// NOU: Introducem un router minimalist/test pe linia 25 pentru a înlocui utilityRouter
const testRouter = express.Router();
testRouter.get('/test', (req, res) => res.status(200).send('Router de Test OK'));
app.use("/api/utility", testRouter); // <-- LINIA 26: Aici folosești acum testRouter

app.use("/api/auth", authRouter);       
app.use("/api/admin", adminRouter);     

// Handler pentru rute inexistente (404)
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

module.exports = app;
