require('dotenv').config();

const app = require("./src/app");
const mongoose = require('mongoose'); 
const fs = require('fs');    
const path = require('path');  

const PORT = process.env.PORT || 3000;

const MONGO_URI = process.env.MONGO_URI;

const startServer = async () => {
    if (!MONGO_URI) {
        console.error("EROARE: Variabila MONGO_URI nu este setata in fisierul .env!");
        process.exit(1);
    }
    
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Conectat la MongoDB cu succes!");
        const server = app.listen(PORT, () => {
            console.log("Server pornit pe portul " + PORT);
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`EROARE: Portul ${PORT} este deja ocupat!`);
                console.error(`Încearcă să închizi alte terminale sau schimbă portul în 5001.`);
            } else {
                console.error("A apărut o eroare la server:", err);
            }
        });

    } catch (error) {
        console.error(" EROARE FATALA: Conexiunea la MongoDB a eșuat!", error.message);
        process.exit(1); 
    }
};

startServer();
