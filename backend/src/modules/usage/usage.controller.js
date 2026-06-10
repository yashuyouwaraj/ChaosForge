const { getUsage } = require("./usage.service");

const getMyUsage = async (req, res) => {
  try {
    const usage = await getUsage(req.user.id);

    res.json(usage);
  } catch (err) {
    console.error("Failed to fetch usage:", err);
    res.status(500).json({ message: "Failed to fetch usage" });
  }
};

module.exports = {
  getMyUsage,
};
