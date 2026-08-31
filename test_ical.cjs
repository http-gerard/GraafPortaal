const ical = require('./node_modules/node-ical');

(async () => {
  try {
    const url = 'https://outlook.office365.com/owa/calendar/32ea0f4a7d504f3e92117912db70104b@studio-graaf.be/832da2f40ba1481c8ad15914f78d1f5d1985632967064365978/calendar.ics';
    const events = await ical.async.fromURL(url);
    const parsedEvents = [];
    
    for (const k in events) {
      if (events.hasOwnProperty(k)) {
        const ev = events[k];
        if (ev.type === 'VEVENT') {
          const startDate = ev.start;
          if (!startDate) continue;
          
          parsedEvents.push({
            id: ev.uid || Math.random().toString(),
            title: typeof ev.summary === 'string' ? ev.summary : (ev.summary?.val || 'Outlook Meeting'),
            type: 'Extern',
            date: startDate.toISOString().split('T')[0],
            time: startDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
            location: typeof ev.location === 'string' ? ev.location : (ev.location?.val || 'Outlook'),
            isOutlook: true,
            status: startDate > new Date() ? 'Gepland' : 'Voltooid'
          });
        }
      }
    }
    console.log(JSON.stringify(parsedEvents.slice(0, 5), null, 2));
    console.log("Total events:", parsedEvents.length);
  } catch (err) {
    console.error("Error parsing ICS:", err);
  }
})();
