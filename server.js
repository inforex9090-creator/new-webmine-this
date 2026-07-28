const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SUBMISSIONS_FILE = path.join(__dirname, 'submissions.json');

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

// Routes

// Serve landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve Get Started page
app.get('/get-started', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'get-started.html'));
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

// API endpoint to retrieve all submissions (for debugging/verification)
app.get('/api/submissions', (req, res) => {
  const submissions = getSubmissions();
  res.json(submissions);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Webmine Express Server running at http://localhost:${PORT}/`);
  console.log(`Press Ctrl+C to terminate.`);
});
