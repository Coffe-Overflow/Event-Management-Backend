const eventsService = require("../services/events.service");


exports.getEvents = async (req, res) => {
    const { type, faculty, q } = req.query;
    try {
        const events = await eventsService.getEvents({ type, faculty, q });
        res.json(events);
    } catch (err) {
        console.error("Eroare la getEvents:", err); 
        res.status(500).json({ message: "Eroare la filtrarea evenimentelor.", error: err.message });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await eventsService.getEventById(req.params.id);
        
        if (!event) return res.status(404).json({ message: "Event not found" });

        res.json(event.toObject({ virtuals: true })); 
    } catch (err) {
        if (err.kind === 'ObjectId') {
             return res.status(404).json({ message: "ID Eveniment invalid." });
        }
        res.status(500).json({ message: "Eroare la obținerea evenimentului.", error: err.message });
    }
};

exports.createEvent = async (req, res) => {
    try {

        const event = await eventsService.createEvent(req.body);
        res.status(201).json(event);
    } catch (err) {

        res.status(400).json({ message: "Eroare la crearea evenimentului. Verificați datele.", error: err.message });
    }
};

const Event = require("../models/Event");
const crypto = require("crypto");

exports.registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, studentId } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Numele și emailul sunt obligatorii." });
    }

    const ticketCode = crypto.randomUUID();

    // Încercăm update-ul atomic
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: id,
        "participants.email": { $ne: email.toLowerCase() },
        $expr: { $lt: [{ $size: "$participants" }, "$maxParticipants"] }
      },
      {
        $push: {
          participants: { name, email: email.toLowerCase(), studentId, ticketCode }
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      // Dacă a eșuat, verificăm motivul
      const event = await Event.findById(id);
      if (!event) return res.status(404).json({ message: "Evenimentul nu există." });

      if (event.participants.some(p => p.email === email.toLowerCase())) {
        return res.status(400).json({ message: "Ești deja înscris la acest eveniment." });
      }

      // DACĂ AJUNGE AICI, E CLAR CĂ S-A UMPLUT
      return res.status(409).json({ message: "CONCURRENCY_FULL" }); // Trimitem un cod special
    }

    res.status(200).json({ message: "Înscriere realizată cu succes.", registered: updatedEvent.participants.length });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      message: "Eroare la înscrierea la eveniment.",
      error: error.message
    });
  }
};

exports.unregisterFromEvent = async (req, res) => {
  try {
    const { id } = req.params;    
    const { email } = req.body;
    
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: id },
      { 
        $pull: { participants: { email: email.toLowerCase() } } 
      },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Evenimentul nu există." });
    }

    res.status(200).json({
      message: "Înscriere anulată cu succes.",
      registered: updatedEvent.participants.length
    });
  } catch (error) {
    res.status(500).json({ message: "Eroare la anularea înscrierii." });
  }
};

exports.getParticipants = async (req, res) => {
    try {
        const event = await eventsService.getEventById(req.params.id); 
        
        if (!event) return res.status(404).json({ message: "Event not found" });
        
        res.json({
            eventTitle: event.title,
            participants: event.participants || []
        });
    } catch (err) {
        res.status(500).json({ message: "Eroare la obținerea participanților.", error: err.message });
    }
};

exports.addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating-ul trebuie să fie între 1 și 5."
      });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Eveniment inexistent." });
    }

    const alreadyReviewed = event.reviews.some(
      r => r.userId.toString() === userId
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        message: "Ai lăsat deja o recenzie la acest eveniment."
      });
    }

    event.reviews.push({
      rating,
      comment,
      userId
    });

    await event.save();

    res.status(201).json({
      message: "Recenzie adăugată cu succes."
    });
  } catch (error) {
    console.error("ADD REVIEW ERROR:", error);
    res.status(500).json({
      message: "Eroare la adăugarea recenziei."
    });
  }
};

exports.getEventReviews = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("reviews.userId", "name");

    if (!event) {
      return res.status(404).json({ message: "Eveniment inexistent." });
    }

    res.json(event.reviews);
  } catch (error) {
    res.status(500).json({
      message: "Eroare la obținerea recenziilor."
    });
  }
};
