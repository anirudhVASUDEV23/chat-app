import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("jwt", token, {
    httpOnly: true, //prevents XSS attacks by not allowing JavaScript to access the cookie
    secure: process.env.NODE_ENV !== "development", // only set the cookie to secure if in production
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return token;
};
