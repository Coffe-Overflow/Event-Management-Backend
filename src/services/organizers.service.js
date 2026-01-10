const Organizer = require('../models/Organizer'); 

async function getAllOrganizers() {
    return await Organizer.find({});
}

async function getOrganizerById(id) {
    return await Organizer.findById(id);
}

async function createOrganizer(organizerData) {
    return await Organizer.create(organizerData);
}

async function updateOrganizer(id, updateData) {
    return await Organizer.findByIdAndUpdate(id, updateData, { new: true });
}

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