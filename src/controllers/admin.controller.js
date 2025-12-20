const eventsService = require('../services/events.service');
const utilityService = require('../services/utility.service');
const Event = require('../models/Event');

// --- EXISTING CODE (Păstrează ce ai deja) ---
exports.getDashboardStats = async (req, res) => {
    try {
        // Preluăm toate evenimentele pentru calcul
        const allEvents = await Event.find({});

        const approvedEvents = allEvents.filter(e => e.status === 'APPROVED');
        const pendingEventsCount = allEvents.filter(e => e.status === 'PENDING').length;
        
        // Calculăm numărul total de participanți la evenimentele aprobate
        const totalParticipants = approvedEvents.reduce((sum, event) => 
            sum + (event.participants ? event.participants.length : 0), 0);

        const averageParticipants = approvedEvents.length > 0 
            ? Math.round(totalParticipants / approvedEvents.length) 
            : 0;

        res.json({
            approvedEvents: approvedEvents.length,
            totalParticipants,
            averageParticipants,
            pendingEvents: pendingEventsCount
        });
    } catch (err) {
        res.status(500).json({ message: "Eroare la calcularea statisticilor", error: err.message });
    }
};

// Preia toate evenimentele cu statusul PENDING
exports.getPendingEvents = async (req, res) => {
    try {
        // Trebuie să ne asigurăm că serviciul primește obiectul de filtru corect
        // și că serviciul NU suprascrie acest status în interior
        const pendingEvents = await eventsService.getEvents({ status: "PENDING", isAdmin: true });
        res.json(pendingEvents);
    } catch (err) {
        res.status(500).json({ message: "Eroare la preluarea evenimentelor în așteptare.", error: err.message });
    }
};

// Actualizează statusul unui eveniment (Aprobare/Respingere)
exports.validateEvent = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Așteaptă "APPROVED" sau "REJECTED"

    try {
        const updatedEvent = await eventsService.updateEventStatus(id, status);
        if (!updatedEvent) {
            return res.status(404).json({ message: "Evenimentul nu a fost găsit." });
        }
        res.json({ message: `Evenimentul a fost ${status === 'APPROVED' ? 'aprobat' : 'respins'}.`, event: updatedEvent });
    } catch (err) {
        res.status(500).json({ message: "Eroare la validarea evenimentului.", error: err.message });
    }
};

// --- COD NOU (ADAUGĂ ASTA LA FINAL) ---

exports.getReportTimeline = (req, res) => {
    // Date fictive pentru graficul "Evoluția ultimelor 6 luni"
    res.json([
        { month: "Iun 2025", eventsCount: 2, participantsCount: 150 },
        { month: "Iul 2025", eventsCount: 0, participantsCount: 0 },
        { month: "Aug 2025", eventsCount: 1, participantsCount: 50 },
        { month: "Sep 2025", eventsCount: 5, participantsCount: 400 },
        { month: "Oct 2025", eventsCount: 8, participantsCount: 600 },
        { month: "Nov 2025", eventsCount: 12, participantsCount: 1499 }
    ]);
};

exports.getReportCategories = (req, res) => {
    // Date fictive pentru graficul "Distribuție pe tipuri"
    res.json([
        { category: "Academic", count: 200 },
        { category: "Social", count: 450 },
        { category: "Carieră", count: 700 },
        { category: "Sportiv", count: 150 },
        { category: "Voluntariat", count: 39 }
    ]);
};

exports.getReportFaculties = (req, res) => {
    // Date fictive pentru top facultăți
    res.json([
        { facultyName: "Toate facultățile", participantsCount: 1298 },
        { facultyName: "Informatică", participantsCount: 201 }
    ]);
};