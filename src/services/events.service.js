const events = require("../data/events.json");

exports.getEvents = (filters) => {
  let result = [...events];

  if (filters.type) {
    result = result.filter(e => e.type === filters.type);
  }
  if (filters.faculty) {
    result = result.filter(e => e.faculty === filters.faculty);
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
  return events.find(e => e.id === id);
};

exports.createEvent = (data) => {
  const newEvent = {
    id: String(Date.now()),
    ...data,
  };
  events.push(newEvent);
  // pentru mvp poți lăsa doar în memorie; dacă vrei fișier, scrii în JSON
  return newEvent;
};
