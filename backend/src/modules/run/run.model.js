const mongoose = require('mongoose');

const runSchema = new mongoose.Schema({
    projectId: { type: String, required: true },
    runId: { type: String, required: true },
    status: { type: String, default: 'running' },
    config: { type: Object },
    configurationSnapshot: { type: Object },
    chaosConfig: { type: Object },
    url: { type: String },

    owner:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required:true,
    },

    // Core metrics
    totalRequests: Number,
    success: Number,
    failure: Number,
    avgLatency: Number,
    p95Latency: Number,
    rps: Number,

    // Chaos experiment metrics
    chaosInjected: Number,
    chaosSuccess: Number,
    chaosFailure: Number,
    latencyInjected: Number,
    failureInjected: Number,
    timeoutInjected: Number,
    packetLossInjected: Number,
    connectionResetInjected: Number,

    // Detailed metrics
    latencyBuckets: {
      "0-500": Number,
      "500-1000": Number,
      "1000-2000": Number,
      "2000+": Number,
    },
    
    errorTypes: {
      timeout: Number,
      network: Number,
      server: Number,
    },

    latencyTimeline: [{
      time: Number,
      latency: Number,
      request: Number,
    }],
    
    failureTimeline: [{
      time: Number,
    }],

    completedAt: Date,
    simulationCompletedEmailSentAt: Date,
    simulationCompletedEmailFailedAt: Date,
    simulationCompletedEmailError: String,

    createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Run', runSchema);
