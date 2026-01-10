const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    studentId: String, 
    ticketCode: String,
    isCheckedIn: { type: Boolean, default: false },
    registrationDate: { type: Date, default: Date.now }
}, { _id: false }); 


const reviewSchema = new mongoose.Schema({
    user: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    date: { type: Date, default: Date.now }
}, { _id: false });

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
    date: { type: Date, required: true }, 
    startTime: String,
    endTime: String,
    maxParticipants: {
        type: Number,
        min: 1
    },
    organizerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organizer', 
        required: false
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'FINISHED'],
        default: 'PENDING'
    },
    image: String,
    reviews: [reviewSchema],
    participants: [participantSchema],
}, {
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
});

eventSchema.virtual('registered').get(function() {
    return this.participants.length;
});


const Event = mongoose.model('Event', eventSchema);
module.exports = Event;