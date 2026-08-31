fetch("http://localhost:3000/api/calendar/outlook?url=https://outlook.office365.com/owa/calendar/32ea0f4a7d504f3e92117912db70104b@studio-graaf.be/832da2f40ba1481c8ad15914f78d1f5d1985632967064365978/calendar.ics")
  .then(res => res.text().then(text => console.log("Status:", res.status, "Body:", text)))
  .catch(err => console.error("Fetch error:", err));
