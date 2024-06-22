const jwt = require("jsonwebtoken");
const User = require("../models/auth.model"); // Adjust the path to your User model

const protectedRoute = async (req, res, next) => {
  try {
    // Check for token in cookies
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided, authorization denied" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Find the user by the id in the token
    const user = await User.findById(decoded.id); // Assuming the token contains the user id as `id`
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found, authorization denied" });
    }

    // Attach user to request object
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error in protectedRoute middleware:", error);
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ message: "Invalid token, authorization denied" });
    }
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports = { protectedRoute };
