// src/services/events.service.js
// NOU: Importăm modelul Event Mongoose
const mongoose = require('mongoose');
const Event = require('../models/Event');
// Am păstrat notificationService, dar vom elimina celelalte importuri vechi
// const notificationService = require('./notification.service');

// Eliminăm funcțiile de citire/scriere pe fișier: getEventsData și saveEventsData
// VECHI: const fs = require('fs');
// VECHI: const path = require('path');
// VECHI: const eventsPath = path.join(__dirname, '../data/events.json');
// VECHI: const getEventsData = () => { ... };
// VECHI: const saveEventsData = (events) => { ... };

// NOU: Funcție simplă pentru toate evenimentele (va fi folosită rar, deoarece avem filtrare)
exports.getAllEvents = async () => {
    // Folosim .find() și populăm organizatorul (presupunând că organizerId a fost corect salvat)
    return await Event.find({}).populate('organizerId'); 
};

// NOU: Funcția de filtrare (folosește puterea MongoDB)
exports.getEvents = async (filters) => {
    const query = {};

    // 1. GESTIONARE STATUS ȘI ROLURI
    if (filters.status) {
        // Dacă s-a cerut un status specific (ex: PENDING pentru admin), îl folosim
        query.status = filters.status;
    } else if (filters.organizerId && filters.organizerId !== "") {
        // Pentru organizator, arătăm tot (fără filtru de status implicit)
        try {
            query.organizerId = new mongoose.Types.ObjectId(filters.organizerId);
        } catch (err) {
            console.error("ID Organizator invalid:", filters.organizerId);
        }
    } else {
        // Implicit pentru studenți, arătăm doar cele aprobate
        query.status = 'APPROVED';
    }
    
    // 2. FILTRE CATEGORIE / FACULTATE
    if (filters.type && filters.type !== "") {
        query.type = new RegExp('^' + filters.type + '$', 'i'); 
    }
    if (filters.faculty && filters.faculty !== "") {
        query.faculty = new RegExp(filters.faculty, 'i');
    }

    // 3. SEARCH TEXT
    if (filters.q ) {
        const q = new RegExp(filters.q, 'i');
        query.$or = [{ title: q }, { description: q }];
    }

    try {
        // Sortăm după data creării (cele mai noi primele)
        const eventsList = await Event.find(query)
            .populate('organizerId', 'name') // Cerem explicit câmpul 'name' din User
            .sort({ createdAt: -1 });
            
        return eventsList || [];
    } catch (error) {
        console.error("Eroare la interogarea bazei de date:", error);
        throw error;
    }
};

// NOU: Găsirea după ID (folosește _id Mongoose)
exports.getEventById = async (id) => {
    // Mongoose știe să găsească după _id și să populeze organizatorul
    return await Event.findById(id).populate('organizerId'); 
};

exports.createEvent = async (data) => {
    // 1. Conversie corectă din zz.ll.aaaa în obiect Date valid
    let finalDate;
    if (typeof data.date === 'string' && data.date.includes('.')) {
        const [day, month, year] = data.date.split('.');
        finalDate = new Date(`${year}-${month}-${day}`);
    } else {
        finalDate = new Date(data.date);
    }

    // Verificăm dacă data rezultată este validă
    if (isNaN(finalDate.getTime())) {
        throw new Error("Data evenimentului este invalidă.");
    }

    // 2. Gestionare maxParticipants (Trebuie să fie > 0 sau undefined dacă e gol)
    const parsedParticipants = parseInt(data.maxParticipants);
    const maxParticipants = (parsedParticipants > 0) ? parsedParticipants : undefined;

    const newEventData = {
        organizerId: data.organizerId,
        title: data.title,
        description: data.description,
        type: data.type || data.category, // Mapare automată
        faculty: data.faculty,
        department: data.department || "",
        location: data.location,
        date: finalDate, // Folosim variabila procesată corect
        startTime: data.startTime,
        endTime: data.endTime || "",
        maxParticipants: maxParticipants, // Trimitem undefined dacă nu avem o valoare validă (>0)
        status: "PENDING",
        image: data.imageUrl || null
    };
    
    return await Event.create(newEventData);
};

// NOU: Înregistrarea la eveniment
exports.registerForEvent = async (eventId, participantData) => {
    // 1. Găsim evenimentul după ID
    const event = await Event.findById(eventId); 

    if (!event) return { error: "Event not found" };

    // 2. Verificări de capacitate și duplicat
    const currentParticipants = event.participants.length;

    if (event.maxParticipants && (currentParticipants >= event.maxParticipants)) {
        return { error: "Event is full" };
    }
    if (event.participants.some(p => p.email.toLowerCase() === participantData.email.toLowerCase())) {
        return { error: "Participant already registered" };
    }

    // 3. Creăm participantul și codul QR
    const ticketCode = `QR-${eventId}-${Date.now()}`;
    const newParticipant = { 
        ...participantData, 
        ticketCode, 
        isCheckedIn: false, 
        registrationDate: new Date()
    };

    // 4. Adăugăm participantul la sub-colecție și salvăm
    event.participants.push(newParticipant);
    // Nu mai trebuie să actualizăm 'registered', deoarece este un câmp virtual
    await event.save(); 

    // notificationService.sendRegistrationConfirmation(participantData.email, event.title);
    return { success: true, ticket: newParticipant, ...event.toObject({ virtuals: true }) }; // toObject pentru a include câmpul 'registered'
};

// NOU: Obținerea participanților
exports.getParticipants = async (eventId) => {
    const event = await Event.findById(eventId); 
    if (!event) return { error: "Event not found" };
    return event.participants;
};

// NOU: Actualizarea statusului
exports.updateEventStatus = async (id, status) => {
    // .findByIdAndUpdate găsește, actualizează și returnează documentul nou
    const updatedEvent = await Event.findByIdAndUpdate(
        id, 
        { status: status }, 
        { new: true } // Returnează noul document
    );
    return updatedEvent;
};

// NOU: Check-in prin QR
exports.checkInByQR = async (qrCodeString) => {
    // Căutăm evenimentul care conține acel ticketCode în sub-colecția 'participants'
    const event = await Event.findOne({ 'participants.ticketCode': qrCodeString });

    if (!event) {
        return { success: false, message: "Bilet invalid." };
    }

    // Găsim participantul în array
    const participant = event.participants.find(p => p.ticketCode === qrCodeString);
    const pIndex = event.participants.findIndex(p => p.ticketCode === qrCodeString);

    if (participant.isCheckedIn) {
        return { success: false, message: "Check-in deja efectuat." };
    }
    
    // Actualizăm starea participantului în array și salvăm
    event.participants[pIndex].isCheckedIn = true;
    await event.save(); 

    return { success: true, student: participant.name, eventTitle: event.title };
};
// La finalul src/services/events.service.js
module.exports = {
    getAllEvents: exports.getAllEvents,
    getEvents: exports.getEvents,
    getEventById: exports.getEventById,
    createEvent: exports.createEvent,
    registerForEvent: exports.registerForEvent,
    getParticipants: exports.getParticipants,
    updateEventStatus: exports.updateEventStatus,
    checkInByQR: exports.checkInByQR
};