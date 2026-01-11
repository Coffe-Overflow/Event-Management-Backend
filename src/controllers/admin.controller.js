const Event = require("../models/Event");

/**
 * =========================
 * ADMIN DASHBOARD STATS
 * GET /admin/stats/dashboard
 * =========================
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const approvedEvents = await Event.countDocuments({ status: "APPROVED" });
    const pendingEvents = await Event.countDocuments({ status: "PENDING" });

    const approvedEventsList = await Event.find(
      { status: "APPROVED" },
      { participants: 1 }
    );

    const totalParticipants = approvedEventsList.reduce(
      (sum, event) => sum + (event.participants?.length || 0),
      0
    );

    const averageParticipants =
      approvedEvents > 0
        ? Number((totalParticipants / approvedEvents).toFixed(2))
        : 0;

    res.json({
      approvedEvents,
      pendingEvents,
      totalParticipants,
      averageParticipants
    });
  } catch (error) {
    res.status(500).json({
      message: "Eroare la obținerea statisticilor admin",
      error: error.message
    });
  }
};

/**
 * ==========================================
 * LISTA EVENIMENTE ÎN AȘTEPTARE (PENDING)
 * GET /admin/events/pending
 * ==========================================
 */
exports.getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "PENDING" }).sort({
      createdAt: -1
    });

    res.json(events);
  } catch (error) {
    res.status(500).json({
      message: "Eroare la obținerea evenimentelor în așteptare",
      error: error.message
    });
  }
};

/**
 * ==========================================
 * APROBĂ / RESPINGE EVENIMENT
 * PATCH /admin/events/:id/status
 * Body: { status: "APPROVED" | "REJECTED" }
 * ==========================================
 */
exports.updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        message: "Status invalid. Folosește APPROVED sau REJECTED."
      });
    }

    const event = await Event.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        message: "Evenimentul nu a fost găsit"
      });
    }

    res.json({
      message: `Eveniment ${status === "APPROVED" ? "aprobat" : "respins"} cu succes`,
      event
    });
  } catch (error) {
    res.status(500).json({
      message: "Eroare la actualizarea statusului evenimentului",
      error: error.message
    });
  }
};
