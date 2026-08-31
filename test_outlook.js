const url = "https://outlook.office365.com/owa/calendar/32ea0f4a7d504f3e92117912db70104b@studio-graaf.be/832da2f40ba1481c8ad15914f78d1f5d1985632967064365978/calendar.ics";
console.log("Fetching directly...");
fetch(url).then(r => r.text()).then(t => console.log("Done", t.substring(0, 50))).catch(e => console.error("Error", e));
