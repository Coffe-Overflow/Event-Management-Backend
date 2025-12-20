const eventsService = require("../services/events.service");
const Event = require("../models/Event");

// GET /events
exports.getEvents = async (req, res) => {
    // MODIFICARE: Adaugă organizerId aici pentru a-l prelua din URL
    const { type, faculty, q, organizerId } = req.query; 
    try {
        // Trimite organizerId către serviciu
        const events = await eventsService.getEvents({ type, faculty, q, organizerId });
        res.json(events || []);
    } catch (err) {
        console.error("Eroare la getEvents:", err); 
        res.status(500).json([]);
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

// PUT /api/events/:id
exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // 1. Preluăm evenimentul actual din bază pentru a-i verifica statusul
        const currentEvent = await Event.findById(id);
        if (!currentEvent) return res.status(404).json({ message: "Eveniment negăsit" });

        // 2. Logică Status: 
        // Dacă evenimentul este REJECTED, îl trimitem înapoi în PENDING la editare.
        // Dacă este APPROVED, își păstrează statusul (nu intră în pending).
        if (currentEvent.status === "REJECTED") {
            updateData.status = "PENDING";
        } else {
            // Menținem statusul actual (ex: APPROVED rămâne APPROVED)
            updateData.status = currentEvent.status;
        }

        // 1. Prevenim transformarea organizerId în null dacă lipsește din body
        if (updateData.organizerId === null || updateData.organizerId === "") {
            delete updateData.organizerId;
        }

        // 2. Mapare sigură category -> type
        if (updateData.category) updateData.type = updateData.category;

        // 3. Procesare robustă pentru dată
        if (updateData.date) {
            const dateStr = String(updateData.date);
            if (dateStr.includes('.')) {
                const [d, m, y] = dateStr.split('.');
                updateData.date = new Date(`${y}-${m}-${d}`);
            } else {
                updateData.date = new Date(dateStr);
            }
        }

        const updated = await Event.findByIdAndUpdate(id, updateData, { 
            new: true, 
            runValidators: true 
        });

        if (!updated) return res.status(404).json({ message: "Eveniment negăsit" });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: "Eroare la actualizare", error: err.message });
    }
};

// DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
    try {
        const deleted = await Event.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Eveniment negăsit" });
        res.status(200).json({ message: "Șters cu succes" });
    } catch (err) {
        res.status(500).json({ message: "Eroare la ștergere", error: err.message });
    }
};