const eventsService = require('../services/events.service');

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