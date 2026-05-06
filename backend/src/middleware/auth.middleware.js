const jwt = require("jsonwebtoken");
const User = require("../modules/user/user.model");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id && decoded.email) {
      const user = await User.findOne({ email: decoded.email }).select("_id");
      if (!user) {
        return res.status(401).json({ message: "Invalid token" });
      }
      decoded.id = user._id.toString();
    }

    req.user = decoded; //inject user

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
