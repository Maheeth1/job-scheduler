const db = require('../config/db');
const triggerWebhook = require('../utils/webhook');

// 1. Create Job
exports.createJob = (req, res) => {
    const { taskName, payload, priority } = req.body;
    
    // Basic Validation
    if (!taskName || !priority) {
        return res.status(400).json({ error: "Task Name and Priority are required." });
    }

    const payloadString = JSON.stringify(payload || {});
    const sql = `INSERT INTO jobs (taskName, payload, priority, status) VALUES (?, ?, ?, 'pending')`;

    db.run(sql, [taskName, payloadString, priority], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, taskName, priority, status: 'pending' });
    });
};

// 2. Get All Jobs (with Filtering)
exports.getJobs = (req, res) => {
    const { status, priority } = req.query;
    let sql = "SELECT * FROM jobs WHERE 1=1";
    const params = [];

    if (status) { sql += " AND status = ?"; params.push(status); }
    if (priority) { sql += " AND priority = ?"; params.push(priority); }

    sql += " ORDER BY createdAt DESC";

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// 3. Run Job (The Simulation Logic)
exports.runJob = (req, res) => {
    const { id } = req.params;

    // Step A: Set to Running
    db.run("UPDATE jobs SET status = 'running' WHERE id = ?", [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Job not found" });

        // Respond immediately so UI updates
        res.json({ message: `Job ${id} started`, status: 'running' });

        // Step B: Simulate Background Process (3 seconds)
        setTimeout(() => {
            const completedAt = new Date().toISOString();
            
            // Step C: Mark Completed
            db.run("UPDATE jobs SET status = 'completed', completedAt = ? WHERE id = ?", [completedAt, id], (err) => {
                if (err) console.error("Error updating job status:", err);
                
                // Step D: Trigger Webhook
                // Fetch full job details to send to webhook
                db.get("SELECT * FROM jobs WHERE id = ?", [id], (err, row) => {
                    if (row) triggerWebhook(row);
                });
            });
        }, 3000); 
    });
};

// 4. Get Job by ID
exports.getJobById = (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM jobs WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Job not found" });

    res.json(row);
  });
};

// 5. Delete Job by ID
exports.deleteJob = (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM jobs WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Job not found" });
    res.json({ message: `Job ${id} deleted` });
  });
};
