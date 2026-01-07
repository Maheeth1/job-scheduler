require("dotenv").config();

const express = require('express');
const cors = require('cors');
const jobController = require('./controllers/jobController');

const app = express();
app.use(cors()); // Allow Frontend access
app.use(express.json());

// Routes
app.post('/jobs', jobController.createJob);
app.get('/jobs', jobController.getJobs);
app.post('/run-job/:id', jobController.runJob);
app.get('/jobs/:id', jobController.getJobById);
app.delete('/jobs/:id', jobController.deleteJob);

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});