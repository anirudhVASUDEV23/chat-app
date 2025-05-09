import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { generateToken } from "../lib/generateToken.js";
import cloudinary from "../lib/cloudinary.js";
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    //hash password
    if (!email || !password || !fullName) {
      // Check if email and password are provided
      return res.status(400).json({ message: "Please provide all fields" });
    }

    if (password.length < 6) {
      // Check if password is at least 6 characters long
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Check if user already exists
      return res.status(400).json({ message: "Email already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    if (!user) {
      // Check if user was created successfully
      return res.status(400).json({ message: "User not created" });
    }
    // Create JWT token
    const token = generateToken(user._id, res);
    await user.save();

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found,please try signing up" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // Create JWT token
    const token = generateToken(user._id, res);
    await user.save();

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;
    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );
    await updatedUser.save();
    if (!updatedUser) {
      return res.status(400).json({ message: "User not found" });
    }
    res.status(200).json({ updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller :", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
