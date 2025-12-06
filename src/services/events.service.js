const fs = require('fs');
const path = require('path');
const eventsPath = path.join(__dirname, '../data/events.json'); 
const notificationService = require('./notification.service');



const getEventsData = () => {
    try {
        const data = fs.readFileSync(eventsPath, 'utf8');
        return JSON.parse(data).map(event => ({
            ...event,
            participants: event.participants || [], 
            registered: event.participants ? event.participants.length : (event.registered || 0)
        }));
    } catch (error) {
        return [];
    }
};

const saveEventsData = (events) => {
    fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2));
};



exports.getEvents = (filters) => {
  let result = getEventsData(); 

  
  if (filters.type) {
    result = result.filter(e => e.type.toLowerCase() === filters.type.toLowerCase());
  }
  if (filters.faculty) {
    result = result.filter(e => e.faculty.toLowerCase().includes(filters.faculty.toLowerCase()));
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    result = result.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q)
    );
  }
  return result;
};

exports.getEventById = (id) => {
  return getEventsData().find(e => e.id === id);
};

exports.createEvent = (data) => {
  const events = getEventsData();
  const newEvent = {
    id: String(events.length + 1), 
    ...data,
    registered: 0,
    participants: [],
    reviews: [],
    image: null
  };
  events.push(newEvent);
  saveEventsData(events);
  return newEvent;
};


exports.registerForEvent = (eventId, participantData) => {
    let events = getEventsData();
    const eventIndex = events.findIndex(e => e.id === eventId);

    if (eventIndex === -1) return { error: "Event not found" };

    const event = events[eventIndex];

    if (event.maxParticipants && (event.registered >= event.maxParticipants)) {
        return { error: "Event is full" };
    }
    if (event.participants.some(p => p.email.toLowerCase() === participantData.email.toLowerCase())) {
        return { error: "Participant already registered" };
    }

    const newParticipant = { ...participantData, registrationDate: new Date().toISOString() };
    event.participants.push(newParticipant);
    event.registered = event.participants.length;
    
    saveEventsData(events);

    notificationService.sendRegistrationConfirmation(participantData.email, event.title);

    return event;
};


exports.getParticipants = (eventId) => {
    const event = getEventsData().find(e => e.id === eventId);
    if (!event) return { error: "Event not found" };
    return event.participants; 
};


exports.removeParticipant = (eventId, participantEmail) => {
    let events = getEventsData();
    const eventIndex = events.findIndex(e => e.id === eventId);

    if (eventIndex === -1) return { error: "Event not found" };

    const event = events[eventIndex];
    const initialParticipantsLength = event.participants.length;

    event.participants = event.participants.filter(p => p.email.toLowerCase() !== participantEmail.toLowerCase());

    if (event.participants.length === initialParticipantsLength) {
        return { error: "Participant not found" };
    }

    event.registered = event.participants.length;
    saveEventsData(events);

    return event;
};
