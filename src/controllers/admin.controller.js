const eventsService = require('../services/events.service');
const utilityService = require('../services/utility.service');

exports.getDashboardStats = (req, res) => {
    const report = utilityService.generateCentralReport();
    const stats = {
        approvedEvents: report.totalEvents,
        totalParticipants: report.totalRegistrations,
        averageParticipants: Math.round(report.totalRegistrations / (report.totalEvents || 1)),
        pendingEvents: eventsService.getAllEvents().filter(e => e.status === 'PENDING').length
    };
    res.json(stats);
};

exports.getPendingEvents = (req, res) => {
    const allEvents = eventsService.getAllEvents();
    const pending = allEvents.filter(e => e.status === 'PENDING');
    res.json(pending);
};

exports.updateEventStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ message: "Status invalid." });
    }

    const updatedEvent = eventsService.updateEventStatus(id, status);
    
    if (!updatedEvent) {
        return res.status(404).json({ message: "Evenimentul nu a fost găsit." });
    }

    res.json({ message: `Status actualizat la ${status}`, event: updatedEvent });
};


exports.getReportTimeline = (req, res) => {
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
    res.json([
        { category: "Academic", count: 200 },
        { category: "Social", count: 450 },
        { category: "Carieră", count: 700 },
        { category: "Sportiv", count: 150 },
        { category: "Voluntariat", count: 39 }
    ]);
};

exports.getReportFaculties = (req, res) => {
    res.json([
        { facultyName: "Toate facultățile", participantsCount: 1298 },
        { facultyName: "Informatică", participantsCount: 201 }
    ]);
};