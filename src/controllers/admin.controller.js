const Event = require("../models/Event");
const User = require("../models/User");

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
    const { status } = req.body;

    if (!["PENDING", "APPROVED", "REJECTED", "FINISHED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({
      message: "Event status updated successfully",
      event
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
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

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["STUDENT", "ORGANIZER", "ADMIN"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Role updated successfully",
      userId: user._id,
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("name email role faculty createdAt") 
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error("ADMIN GET USERS ERROR:", error);
    res.status(500).json({
      message: "Eroare la obținerea utilizatorilor."
    });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const { name, email, faculty } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(email && { email }),
        ...(faculty && { faculty })
      },
      {
        new: true,         
        runValidators: true
      }
    ).select("name email role faculty createdAt");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("ADMIN UPDATE USER ERROR:", error);
    res.status(500).json({
      message: "Eroare la actualizarea utilizatorului."
    });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({
        message: "Nu îți poți șterge propriul cont."
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        message: "Utilizator inexistent."
      });
    }

    res.json({
      message: "Utilizator șters cu succes."
    });
  } catch (error) {
    console.error("ADMIN DELETE USER ERROR:", error);
    res.status(500).json({
      message: "Eroare la ștergerea utilizatorului."
    });
  }
};