const Organizer = require("../models/Organizer");
const Event = require("../models/Event");


async function getAllOrganizers() {
  return await Organizer.find({});
}

async function getOrganizerById(id) {
  return await Organizer.findById(id);
}

async function getOrganizerByUserId(userId) {
  return await Organizer.findOne({ userId });
}

async function createOrganizer(organizerData) {
  return await Organizer.create({
    ...organizerData,
    eventsOrganized: organizerData.eventsOrganized || 0
  });
}

async function updateOrganizer(id, updateData) {
  return await Organizer.findByIdAndUpdate(id, updateData, { new: true });
}

async function deleteOrganizer(id) {
  return await Organizer.findByIdAndDelete(id);
}


async function getEventsForOrganizer(userId) {
  const organizer = await Organizer.findOne({ userId });

  if (!organizer) {
    throw new Error("Organizer not found for this user");
  }

  return await Event.find({ organizer: organizer.name });
}

async function createEventForOrganizer(userId, eventData) {
  const organizer = await Organizer.findOne({ userId });

  if (!organizer) {
    throw new Error("Organizer not found for this user");
  }

  const lastEvent = await Event.findOne().sort({ id: -1 });
  const nextId = lastEvent ? lastEvent.id + 1 : 1;

  const event = new Event({
    ...eventData,
    id: nextId,
    organizer: organizer.name,
    status: "PENDING",
    registered: 0,
    participants: []
  });

  await event.save();

  organizer.eventsOrganized += 1;
  await organizer.save();

  return event;
}

async function updateEventForOrganizer(userId, eventId, updateData) {
  const organizer = await Organizer.findOne({ userId });

  if (!organizer) {
    throw new Error("Organizer not found for this user");
  }

  const event = await Event.findOne({
    id: eventId,
    organizer: organizer.name
  });

  if (!event) {
    throw new Error("Event not found or not owned by organizer");
  }

  Object.assign(event, updateData);
  await event.save();

  return event;
}

async function deleteEventForOrganizer(userId, eventId) {
  const organizer = await Organizer.findOne({ userId });

  if (!organizer) {
    throw new Error("Organizer not found for this user");
  }

  const event = await Event.findOneAndDelete({
    id: eventId,
    organizer: organizer.name
  });

  if (!event) {
    throw new Error("Event not found or not owned by organizer");
  }

  organizer.eventsOrganized = Math.max(0, organizer.eventsOrganized - 1);
  await organizer.save();

  return event;
}


async function getOrganizerStats(userId) {
  const organizer = await Organizer.findOne({ userId });

  if (!organizer) {
    throw new Error("Organizer not found for this user");
  }

  const events = await Event.find({ organizer: organizer.name });

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
