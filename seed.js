// seed.js

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); 

const Organizer = require('./src/models/Organizer');
const User = require('./src/models/User'); 
const Event = require('./src/models/Event'); 

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventManagementDB'; 

const dataDir = path.join(__dirname, 'src', 'data');

const readJsonFile = (filename) => {
    const filePath = path.join(dataDir, filename);
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData);
};


const importData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Conectat la MongoDB pentru seeding.");

        await Organizer.deleteMany();
        await User.deleteMany();
        await Event.deleteMany();
        console.log(" Datele vechi au fost șterse.");

        let organizerData = readJsonFile('organizers.json');

        let userData = readJsonFile('users.json');
        let eventData = readJsonFile('events.json');

        const organizers = await Organizer.insertMany(organizerData);
        console.log(` ${organizers.length} organizatori adăugați din JSON!`);
        
        const users = await User.insertMany(userData);
        console.log(`🧑‍💻 ${users.length} utilizatori adăugați din JSON!`);

        const firstOrganizerId = organizers.length > 0 ? organizers[0]._id : null; 

        if (firstOrganizerId) {
            eventData = eventData.map(event => ({
                ...event,
                organizerId: firstOrganizerId 
            }));
            
            const events = await Event.insertMany(eventData);
            console.log(` ${events.length} evenimente adăugate și mapate cu succes!`);
        } else {
            console.warn(" Nu s-au găsit organizatori. Evenimentele nu au putut fi legate.");
        }
        
        
    } catch (error) {
        console.error(" EROARE LA SEEDING:", error.message);
        console.log("\nAsigură-te că:");
        console.log("1. Ai fișierele events.json, organizers.json, users.json în src/data/.");
        console.log("2. Datele din fișiere respectă schemele Mongoose (câmpuri Required, Enum, etc.).");
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("Conexiunea la baza de date închisă.");
    }
};


// ************************************************************
// 4. RULAREA SCRIPTULUI
// ************************************************************
importData();
