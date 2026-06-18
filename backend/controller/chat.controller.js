import userModel from "../models/user.model.js";
import { streamResponse, generateChatTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { getIO } from "../src/sockets/server.socket.js";

export async function sendMessage(req, res) {
    const userId = req.user.id;
    const { message, chat: bodyChat, chatId, modelName = "gemini", images = [] } = req.body;
    const activeChatId = bodyChat || chatId;

    let chat = null;
    let isNew = false;

    if (!activeChatId) {
        isNew = true;
        chat = await chatModel.create({ user: userId, title: "New Chat" });
    } else {
        chat = await chatModel.findOne({ _id: activeChatId, user: userId });
        if (!chat) {
            return res.status(404).json({ message: "Chat not found", success: false });
        }
    }

    const user = await userModel.findById(userId);
    const systemPrompt = user?.systemPrompt || "";

    const chatIdStr = chat._id.toString();

    await messageModel.create({ chat: chat._id, content: message, role: "user", images });

    const io = getIO();

    // Tell the client to render the user message + an empty streaming bubble.
    io.to(userId).emit("chat:start", {
        chatId: chatIdStr,
        title: chat.title,
        isNew,
        userMessage: message,
        images,
    });

    // Respond to the HTTP request right away
    res.json({ success: true, chatId: chatIdStr });

    // Generate a real title in the background for new chats.
    if (isNew) {
        generateChatTitle(message)
            .then(async (title) => {
                chat.title = title;
                await chat.save();
                io.to(userId).emit("chat:title", { chatId: chatIdStr, title });
            })
            .catch((err) => console.error("title generation failed:", err?.message));
    }

    try {
        const history = await messageModel.find({ chat: chat._id });

        const { text, sources, images: aiImages } = await streamResponse({
            messages: history,
            systemPrompt,
            modelName,
            onToken: (token) => io.to(userId).emit("chat:token", { chatId: chatIdStr, token }),
            onStatus: (status) => io.to(userId).emit("chat:status", { chatId: chatIdStr, status }),
        });

        const aiMessage = await messageModel.create({
            chat: chat._id,
            content: text,
            role: "ai",
            sources: sources || [],
            images: aiImages || [],
        });

        io.to(userId).emit("chat:complete", {
            chatId: chatIdStr,
            message: {
                content: aiMessage.content,
                role: "ai",
                sources: aiMessage.sources,
                images: aiMessage.images,
            },
        });
    } catch (err) {
        console.error("streamResponse error:", err);
        io.to(userId).emit("chat:error", {
            chatId: chatIdStr,
            message: "Failed to generate a response. Please try again.",
        });
    }
}

export async function getChats(req, res) {
    const user = req.user;
    const chats = await chatModel.find({ user: user.id });

    res.status(200).json({
        message: "chats retrieved successfully",
        success: true,
        chats
    });
}

export async function getMessages(req, res) {
    const { chatId } = req.params;

    const chat = await chatModel.findOne({ _id: chatId, user: req.user.id });
    if (!chat) {
        return res.status(404).json({ message: "chat not found", success: false });
    }

    const messages = await messageModel.find({ chat: chat._id });

    res.status(200).json({
        message: "messages retrieved successfully",
        success: true,
        messages
    });
}

export async function deleteChat(req, res) {
    const { chatId } = req.params;

    const chat = await chatModel.findOne({ _id: chatId, user: req.user.id });
    if (!chat) {
        return res.status(404).json({ message: "Chat not found", success: false });
    }

    await messageModel.deleteMany({ chat: chatId });
    await chatModel.deleteOne({ _id: chatId });

    res.status(200).json({
        message: "chat deleted successfully",
        success: true
    });
}

export async function deleteAllChats(req, res) {
    const userId = req.user.id;
    const chats = await chatModel.find({ user: userId });
    const chatIds = chats.map(c => c._id);

    await messageModel.deleteMany({ chat: { $in: chatIds } });
    await chatModel.deleteMany({ user: userId });

    res.status(200).json({
        message: "All chats deleted successfully",
        success: true
    });
}

export async function renameChat(req, res) {
    const { chatId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({
            message: "Title is required",
            success: false,
        });
    }

    const chat = await chatModel.findOne({
        _id: chatId,
        user: req.user.id,
    });

    if (!chat) {
        return res.status(404).json({
            message: "chat not found",
            success: false,
        });
    }

    chat.title = title.trim();
    await chat.save();

    res.json({
        message: "chat renamed successfully",
        success: true,
        chat,
    });
}