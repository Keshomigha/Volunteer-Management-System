import sequelize from '../config/database.js';
import Event from '../models/eventModel.js';

async function removeMockEventsWithTimestamps() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // List all events first to inspect titles
    const allEvents = await Event.findAll();
    console.log(`Current Total Events in Database: ${allEvents.length}`);

    // Filter events that have timestamps (digits > 5 chars) or match "Blood Donation Camp 178"
    const timestampEvents = allEvents.filter(e => /\d{5,}/.test(e.title) || /Blood Donation Camp 178/i.test(e.title));

    console.log(`Found ${timestampEvents.length} timestamped mock event(s) to remove:`);
    timestampEvents.forEach(e => console.log(` - [ID ${e.id}] "${e.title}"`));

    // Delete matching events
    for (const ev of timestampEvents) {
      await Event.destroy({ where: { id: ev.id } });
    }

    console.log(`Successfully deleted ${timestampEvents.length} event(s) from database.`);

    const remainingEvents = await Event.findAll();
    console.log(`Remaining Events in Database: ${remainingEvents.length}`);
    remainingEvents.forEach(e => console.log(` - [ID ${e.id}] "${e.title}"`));

    process.exit(0);
  } catch (err) {
    console.error('Error removing mock events:', err);
    process.exit(1);
  }
}

removeMockEventsWithTimestamps();
