const Event = require("../models/Event");

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


exports.getEventsByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    const allowedStatuses = ["PENDING", "APPROVED", "REJECTED"];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Status invalid. Folosește PENDING, APPROVED sau REJECTED"
      });
    }

    const events = await Event.find({ status }).sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({
      message: "Eroare la obținerea evenimentelor după status",
      error: error.message
    });
  }
};


exports.updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        message: "Status invalid. Folosește APPROVED sau REJECTED"
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        message: "Evenimentul nu a fost găsit"
      });
    }

    event.status = status;
    await event.save();

    res.json({
      message: "Status actualizat cu succes",
      event
    });

  } catch (error) {
    res.status(500).json({
      message: "Eroare la actualizarea statusului",
      error: error.message
    });
  }
};

exports.getEventsTimeline = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    const data = await Event.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEventsByCategory = async (req, res) => {
  try {
    const data = await Event.aggregate([
      {
        $group: {
          _id: "$type",
          total: { $sum: 1 }
        }
      }
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEventsByFaculty = async (req, res) => {
  try {
    const data = await Event.aggregate([
      {
        $group: {
          _id: "$faculty",
          total: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
