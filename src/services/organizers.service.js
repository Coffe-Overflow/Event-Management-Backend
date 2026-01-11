const Organizer = require("../models/Organizer");
const Event = require("../models/Event");


async function getAllOrganizers() {
  return Organizer.find({});
}

async function getOrganizerById(id) {
  return Organizer.findById(id);
}

async function getOrganizerByUserId(userId) {
  return Organizer.findOne({ userId });
}

async function createOrganizer(data) {
  return Organizer.create({
    ...data,
    eventsOrganized: data.eventsOrganized || 0
  });
}

async function updateOrganizer(id, data) {
  return Organizer.findByIdAndUpdate(id, data, { new: true });
}

async function deleteOrganizer(id) {
  return Organizer.findByIdAndDelete(id);
}


async function getEventsForOrganizer(userId) {
  const organizer = await Organizer.findOne({ userId });
  if (!organizer) throw new Error("Organizer not found");

  return Event.find({ organizer: organizer._id });
}

async function createEventForOrganizer(userId, eventData) {
  const organizer = await Organizer.findOne({ userId });
  if (!organizer) throw new Error("Organizer not found");

  const lastEvent = await Event.findOne().sort({ id: -1 });
  const nextId = lastEvent ? lastEvent.id + 1 : 1;

  const event = await Event.create({
    ...eventData,
    id: nextId,
    organizer: organizer._id,  
    status: "PENDING",
    registered: 0,
    participants: []
  });

  organizer.eventsOrganized += 1;
  await organizer.save();

  return event;
}

async function updateEventForOrganizer(userId, eventId, data) {
  const organizer = await Organizer.findOne({ userId });
  if (!organizer) throw new Error("Organizer not found");

  const event = await Event.findOneAndUpdate(
    { id: eventId, organizer: organizer._id },
    data,
    { new: true }
  );

  if (!event) throw new Error("Event not found or not owned by organizer");

  return event;
}

async function deleteEventForOrganizer(userId, eventId) {
  const organizer = await Organizer.findOne({ userId });
  if (!organizer) throw new Error("Organizer not found");

  const event = await Event.findOneAndDelete({
    id: eventId,
    organizer: organizer._id
  });

  if (!event) throw new Error("Event not found or not owned by organizer");

  organizer.eventsOrganized = Math.max(0, organizer.eventsOrganized - 1);
  await organizer.save();

  return event;
}


async function getOrganizerStats(userId) {
  const organizer = await Organizer.findOne({ userId });
  if (!organizer) throw new Error("Organizer not found");

  const events = await Event.find({ organizer: organizer._id });

  return {
    organizer: organizer.name,
    totalEvents: events.length,
    totalParticipants: events.reduce(
      (sum, e) => sum + (e.participants?.length || 0),
      0
    ),
    pendingEvents: events.filter(e => e.status === "PENDING").length,
    approvedEvents: events.filter(e => e.status === "APPROVED").length
  };
}

module.exports = {
  getAllOrganizers,
  getOrganizerById,
  getOrganizerByUserId,
  createOrganizer,
  updateOrganizer,
  deleteOrganizer,

  getEventsForOrganizer,
  createEventForOrganizer,
  updateEventForOrganizer,
  deleteEventForOrganizer,

  getOrganizerStats
};
