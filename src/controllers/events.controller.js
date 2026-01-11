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

exports.registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, studentId } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Numele și emailul sunt obligatorii."
      });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Evenimentul nu există." });
    }

    const alreadyRegistered = event.participants.some(
      p => p.email.toLowerCase() === email.toLowerCase()
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        message: "Ești deja înscris la acest eveniment."
      });
    }

    const ticketCode = crypto.randomUUID();
    event.participants.push({
      name,
      email,
      studentId,
      ticketCode
    });

    await event.save();

    res.status(200).json({
      message: "Înscriere realizată cu succes.",
      registered: event.participants.length
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      message: "Eroare la înscrierea la eveniment.",
      error: error.message
    });
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
