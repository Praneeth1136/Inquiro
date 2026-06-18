import { connectSocket } from "../services/chat.socket";
import { sendMessage, getChats, getMessages, deleteChat, renameChat } from "../services/chat.api.js";
import {
    setChats, setCurrentChatId, removeChat, setIsLoading, setOpeningChat, setError,
    addNewMessage, CreateNewChat, addMessages,
    startStreaming, appendToken, finishStreaming, updateChatTitle, setChatStatus
} from "../chat.Slice";
import { useDispatch } from "react-redux";

export const useChat = () => {

    const dispatch = useDispatch();

    function initializeSocketConnection() {
        const socket = connectSocket();

        // rebind cleanly (avoids duplicate handlers under React StrictMode)
        const bind = (event, handler) => {
            socket.off(event);
            socket.on(event, handler);
        };

        bind("connect", () => console.log("Socket connected:", socket.id));

        bind("chat:start", ({ chatId, title, isNew, userMessage, images }) => {
            if (isNew) dispatch(CreateNewChat({ chatId, title }));
            dispatch(setCurrentChatId(chatId));
            dispatch(addNewMessage({ chatId, content: userMessage, role: "user", images }));
            dispatch(startStreaming({ chatId }));
        });

        bind("chat:token", ({ chatId, token }) => {
            dispatch(appendToken({ chatId, token }));
        });

        bind("chat:title", ({ chatId, title }) => {
            dispatch(updateChatTitle({ chatId, title }));
        });

        bind("chat:status", ({ status }) => {
            dispatch(setChatStatus(status));
        });

        bind("chat:complete", ({ chatId, message }) => {
            dispatch(finishStreaming({
                chatId,
                content: message?.content,
                sources: message?.sources,
                images: message?.images,
            }));
            dispatch(setChatStatus(null));
            dispatch(setIsLoading(false));
        });

        bind("chat:error", ({ chatId, message }) => {
            dispatch(finishStreaming({ chatId, sources: [], images: [] }));
            dispatch(setError(message || "Something went wrong"));
            dispatch(setIsLoading(false));
        });
    }

    async function handleSendMessage({ message, chatId, modelName, images = [] }) {
        dispatch(setIsLoading(true));
        dispatch(setChatStatus("Sending..."));
        try {
            await sendMessage({ message, chatId, modelName, images });
        } catch (err) {
            dispatch(setError(err?.response?.data?.message || "Failed to send message"));
            dispatch(setIsLoading(false));
            dispatch(setChatStatus(null));
        }
    }

    async function handleGetChats() {
        try {
            const data = await getChats();
            const { chats } = data;
            dispatch(setChats(chats.reduce((acc, chat) => {
                acc[chat._id] = {
                    id: chat._id,
                    title: chat.title,
                    messages: [],
                    lastUpdated: chat.lastUpdated
                };
                return acc;
            }, {})));
        } catch (err) {
            dispatch(setError(err?.response?.data?.message || "Failed to fetch chats"));
        }
    }

    async function handleOpenChat(chatId) {
        dispatch(setOpeningChat(true));
        try {
            const data = await getMessages(chatId);
            const { messages } = data;

            const formattedMessages = messages.map(msg => ({
                content: msg.content,
                role: msg.role,
                sources: msg.sources || [],
                images: msg.images || [],
            }));

            dispatch(addMessages({ chatId, messages: formattedMessages }));
            dispatch(setCurrentChatId(chatId));
        } catch (err) {
            dispatch(setError(err?.response?.data?.message || "Failed to fetch messages"));
        } finally {
            dispatch(setOpeningChat(false));
        }
    }

    async function handleDeleteChat(chatId) {
        try {
            await deleteChat(chatId);
            dispatch(removeChat(chatId));
        } catch (err) {
            dispatch(setError(err?.response?.data?.message || "Failed to delete chat"));
        }
    }

    async function handleRenameChat(chatId, title) {
        try {
            await renameChat(chatId, title);
            dispatch(updateChatTitle({ chatId, title }));
        } catch (err) {
            dispatch(setError(err?.response?.data?.message || "Failed to rename chat"));
        }
    }

    async function handleDeleteAllChats() {
        try {
            await import("../services/chat.api.js").then(m => m.deleteAllChats());
            // Need a way to clear all chats in Redux... We can just setChats({})
            dispatch(setChats({}));
            dispatch(setCurrentChatId(null));
        } catch (err) {
            dispatch(setError(err?.response?.data?.message || "Failed to delete all chats"));
        }
    }

    return {
        initializeSocketConnection,
        handleSendMessage,
        handleGetChats,
        handleOpenChat,
        handleDeleteChat,
        handleRenameChat,
        handleDeleteAllChats
    };
};