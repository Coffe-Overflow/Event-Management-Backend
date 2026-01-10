const mongoose = require('mongoose');

const organizerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, 
        trim: true
    },
    email: { 
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    contactPerson: { 
        type: String,
        required: true
    },
    eventsOrganized: { 
        type: Number,
        default: 0
    }
}, { 
    timestamps: true 
}); 

const Organizer = mongoose.model('Organizer', organizerSchema);
module.exports = Organizer;