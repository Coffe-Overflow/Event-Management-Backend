const fs = require('fs');
const path = require('path');

const organizersPath = path.join(__dirname, '../data/organizers.json');


const getOrganizers = () => {
    try {
        const data = fs.readFileSync(organizersPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const saveOrganizers = (organizers) => {
    fs.writeFileSync(organizersPath, JSON.stringify(organizers, null, 2));
};


exports.createOrganizer = (req, res) => {
    const organizers = getOrganizers();
    const newOrganizer = {
        id: 'org' + (organizers.length + 1).toString().padStart(3, '0'), 
        ...req.body,
        eventsOrganized: 0
    };
    organizers.push(newOrganizer);
    saveOrganizers(organizers);
    res.status(201).json(newOrganizer);
};


exports.getAllOrganizers = (req, res) => {
    res.json(getOrganizers());
};


exports.getOrganizerById = (req, res) => {
    const organizers = getOrganizers();
    const organizer = organizers.find(o => o.id === req.params.id);
    
    if (organizer) {
        res.json(organizer);
    } else {
        res.status(404).json({ message: "Organizer not found" });
    }
};


exports.updateOrganizer = (req, res) => {
    let organizers = getOrganizers();
    const index = organizers.findIndex(o => o.id === req.params.id);
    
    if (index !== -1) {
        organizers[index] = { ...organizers[index], ...req.body };
        saveOrganizers(organizers);
        res.json(organizers[index]);
    } else {
        res.status(404).json({ message: "Organizer not found" });
    }
};


exports.deleteOrganizer = (req, res) => {
    let organizers = getOrganizers();
    const initialLength = organizers.length;
    organizers = organizers.filter(o => o.id !== req.params.id);
    
    if (organizers.length < initialLength) {
        saveOrganizers(organizers);
        res.status(204).send(); 
    } else {
        res.status(404).json({ message: "Organizer not found" });
    }
};
