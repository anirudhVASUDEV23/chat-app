import express from "express";
const router = express.Router();
import {
  signup,
  login,
  logout,
  updateProfile,
  checkAuth,
} from "../controllers/auth.controller.js";

import { protectRoute } from "../middlewares/auth.middleware.js";

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.put("/update/profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth); // check auth middleware
// check if user is authenticated and return user data
//well call this whenever we need to check if user is authenticated like in the home page or profile page or after refreshing the page

export default router;
