const mongoose = require('mongoose');

const runSchema = new mongoose.Schema({
    projectId: { type: String, required: true },
    runId: { type: String, required: true },

    totalRequests:Number,
    success:Number,
    failure:Number,
    avgLatency:Number,
    p95Latency:Number,
    rps:Number,

    createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Run', runSchema);