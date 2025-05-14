// index.js or app.js

const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Body parser middleware to parse JSON data
app.use(bodyParser.json());

// Path to your credentials file (make sure it's in the same directory)
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

// Create a JWT client for Google Calendar API
const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
const { client_email, private_key } = credentials;

const auth = new google.auth.JWT(
  client_email,
  null,
  private_key,
  ['https://www.googleapis.com/auth/calendar'],
);

// Function to authenticate and insert event into Google Calendar
async function createCalendarEvent(eventDetails) {
  try {
    // Authorize with Google Calendar API
    await auth.authorize();

    // Create a calendar API instance
    const calendar = google.calendar({ version: 'v3', auth });

    // Insert the event
    const event = {
      summary: eventDetails.title,
      description: eventDetails.description || 'No description',
      start: {
        dateTime: eventDetails.start,
        timeZone: 'America/New_York', // Adjust to your timezone
      },
      end: {
        dateTime: eventDetails.end,
        timeZone: 'America/New_York',
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'lslandscape100@gmail.com', // You can replace this with your specific calendar ID
      resource: event,
    });

    console.log('Event created:', response.data);
    return response.data; // Return event details
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

// API route to handle the booking request
app.post('/book-appointment', async (req, res) => {
  const { title, start, end, description } = req.body;

  if (!title || !start || !end) {
    return res.status(400).json({ error: 'Missing required fields: title, start, and end.' });
  }

  try {
    // Call createCalendarEvent function to create an event in Google Calendar
    const event = await createCalendarEvent({ title, start, end, description });
    res.status(200).json({ message: 'Appointment booked successfully!', event });
  } catch (error) {
    res.status(500).json({ error: 'Failed to book the appointment.' });
  }
});

// Serve static files (optional, for your front-end if needed)
app.use(express.static(path.join(__dirname, 'public')));

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

