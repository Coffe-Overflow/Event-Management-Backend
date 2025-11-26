const eventsService = require("../services/events.service");

exports.getEvents = (req, res) => {
  const { type, faculty, q } = req.query;
  const events = eventsService.getEvents({ type, faculty, q });
  res.json(events);
};

exports.getEventById = (req, res) => {
  const event = eventsService.getEventById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json(event);
};

exports.createEvent = (req, res) => {
  const event = eventsService.createEvent(req.body);
  res.status(201).json(event);
};
