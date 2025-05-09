import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  // console.log("Auth middleware called"); // Log to check if middleware is called
  try {
    // console.log(req.cookies); // Log the cookies to check if the token is present
    const token = req.cookies.jwt;
    // console.log("Token from cookies", token); // Log the token to check if it's correct
    if (!token) {
      return res.status(401).json({ message: "Unauthorized No token" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized Invalid token" });
    }
    const user = await User.findById(decoded.userId).select("-password"); //
    //we used userId in the token to find the user in the database and select all fields except password
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;

    // console.log("User found in middleware", user); // Log the user object to check if it's correct
    next();
  } catch (error) {
    console.log("Error in auth middleware", error);
    res.status(401).json({ message: "Unauthorized " });
  }
};
