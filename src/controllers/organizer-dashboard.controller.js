const eventsService = require('../services/events.service');
const Organizer = require("../models/Organizer");
const organizerService = require("../services/organizers.service");
const Event = require("../models/Event");

exports.getOrganizerStats = (req, res) => {

    const organizerId = req.query.organizerId; 

    const allEvents = eventsService.getAllEvents();
    const myEvents = allEvents.filter(e => e.organizerId === organizerId); 

    const totalParticipants = myEvents.reduce((sum, e) => sum + (e.participants ? e.participants.length : 0), 0);

    res.json({
        totalEvents: myEvents.length,
        totalParticipants: totalParticipants,
        averageParticipants: myEvents.length ? (totalParticipants / myEvents.length).toFixed(2) : 0,
        pendingApproval: myEvents.filter(e => e.status === 'PENDING').length
    });
};

exports.checkInParticipant = (req, res) => {
    const { qrCode } = req.params;
    
    const result = eventsService.checkInByQR(qrCode);

    if (result.success) {
        res.json({ 
            success: true, 
            message: "Check-in realizat!", 
            student: result.student,
            event: result.eventTitle
        });
    } else {
        res.status(404).json({ success: false, message: result.message });
    }
};

const getMyEvents = async (req, res) => {
  try {
    const userId = req.user.id;

    const organizer = await Organizer.findOne({ userId });
    if (!organizer) {
      return res.status(404).json({
        message: "Organizer not found for this user"
      });
    }

    const events = await Event.find({
      organizer: organizer.name
    });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const userId = req.user.id;

    const organizer = await organizerService.getOrganizerByUserId(userId);

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
    const userId = req.user.id;
    const eventId = req.params.id;

    const organizer = await Organizer.findOne({ userId });
    if (!organizer) {
      return res.status(404).json({
        message: "Organizer not found for this user"
      });
    }

    const event = await Event.findOneAndUpdate(
      { _id: eventId, organizer: organizer.name },
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
    const userId = req.user.id;
    const eventId = req.params.id;

    const organizer = await Organizer.findOne({ userId });
    if (!organizer) {
      return res.status(404).json({
        message: "Organizer not found for this user"
      });
    }

    const event = await Event.findOneAndDelete({
      _id: eventId,
      organizer: organizer.name
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

module.exports = {
  getMyEvents,
  createEvent,
  updateEvent,
  deleteEvent
};
