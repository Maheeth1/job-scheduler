const axios = require('axios');

const WEBHOOK_URL = process.env.WEBHOOK_URL; 

const triggerWebhook = async (job) => {
    try {
        console.log(`🚀 Triggering webhook for Job #${job.id}...`);
        await axios.post(WEBHOOK_URL, {
            jobId: job.id,
            taskName: job.taskName,
            priority: job.priority,
            payload: JSON.parse(job.payload), // Parse back to JSON for the receiver
            completedAt: new Date().toISOString()
        });
        console.log(`✅ Webhook sent successfully for Job #${job.id}`);
    } catch (error) {
        console.error(`❌ Webhook failed for Job #${job.id}:`, error.message);
    }
};

module.exports = triggerWebhook;