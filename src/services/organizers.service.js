// src/services/organizers.service.js
const Organizer = require('../models/Organizer'); // Importăm modelul

// Funcție pentru a găsi toți organizatorii
async function getAllOrganizers() {
    return await Organizer.find({});
}

// Funcție pentru a găsi un organizator după ID
async function getOrganizerById(id) {
    return await Organizer.findById(id);
}

// Funcție pentru a crea un nou organizator
async function createOrganizer(organizerData) {
    // MongoDB adaugă automat câmpul _id
    return await Organizer.create(organizerData);
}

// Funcție pentru a actualiza un organizator
async function updateOrganizer(id, updateData) {
    // { new: true } returnează documentul actualizat, nu cel vechi
    return await Organizer.findByIdAndUpdate(id, updateData, { new: true });
}

// Funcție pentru a șterge un organizator
async function deleteOrganizer(id) {
    return await Organizer.findByIdAndDelete(id);
}

module.exports = {
    getAllOrganizers,
    getOrganizerById,
    createOrganizer,
    updateOrganizer,
    deleteOrganizer
};