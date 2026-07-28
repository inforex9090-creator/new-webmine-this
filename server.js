const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;
const SUBMISSIONS_FILE = path.join(__dirname, 'submissions.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const NTFY_TOPIC = process.env.NTFY_TOPIC || 'webmine-inquiries-59a8c2';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Helpers to read/write submissions
function getSubmissions() {
  if (!fs.existsSync(SUBMISSIONS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(SUBMISSIONS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error("Error reading submissions file:", error);
    return [];
  }
}

function saveSubmissions(submissions) {
  try {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error("Error writing submissions file:", error);
    return false;
  }
}

// Send Push Notification via ntfy.sh
function sendNtfyNotification(submission) {
  const url = `https://ntfy.sh/${NTFY_TOPIC}`;
  
  const message = `Name: ${submission.name}\nEmail: ${submission.email}\nServices: ${submission.services.join(', ') || 'None'}\n\nDescription: ${submission.description}`;
  
  const options = {
    method: 'POST',
    headers: {
      'Title': 'New Webmine Media Inquiry!',
      'Priority': 'high',
      'Tags': 'incoming_envelope,computer,iphone'
    }
  };

  const req = https.request(url, options, (res) => {
    console.log(`Notification sent to topic "${NTFY_TOPIC}". Status: ${res.statusCode}`);
  });

  req.on('error', (e) => {
    console.error(`Error sending push notification: ${e.message}`);
  });

  req.write(message);
  req.end();
}

// Authentication Middleware
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized access. Invalid password.' });
  }
  next();
}

// Routes

// Serve landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve Get Started page
app.get('/get-started', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'get-started.html'));
});

// Serve Admin Dashboard page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// POST form submissions
app.post('/api/get-started', (req, res) => {
  const { name, email, services, description } = req.body;

  // Simple Validation
  if (!name || !email || !description) {
    return res.status(400).json({
      success: false,
      message: 'Please fill in all required fields (Name, Email, Description).'
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.'
    });
  }

  const newSubmission = {
    id: Date.now().toString(),
    name,
    email,
    services: services || [],
    description,
    createdAt: new Date().toISOString()
  };

  const submissions = getSubmissions();
  submissions.push(newSubmission);

  if (saveSubmissions(submissions)) {
    // Send instant push notification to Mobile/Computer
    sendNtfyNotification(newSubmission);

    return res.status(200).json({
      success: true,
      message: 'Thank you! Your project inquiry has been received. Our engineers will reach out shortly.'
    });
  } else {
    return res.status(500).json({
      success: false,
      message: 'Failed to process inquiry. Please try again later.'
    });
  }
});

// Admin Authentication POST
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, message: 'Authenticated successfully.' });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid password. Access denied.' });
  }
});

// GET all submissions (requires Admin Authentication)
app.get('/api/admin/submissions', authenticateAdmin, (req, res) => {
  const submissions = getSubmissions();
  res.json({ success: true, submissions });
});

// DELETE a submission (requires Admin Authentication)
app.delete('/api/admin/submissions/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  let submissions = getSubmissions();
  const initialLength = submissions.length;
  
  submissions = submissions.filter(item => item.id !== id);
  
  if (submissions.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Inquiry not found.' });
  }

  if (saveSubmissions(submissions)) {
    return res.json({ success: true, message: 'Inquiry deleted successfully.' });
  } else {
    return res.status(500).json({ success: false, message: 'Failed to delete record.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Webmine Express Server running at http://localhost:${PORT}/`);
  console.log(`Press Ctrl+C to terminate.`);
});
