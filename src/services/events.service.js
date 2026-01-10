// src/services/events.service.js
// NOU: Importăm modelul Event Mongoose
const Event = require('../models/Event');
// Am păstrat notificationService, dar vom elimina celelalte importuri vechi
const notificationService = require('./notification.service');

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
    const query = { status: 'APPROVED' }; // Filtru implicit: doar evenimentele aprobate

    if (filters.type) {
        // Căutare exactă pe câmpul 'type'
        query.type = new RegExp('^' + filters.type + '$', 'i'); 
    }
    if (filters.faculty) {
        // Căutare parțială pe câmpul 'faculty'
        query.faculty = new RegExp(filters.faculty, 'i');
    }
    if (filters.q) {
        const q = new RegExp(filters.q, 'i'); // Regex 'i' pentru case-insensitive
        // Căutare pe Titlu SAU Descriere (folosim operatorul $or)
        query.$or = [{ title: q }, { description: q }];
    }

    // Executăm interogarea și populăm detaliile organizatorului
    return await Event.find(query).populate('organizerId');
};

// NOU: Găsirea după ID (folosește _id Mongoose)
exports.getEventById = async (id) => {
    // Mongoose știe să găsească după _id și să populeze organizatorul
    return await Event.findById(id).populate('organizerId'); 
};

// NOU: Crearea unui eveniment
exports.createEvent = async (data) => {
    // Eliminăm logica complexă de generare a ID-ului numeric
    // MongoDB generează _id automat.

    const newEventData = {
        // ATENȚIE: data.organizer trebuie să fie _id-ul Organizatorului, nu numele!
        organizerId: data.organizerId, // Presupunem că primești ID-ul, nu numele
        title: data.title,
        description: data.description,
        type: data.type,
        faculty: data.faculty,
        department: data.department || "",
        location: data.location,
        date: new Date(data.date), // Conversie explicită la Date
        startTime: data.startTime,
        endTime: data.endTime || "",
        maxParticipants: parseInt(data.maxParticipants) || 0,
        status: "PENDING",
        image: data.imageUrl || null
        // 'registered', 'participants' și 'reviews' sunt inițializate în model
    };
    
    // Inserăm evenimentul în baza de date
    const newEvent = await Event.create(newEventData);
    return newEvent;
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

    notificationService.sendRegistrationConfirmation(participantData.email, event.title);
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
