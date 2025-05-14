const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Load service account credentials
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const calendarId = 'lslandscape100@gmail.com'; // your calendar ID
const credentials = require('./credentials.json');

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES,
});

const calendar = google.calendar({ version: 'v3', auth });

app.post('/api/book', async (req, res) => {
  const { summary, start, end } = req.body;

  if (!summary || !start || !end) {
    return res.status(400).json({ error: 'Missing event details' });
  }

  const event = {
    summary,
    start: {
      dateTime: start,
      timeZone: 'America/New_York', // adjust to your timezone
    },
    end: {
      dateTime: end,
      timeZone: 'America/New_York',
    },
  };

  try {
    await calendar.events.insert({
      calendarId,
      resource: event,
    });

    res.status(200).json({ message: 'Event created successfully' });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
