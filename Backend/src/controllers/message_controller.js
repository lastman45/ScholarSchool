import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/User.js";


export const getAllContacts = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: { $ne: loggedInUserId}}).select("-password")//select every user bar you and not their password

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getAllContancts:", error);
        res.status(500).json({ message: "Server Error"});
    }
}

export const getMessageByUserId = async (req, res) => {
    try{
        const myId = req.user._id;
        const {id:userToChatId} = req.params

        const messages = await Message.find({
            $or: [
                {senderId:myId, receiverId: userToChatId},
                {senderId:userToChatId, receiverId: myId},
            ]
        });
        res.status(200).json(messages)
    } catch (error) {
        console.log("Error in getMessages Controller:", error.message);
        res.status(500).json({ error: "Internal Server Error"})
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body; //TODO: add for files also
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        if (!text && !image) {
            return res.status(400).json({ message: "Text or Image is required."});
        }
        if (senderId.equals(receiverId)) {
            return res.status(400).json({ message: "Cannot Send Message to Yourself"}); //TODO: remove this
        }
        const receiverExists = await User.exists({_id: receiverId});
        if (!receiverExists) {
            return res.status(404).json({ message: "Receiver Not Found"});
        }

        let imageUrl;
        if(image) {
            //Upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        //TODO: Send message in real-time if User is online - Socket.io

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage Controller: ", error.message);
        res.status(500).json({ error: "Internal Server Error"});
    }
};

export const getChatPartners = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        //Find all the Messages where the Logged-in user is either a Sender or a Receiver
        const messages = await Message.find({
            $or: [{ senderid: loggedInUserId }, { receiverId: loggedInUserId }],
        });

        const chatPartnerIds = [
            ...new Set(messages.map((msg)=>
            msg.senderId.toString() === loggedInUserId.toString()
             ? msg.receiverId.toString() 
             : msg.senderId.toString())
    ),
                            ];
        const chatPartners = await User.find({_id: {$in:chatPartnerIds}}).select("-password")

        res.status(200).json(chatPartners);
        
    } catch (error) {
        console.error("Error in getChatPartners:", error.message);
        res.status(500).json({ error: "Internal Server Error"});
    }
};