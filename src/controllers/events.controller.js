const eventsService = require("../services/events.service");

// GET /events (Modificat: adăugat async/await)
exports.getEvents = async (req, res) => {
    const { type, faculty, q } = req.query;
    try {
        // Așteptăm rezultatul interogării MongoDB
        const events = await eventsService.getEvents({ type, faculty, q });
        res.json(events);
    } catch (err) {
        // Logarea erorii complete este utilă pentru debug
        console.error("Eroare la getEvents:", err); 
        res.status(500).json({ message: "Eroare la filtrarea evenimentelor.", error: err.message });
    }
};

// GET /events/:id (Modificat: adăugat async/await)
exports.getEventById = async (req, res) => {
    try {
        // Așteptăm rezultatul interogării MongoDB
        const event = await eventsService.getEventById(req.params.id);
        
        if (!event) return res.status(404).json({ message: "Event not found" });
        
        // Folosim .toObject({ virtuals: true }) pentru a include câmpul 'registered'
        res.json(event.toObject({ virtuals: true })); 
    } catch (err) {
        // Dacă ID-ul nu este un format valid de ObjectId, Mongoose aruncă o eroare
        if (err.kind === 'ObjectId') {
             return res.status(404).json({ message: "ID Eveniment invalid." });
        }
        res.status(500).json({ message: "Eroare la obținerea evenimentului.", error: err.message });
    }
};

// POST /events (Modificat: adăugat async/await)
exports.createEvent = async (req, res) => {
    try {
        // Așteptăm salvarea noului eveniment în DB
        const event = await eventsService.createEvent(req.body);
        res.status(201).json(event);
    } catch (err) {
        // Mongoose aruncă eroare 400 dacă datele sunt invalide (ex: câmp lipsă)
        res.status(400).json({ message: "Eroare la crearea evenimentului. Verificați datele.", error: err.message });
    }
};

// POST /events/:id/register (Modificat: adăugat async/await)
exports.registerForEvent = async (req, res) => {
    const eventId = req.params.id;
    const { name, email, studentId } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: "Numele și emailul sunt obligatorii." });
    }

    // Așteptăm rezultatul interogării MongoDB
    const result = await eventsService.registerForEvent(eventId, { name, email, studentId });

    if (result.error) {
        if (result.error === "Event not found") return res.status(404).json({ message: "Evenimentul nu a fost găsit." });
        if (result.error === "Event is full") return res.status(403).json({ message: "Evenimentul este complet." });
        if (result.error === "Participant already registered") return res.status(409).json({ message: "Sunteți deja înscris." });
        return res.status(500).json({ message: result.error });
    }

    res.status(200).json({
        message: "Înscriere reușită!",
        ticket: result.ticket
    });
};

// GET /events/:id/participants (Modificat: adăugat async/await)
exports.getParticipants = async (req, res) => {
    try {
        // Așteptăm rezultatul interogării MongoDB
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
