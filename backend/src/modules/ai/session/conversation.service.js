const AIConversation = require("./conversation.model");
const {
  getConversationCache,
  setConversationCache,
  invalidateConversationCache,
} = require("../cache/ai.cache");

const createConversation = async ({
  owner,
  projectId,
  runId,
  skill = "askChaosForge",
  title = "ChaosForge Conversation",
}) => {
  const conversation = await AIConversation.create({
    owner,
    projectId,
    runId: runId || "general",
    skill,
    title,
    messages: [],
  });

  await setConversationCache(String(conversation._id), conversation.toObject());
  return conversation;
};

const getConversation = async ({ owner, conversationId }) => {
  const cached = await getConversationCache(conversationId);

  if (cached && String(cached.owner) === String(owner)) {
    return cached;
  }

  const conversation = await AIConversation.findOne({
    _id: conversationId,
    owner,
  });

  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  await setConversationCache(conversationId, conversation.toObject());
  return conversation;
};

const appendMessage = async ({
  owner,
  conversationId,
  role,
  content,
  metadata = {},
}) => {
  const conversation = await AIConversation.findOne({
    _id: conversationId,
    owner,
  });

  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  conversation.messages.push({
    role,
    content,
    metadata,
    createdAt: new Date(),
  });

  await conversation.save();
  await setConversationCache(conversationId, conversation.toObject());
  return conversation;
};

const listConversations = async ({
  owner,
  projectId,
  search,
  includeEmpty = false,
  limit = 30,
}) => {
  const query = { owner };

  if (projectId) {
    query.projectId = projectId;
  }

  if (!includeEmpty) {
    query["messages.0"] = { $exists: true };
  }

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  return AIConversation.find(query)
    .sort({ pinned: -1, updatedAt: -1 })
    .limit(limit)
    .lean();
};

const updateConversation = async ({ owner, conversationId, updates = {} }) => {
  const allowed = {};

  if (updates.title != null) {
    allowed.title = updates.title;
  }

  if (updates.pinned != null) {
    allowed.pinned = Boolean(updates.pinned);
  }

  const conversation = await AIConversation.findOneAndUpdate(
    { _id: conversationId, owner },
    { $set: allowed },
    { new: true },
  );

  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  await invalidateConversationCache(conversationId);
  return conversation;
};

const deleteConversation = async ({ owner, conversationId }) => {
  const result = await AIConversation.deleteOne({
    _id: conversationId,
    owner,
  });

  if (result.deletedCount === 0) {
    throw new Error("Conversation not found.");
  }

  await invalidateConversationCache(conversationId);
  return { deleted: true };
};

module.exports = {
  createConversation,
  getConversation,
  appendMessage,
  listConversations,
  updateConversation,
  deleteConversation,
};
