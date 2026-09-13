import express from "express";
import { getAllContacts, getMessageByUserId, getChatPartners, sendMessage } from "../controllers/message_controller.js";
import { protectRoute } from "../middleware/auth_middleware.js";
import { arcjetProtection } from "../middleware/arcjet_middleware.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessageByUserId);
//TODO: add route for connecting with others randoms online
//TODO: add group forums route
router.get("/send/:id", sendMessage ); 

export default router;