const fs = require('fs');
const path = require('path');
const eventsPath = path.join(__dirname, '../data/events.json'); 
const organizersPath = path.join(__dirname, '../data/organizers.json');

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

const getOrganizersData = () => {
    try {
        const data = fs.readFileSync(organizersPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

exports.generateCentralReport = () => {
    const events = getEventsData();
    const organizers = getOrganizersData();
    const totalEvents = events.length;
    const totalOrganizers = organizers.length;

    const totalRegistrations = events.reduce((sum, event) => sum + event.registered, 0);
    const mostPopularEvent = events.reduce((prev, current) => {
        return (prev.registered > current.registered) ? prev : current;
    }, { registered: -1 });
    const organizerCounts = events.reduce((acc, event) => {
        const name = event.organizer;
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {});

    let topOrganizerName = "Niciunul";
    let maxEvents = 0;
    for (const [name, count] of Object.entries(organizerCounts)) {
        if (count > maxEvents) {
            maxEvents = count;
            topOrganizerName = name;
        }
    }

    return {
        title: "Raport Centralizat de Management",
        dateGenerated: new Date().toISOString().split('T')[0],
        totalEvents: totalEvents,
        totalOrganizers: totalOrganizers,
        totalRegistrations: totalRegistrations,
        mostPopularEvent: {
            title: mostPopularEvent.title || "N/A",
            registered: mostPopularEvent.registered > -1 ? mostPopularEvent.registered : 0
        },
        topOrganizer: {
            name: topOrganizerName,
            eventsCount: maxEvents
        }
    };
};

module.exports = { };