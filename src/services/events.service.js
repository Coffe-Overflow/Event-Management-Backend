const Event = require('../models/Event');
const notificationService = require('./notification.service');

exports.getAllEvents = async () => {
    return await Event.find({}).populate('organizerId'); 
};

exports.getEvents = async (filters) => {
    const query = { status: 'APPROVED' }; 

    if (filters.type) {
        query.type = new RegExp('^' + filters.type + '$', 'i'); 
    }
    if (filters.faculty) {
        query.faculty = new RegExp(filters.faculty, 'i');
    }
    if (filters.q) {
        const q = new RegExp(filters.q, 'i'); 
        query.$or = [{ title: q }, { description: q }];
    }
    return await Event.find(query).populate('organizerId');
};

exports.getEventById = async (id) => {
    return await Event.findById(id).populate('organizerId'); 
};

exports.createEvent = async (data) => {

    const newEventData = {
        organizerId: data.organizerId, 
        title: data.title,
        description: data.description,
        type: data.type,
        faculty: data.faculty,
        department: data.department || "",
        location: data.location,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime || "",
        maxParticipants: parseInt(data.maxParticipants) || 0,
        status: "PENDING",
        image: data.imageUrl || null
    };
    const newEvent = await Event.create(newEventData);
    return newEvent;
};

exports.registerForEvent = async (eventId, participantData) => {
    const event = await Event.findById(eventId); 

    if (!event) return { error: "Event not found" };
    const currentParticipants = event.participants.length;

    if (event.maxParticipants && (currentParticipants >= event.maxParticipants)) {
        return { error: "Event is full" };
    }
    if (event.participants.some(p => p.email.toLowerCase() === participantData.email.toLowerCase())) {
        return { error: "Participant already registered" };
    }
    const ticketCode = `QR-${eventId}-${Date.now()}`;
    const newParticipant = { 
        ...participantData, 
        ticketCode, 
        isCheckedIn: false, 
        registrationDate: new Date()
    };
    event.participants.push(newParticipant);
    await event.save(); 

    notificationService.sendRegistrationConfirmation(participantData.email, event.title);
    return { success: true, ticket: newParticipant, ...event.toObject({ virtuals: true }) }; 
};

exports.getParticipants = async (eventId) => {
    const event = await Event.findById(eventId); 
    if (!event) return { error: "Event not found" };
    return event.participants;
};

exports.updateEventStatus = async (id, status) => {
    const updatedEvent = await Event.findByIdAndUpdate(
        id, 
        { status: status }, 
        { new: true } 
    );
    return updatedEvent;
};

exports.checkInByQR = async (qrCodeString) => {
    const event = await Event.findOne({ 'participants.ticketCode': qrCodeString });

    if (!event) {
        return { success: false, message: "Bilet invalid." };
    }
    const participant = event.participants.find(p => p.ticketCode === qrCodeString);
    const pIndex = event.participants.findIndex(p => p.ticketCode === qrCodeString);

    if (participant.isCheckedIn) {
        return { success: false, message: "Check-in deja efectuat." };
    }
    event.participants[pIndex].isCheckedIn = true;
    await event.save(); 

    return { success: true, student: participant.name, eventTitle: event.title };
};
