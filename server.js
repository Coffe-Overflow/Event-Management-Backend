// 1. Includem dotenv pentru a incarca variabilele din .env
require('dotenv').config();

const app = require("./src/app");
const mongoose = require('mongoose'); // Adaugat: Modulul Mongoose
const fs = require('fs');      // <--- NOU
const path = require('path');  // <--- NOU

// Variabile de mediu
const PORT = process.env.PORT || 3000;
//const MONGO_URI = process.env.MONGO_URI; // Adaugat: Variabila URI din .env

// ************************************************************
// NOU: Setezi URI-ul MongoDB direct în cod (NU este recomandat pentru producție)
const MONGO_URI = process.env.MONGO_URI;
// Asigură-te că folosești URI-ul corect pentru baza ta de date!
// ************************************************************

// Functia asincrona pentru conectarea la DB si pornirea serverului
const startServer = async () => {
    // Verificam daca MONGO_URI este definit
    if (!MONGO_URI) {
        console.error("❌ EROARE: Variabila MONGO_URI nu este setata in fisierul .env!");
        process.exit(1);
    }
    
    try {
        // 2. Conectarea la MongoDB
        await mongoose.connect(MONGO_URI);
        console.log("✅ Conectat la MongoDB cu succes!");

        // 3. Pornirea serverului Express (DOAR DUPA conexiunea la DB)
        const server = app.listen(PORT, () => {
            console.log("Server pornit pe portul " + PORT);
        });
        
        // 4. Gestionarea erorilor serverului
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`EROARE: Portul ${PORT} este deja ocupat!`);
                console.error(`Încearcă să închizi alte terminale sau schimbă portul în 5001.`);
            } else {
                console.error("A apărut o eroare la server:", err);
            }
        });

    } catch (error) {
        // Tratarea erorilor de conectare la baza de date
        console.error("❌ EROARE FATALA: Conexiunea la MongoDB a eșuat!", error.message);
        // Oprim procesul Node in caz de esec critic
        process.exit(1); 
    }
};

// Apelam functia principala
startServer();
