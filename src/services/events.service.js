const Event = require('../models/Event');
const notificationService = require('./notification.service');
const crypto = require("crypto");

exports.getEvents = async (filters = {}) => {
  const query = { status: 'APPROVED' };

  if (filters.type) {
    query.type = new RegExp(`^${filters.type}$`, 'i');
  }

  if (filters.faculty) {
    query.faculty = new RegExp(filters.faculty, 'i');
  }

  if (filters.q) {
    const q = new RegExp(filters.q, 'i');
    query.$or = [{ title: q }, { description: q }];
  }

  return Event.find(query);
};

exports.getEventById = async (id) => {
  return Event.findById(id);
};


exports.createEvent = async (data, organizerId) => {
  const event = new Event({
    organizerId,
    title: data.title,
    description: data.description,
    type: data.type,
    faculty: data.faculty,
    department: data.department || '',
    location: data.location,
    date: new Date(data.date),
    startTime: data.startTime,
    endTime: data.endTime || '',
    maxParticipants: data.maxParticipants && Number(data.maxParticipants) > 0 
      ? Number(data.maxParticipants) 
      : 9999, // Setează o limită mare dacă nu este specificată
    status: 'PENDING',
    image: data.image || null,
    participants: []
  });

  return event.save();
};

exports.registerForEvent = async (eventId, userData) => {
  const { name, email, studentId ,id } = userData;
  const ticketCode = crypto.randomUUID();

  // Încercăm update-ul atomic direct în baza de date
  const updatedEvent = await Event.findOneAndUpdate(
    {
      _id: eventId,
      "participants.email": { $ne: email.toLowerCase() },
      $or: [
        { maxParticipants: { $exists: false } },
        { maxParticipants: 0 },
        { $expr: { $lt: [{ $size: "$participants" }, "$maxParticipants"] } }
      ]
    },
    {
      $push: {
        participants: { 
          userId: id, 
          name: name, 
          email: email.toLowerCase(), 
          studentId: studentId,
          ticketCode: ticketCode,
          isCheckedIn: false,
          registrationDate: new Date() 
        }
      }
    },
    { new: true, runValidators: true }
  );

  // Dacă update-ul a eșuat, investigăm motivul pentru a arunca eroarea corectă
  if (!updatedEvent) {
    const event = await Event.findById(eventId);
    if (!event) throw new Error("EVENT_NOT_FOUND");

    const isAlreadyRegistered = event.participants.some(
      p => p.email === email.toLowerCase()
    );
    
    if (isAlreadyRegistered) throw new Error("ALREADY_REGISTERED");

    throw new Error("CONCURRENCY_FULL");
  }

  // Trimitem notificarea (asincron, nu așteptăm după ea pentru a răspunde utilizatorului)
  /*notificationService.sendRegistrationConfirmation(email, updatedEvent.title)
    .catch(err => console.warn('Email confirmation failed:', err.message));
  */
 
  // Returnăm datele necesare pentru controller
  return {
    success: true,
    registeredCount: updatedEvent.participants.length,
    ticketCode
  };
};

exports.getParticipants = async (eventId) => {
  const event = await Event.findById(eventId);
  if (!event) return { error: 'Event not found' };
  return event.participants;
};
