const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    console.log("❌ Missing authorization header");
    return res.status(401).json({ message: "Unauthorized - Missing token" });
  }

  const token = authorization.split(" ")[1];
  try {
    const { _id } = jwt.verify(token, process.env.SECRET);
    req.user = await User.findOne({ _id }).select("_id");
    console.log("✅ Auth success for user:", req.user._id);
    next();
  } catch (error) {
    console.log("❌ Auth error:", error.message);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

module.exports = requireAuth;