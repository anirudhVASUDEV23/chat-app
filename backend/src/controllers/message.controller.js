import User from "../models/user.model.js";
import Messages from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiversSocketId } from "../lib/socket.js";
import { io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error fetching users for sidebar:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Messages.find({
      $or: [
        {
          senderId: myId,
          receiverId: userToChatId,
        },
        {
          senderId: userToChatId,
          receiverId: myId,
        },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const { text, image } = req.body;

    let imageUrl;
    if (image) {
      //Upload base64 image to cloudinary and get the URL
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Messages.create({
      senderId: senderId,
      receiverId: receiverId,
      text: text || "",
      image: imageUrl || "",
    });
    if (!newMessage) {
      return res.status(500).json({ message: "Unable to send message" });
    }
    const savedMessage = await newMessage.save();

    //todo:Real Time functionality=>socket.io
    const receiverSocketId = getReceiversSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", savedMessage);
    }

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
