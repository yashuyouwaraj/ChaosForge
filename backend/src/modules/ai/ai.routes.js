const express = require("express");

const authMiddleware = require("../../middleware/auth.middleware");

const {
  getAnalysis,
  getModels,
  getAiMetrics,
  getAiStatus,
  getAiRoute,
  postStreamSkill,
  postExplainRun,
  postExplainDashboard,
  postExplainReport,
  postCompareRuns,
  postInvestigateIncident,
  postExecutiveBrief,
  postOptimizationAdvisor,
  postChaosAdvisor,
  postCapacityPlanner,
  postRunbook,
  postPostmortem,
  postAiReport,
  postWeeklyReview,
  postCreateConversation,
  getConversationById,
  getConversationList,
  patchConversation,
  deleteConversationById,
  postConversationMessage,
} = require("./ai.controller");

const router = express.Router();

router.get("/models", authMiddleware, getModels);
router.get("/metrics", authMiddleware, getAiMetrics);
router.get("/status", authMiddleware, getAiStatus);
router.get("/route", authMiddleware, getAiRoute);
router.post("/stream", authMiddleware, postStreamSkill);

router.post("/explain/run", authMiddleware, postExplainRun);
router.post("/explain/dashboard", authMiddleware, postExplainDashboard);
router.post("/explain/report", authMiddleware, postExplainReport);

router.post("/compare", authMiddleware, postCompareRuns);
router.post("/incident/investigate", authMiddleware, postInvestigateIncident);
router.post("/executive-brief", authMiddleware, postExecutiveBrief);
router.post("/optimize", authMiddleware, postOptimizationAdvisor);
router.post("/chaos/advise", authMiddleware, postChaosAdvisor);
router.post("/capacity", authMiddleware, postCapacityPlanner);
router.post("/runbook", authMiddleware, postRunbook);
router.post("/postmortem", authMiddleware, postPostmortem);
router.post("/report/generate", authMiddleware, postAiReport);
router.post("/weekly-review", authMiddleware, postWeeklyReview);

router.get("/chat", authMiddleware, getConversationList);
router.post("/chat", authMiddleware, postCreateConversation);
router.get("/chat/:conversationId", authMiddleware, getConversationById);
router.patch("/chat/:conversationId", authMiddleware, patchConversation);
router.delete("/chat/:conversationId", authMiddleware, deleteConversationById);
router.post(
  "/chat/:conversationId/messages",
  authMiddleware,
  postConversationMessage,
);

router.get("/:projectId/:runId", authMiddleware, getAnalysis);

module.exports = router;
