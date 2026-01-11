const eventsService = require('../services/events.service');
const Organizer = require("../models/Organizer");
const organizerService = require("../services/organizers.service");
const Event = require("../models/Event");
const { Parser } = require("json2csv");

const getOrganizerStats = async (req, res) => {
  try {
    const organizer = await organizerService.getOrganizerByUserId(req.user.id);
    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    const events = await Event.find({ organizerId: organizer._id });

    const totalParticipants = events.reduce(
      (sum, e) => sum + e.participants.length,
      0
    );

    res.json({
      totalEvents: events.length,
      totalParticipants,
      averageParticipants: events.length
        ? (totalParticipants / events.length).toFixed(2)
        : 0,
      pendingApproval: events.filter(e => e.status === 'PENDING').length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const getMyEvents = async (req, res) => {
  try {
    const organizer = await organizerService.getOrganizerByUserId(req.user.id);
    if (!organizer) {
      return res.status(404).json({
        message: "Organizer not found for this user"
      });
    }

    const events = await Event.find({
      organizerId: organizer._id
    });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const createEvent = async (req, res) => {
  try {
    const organizer = await organizerService.getOrganizerByUserId(req.user.id);
    if (!organizer) {
      return res.status(404).json({
        message: "Organizer not found for this user"
      });
    }

    const event = await Event.create({
      ...req.body,
      organizerId: organizer._id
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create event",
      error: error.message
    });
  }
};


const updateEvent = async (req, res) => {
  try {
    const organizer = await organizerService.getOrganizerByUserId(req.user.id);
    if (!organizer) {
      return res.status(404).json({
        message: "Organizer not found for this user"
      });
    }

    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, organizerId: organizer._id },
      req.body,
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        message: "Event not found or not owned by organizer"
      });
    }

    res.json(event);
  } catch (err) {
    res.status(400).json({
      message: "Failed to update event",
      error: err.message
    });
  }
};


const deleteEvent = async (req, res) => {
  try {
    const organizer = await organizerService.getOrganizerByUserId(req.user.id);
    if (!organizer) {
      return res.status(404).json({
        message: "Organizer not found for this user"
      });
    }

    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      organizerId: organizer._id
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found or not owned by organizer"
      });
    }

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getEventParticipants = async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;

    const organizer = await Organizer.findOne({ userId });
    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    const event = await Event.findOne({
      _id: eventId,
      organizerId: organizer._id
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found or not owned by organizer"
      });
    }

    res.json(event.participants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const exportParticipantsCSV = async (req, res) => {
  try {
    const organizer = await Organizer.findOne({ userId: req.user.id });
    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    const event = await Event.findOne({
      _id: req.params.id,
      organizerId: organizer._id
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found or not owned by organizer"
      });
    }

    if (!event.participants.length) {
      return res.status(400).json({
        message: "No participants to export"
      });
    }

    const fields = [
      { label: "Name", value: "name" },
      { label: "Email", value: "email" },
      { label: "Student ID", value: "studentId" },
      { label: "Checked In", value: "isCheckedIn" },
      { label: "Registration Date", value: "registrationDate" }
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(event.participants);

    res.header("Content-Type", "text/csv");
    res.attachment(`participants-${event._id}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const checkInParticipant = async (req, res) => {
  try {
    const organizer = await Organizer.findOne({ userId: req.user.id });
    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    const event = await Event.findOne({
      organizerId: organizer._id,
      "participants.ticketCode": req.params.qrCode
    });

    if (!event) {
      return res.status(404).json({
        message: "Participant or event not found"
      });
    }

    const participant = event.participants.find(
      p => p.ticketCode === req.params.qrCode
    );

    if (participant.isCheckedIn) {
      return res.status(400).json({
        message: "Participant already checked in"
      });
    }

    participant.isCheckedIn = true;
    await event.save();

    res.json({
      message: "Check-in successful",
      participant: {
        name: participant.name,
        email: participant.email
      },
      event: event.title
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  getOrganizerStats,
  getMyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventParticipants,
  exportParticipantsCSV,
  checkInParticipant
};
