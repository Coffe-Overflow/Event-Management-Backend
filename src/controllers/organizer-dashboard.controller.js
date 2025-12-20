const eventsService = require('../services/events.service');
const Event = require("../models/Event");

exports.getOrganizerStats = async (req, res) => {
    try {
        const { organizerId } = req.query;

        if (!organizerId) {
            return res.status(400).json({ message: "ID-ul organizatorului lipsește." });
        }

        const events = await Event.find({ organizerId });

        // Calculăm datele
        const totalEvents = events.length;
        const pendingApproval = events.filter(e => e.status === "PENDING").length;
        const totalParticipants = events.reduce((acc, curr) => acc + (curr.participants?.length || 0), 0);
        const averageParticipants = totalEvents > 0 ? Math.round(totalParticipants / totalEvents) : 0;

        // IMPORTANT: Cheile de mai jos trebuie să fie identice cu cele din interfață
        res.json({
            totalEvents,          // Frontend: stats.totalEvents
            totalParticipants,    // Frontend: stats.totalParticipants
            averageParticipants,  // Frontend: stats.averageParticipants
            pendingApproval       // Frontend: stats.pendingApproval
        });
    } catch (err) {
        res.status(500).json({ message: "Eroare server", error: err.message });
    }
};

// PATCH /organizer/checkin/:qrCode
exports.checkInParticipant = (req, res) => {
    const { qrCode } = req.params;
    
    // Logica de check-in: Căutăm participantul după codul QR în toate evenimentele
    // QR-ul ar trebui să fie unic (ex: generatedString)
    
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