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

exports.registerForEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const user = req.user;

        if (!user || !user.id) {
            return res.status(401).json({ message: "Utilizator neautentificat." });
        }

        const participantData = {
            name: user.name,
            email: user.email,
            studentId: user.id
        };

        const result = await eventsService.registerForEvent(eventId, participantData);

        if (result.error) {
            if (result.error === "Event not found")
                return res.status(404).json({ message: "Evenimentul nu a fost găsit." });

            if (result.error === "Event is full")
                return res.status(403).json({ message: "Evenimentul este complet." });

            if (result.error === "Participant already registered")
                return res.status(409).json({ message: "Sunteți deja înscris." });

            return res.status(500).json({ message: result.error });
        }

        res.status(200).json({
            message: "Înscriere reușită!",
            ticket: result.ticket
        });
    } catch (err) {
        console.error("REGISTER EVENT ERROR:", err);
        res.status(500).json({
            message: "Eroare la înscrierea la eveniment.",
            error: err.message
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
