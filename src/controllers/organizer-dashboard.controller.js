const eventsService = require('../services/events.service');
const Organizer = require("../models/Organizer");
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

exports.getMyEvents = async (req, res) => {
  try {

    const userId = req.user.id;

    const organizer = await Organizer.findOne({ userId });

    if (!organizer) {
      return res.status(404).json({
        message: "Organizer not found for this user"
      });
    }

    const events = await Event.find({ organizerId: organizer._id });

    return res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
