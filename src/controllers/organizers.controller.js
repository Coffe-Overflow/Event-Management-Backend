// src/controllers/organizers.controller.js
const organizerService = require('../services/organizers.service'); // Importăm serviciul

// GET /api/organizers
exports.listOrganizers = async (req, res) => {
    try {
        const organizers = await organizerService.getAllOrganizers();
        res.json(organizers);
    } catch (error) {
        res.status(500).json({ message: 'Eroare la obținerea listei de organizatori', error: error.message });
    }
};

// GET /api/organizers/:id
exports.getOrganizer = async (req, res) => {
    try {
        const organizer = await organizerService.getOrganizerById(req.params.id);
        if (!organizer) {
            return res.status(404).json({ message: 'Organizatorul nu a fost găsit' });
        }
        res.json(organizer);
    } catch (error) {
        res.status(500).json({ message: 'Eroare la obținerea organizatorului', error: error.message });
    }
};

// POST /api/organizers
exports.createOrganizer = async (req, res) => {
    try {
        const newOrganizer = await organizerService.createOrganizer(req.body);
        res.status(201).json(newOrganizer);
    } catch (error) {
        res.status(400).json({ message: 'Eroare la crearea organizatorului', error: error.message });
    }
};

// PUT /api/organizers/:id
exports.updateOrganizer = async (req, res) => {
    try {
        const updatedOrganizer = await organizerService.updateOrganizer(req.params.id, req.body);
        if (!updatedOrganizer) {
            return res.status(404).json({ message: 'Organizatorul nu a fost găsit' });
        }
        res.json(updatedOrganizer);
    } catch (error) {
        res.status(400).json({ message: 'Eroare la actualizarea organizatorului', error: error.message });
    }
};

// DELETE /api/organizers/:id
exports.deleteOrganizer = async (req, res) => {
    try {
        const deletedOrganizer = await organizerService.deleteOrganizer(req.params.id);
        if (!deletedOrganizer) {
            return res.status(404).json({ message: 'Organizatorul nu a fost găsit' });
        }
        res.status(204).send(); // Răspuns fără conținut pentru ștergere reușită
    } catch (error) {
        res.status(500).json({ message: 'Eroare la ștergerea organizatorului', error: error.message });
    }
};
