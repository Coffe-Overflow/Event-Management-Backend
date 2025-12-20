// src/models/Event.js
const mongoose = require('mongoose');

// --- SUB-SCHEMA: Participanți ---
const participantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    studentId: String, // ID-ul studentului
    ticketCode: String,
    isCheckedIn: { type: Boolean, default: false },
    registrationDate: { type: Date, default: Date.now }
}, { _id: false }); // Fără _id separat pentru sub-documente, dacă nu este necesar

// --- SUB-SCHEMA: Recenzii ---
const reviewSchema = new mongoose.Schema({
    user: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    date: { type: Date, default: Date.now }
}, { _id: false });

// --- SCHEMA PRINCIPALĂ: Eveniment ---
const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    type: { type: String, required: true },
    faculty: String,
    department: String,
    location: { type: String, required: true },
    date: { type: Date, required: true }, // Combinăm date și orele într-un singur Date field (sau le lăsăm separate)
    startTime: String,
    endTime: String,
    maxParticipants: {
        type: Number,
        required: false,
        min: 1
    },
    // Relația cheie: referință la _id-ul Organizatorului
    organizerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Face referință la modelul Organizer
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'FINISHED'],
        default: 'PENDING'
    },
    image: String,
    
    // Sub-documente
    reviews: [reviewSchema],
    participants: [participantSchema],

    // Câmp virtual pentru "registered" (număr calculat)
    // Vom elimina câmpul 'registered' din salvare, el va fi calculat automat
}, {
    timestamps: true,
    toJSON: { virtuals: true }, // Permite afișarea câmpului virtual când convertim la JSON
    toObject: { virtuals: true } 
});

// Adaugăm o proprietate virtuală pentru 'registered'
eventSchema.virtual('registered').get(function() {
    return this.participants.length;
});


const Event = mongoose.model('Event', eventSchema);
module.exports = Event;