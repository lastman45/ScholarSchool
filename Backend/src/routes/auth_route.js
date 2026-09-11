import express from "express";
import { signup, login, logout, updateProfile } from "../controllers/auth_controller.js";
import { protectRoute } from "../middleware/auth_middleware.js";

const router = express.Router();

//Endpoints
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update_profile", protectRoute, updateProfile);// protectRoute makes sure only authenticated users can only call updateProfile

router.get("/check", protectRoute, (req,res) => res.status(200).json(req.user))

export default router;