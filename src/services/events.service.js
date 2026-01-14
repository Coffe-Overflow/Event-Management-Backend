const Event = require('../models/Event');
const notificationService = require('./notification.service');

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

exports.registerForEvent = async (eventId, user) => {
  const event = await Event.findById(eventId);

  if (!event) {
    return { error: 'Event not found' };
  }

  if (
    event.maxParticipants > 0 &&
    event.participants.length >= event.maxParticipants
  ) {
    return { error: 'Event is full' };
  }

  const alreadyRegistered = event.participants.some(
    p => p.userId?.toString() === user.id
  );

  if (alreadyRegistered) {
    return { error: 'Already registered' };
  }

  const ticketCode = `QR-${event._id}-${Date.now()}`;

  const participant = {
    userId: user.id,
    name: user.name,
    email: user.email,
    ticketCode,
    isCheckedIn: false,
    registrationDate: new Date()
  };

  event.participants.push(participant);
  await event.save();

  try {
    await notificationService.sendRegistrationConfirmation(
      user.email,
      event.title
    );
  } catch (e) {
    console.warn('Email not sent:', e.message);
  }

  return {
    success: true,
    ticketCode
  };
};

exports.getParticipants = async (eventId) => {
  const event = await Event.findById(eventId);
  if (!event) return { error: 'Event not found' };
  return event.participants;
};
