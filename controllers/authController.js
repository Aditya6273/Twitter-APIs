const User = require("../models/auth.model");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const bcrypt = require("bcrypt");
const signupController = async (req, res) => {
  try {
    const { email, fullname, password, contact, username } = req.body;

    // Check if all required fields are provided
    if (!email || !fullname || !password || !contact || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email
    const validate_email = validator.isEmail(email);
    if (!validate_email) {
      return res.status(400).json({ message: "Invalid Email" });
    }

    // Check if a user with the provided email or username already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email or username already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const userCreated = await User.create({
      email,
      fullname,
      password: hashedPassword,
      contact,
      username,
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        username: userCreated.username,
        email: userCreated.email,
        id: userCreated._id,
      },
      process.env.SECRET_KEY,
      { expiresIn: "15d" }
    );
    res.cookie("token", token,{ httpOnly: true, sameSite: "strict",maxAge:15*24*60*60*1000 });
    // Respond with the created user and token
    res.status(201).json({ user: userCreated, token });
  } catch (error) {
    console.error("Error in signupController:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if all required fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email or password incorrect" });
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username: user.username, email: user.email, id: user._id },
      process.env.SECRET_KEY, // Use your actual JWT secret here
      { expiresIn: "15d" }
    );

    // Set the token in a cookie and respond with user data
    res.cookie("token", token, { httpOnly: true, sameSite: "strict",maxAge:15*24*60*60*1000 }); // Use secure:true in production
    res.status(200).json({ user, token });
    console.log(req.cookies.token);
  } catch (error) {
    console.error("Error in loginController:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const logoutController = (req, res) => {
  try {
    res.clearCookie("token", { httpOnly: true, secure: true }); // Ensure secure:true in production
    res.status(200).json({ message: "Successfully logged out" });
  } catch (error) {
    console.error("Error in logoutController:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findOne(req.user._id);
    res.status(200).send(user);
  } catch (error) {
    console.error("Error in getMeController:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports = { signupController, loginController, logoutController, getMe };
