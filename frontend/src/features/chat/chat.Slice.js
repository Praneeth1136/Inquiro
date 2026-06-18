import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chats: {},
        currentChatId: null,
        isLoading: false,      // assistant is currently responding
        isOpeningChat: false,  // fetching messages for an existing chat
        error: null,
        chatStatus: null       // string indicating what the AI is doing (e.g. "Searching the web...")
    },
    reducers: {
        CreateNewChat: (state, action) => {
            const { chatId, title } = action.payload;
            state.chats[chatId] = {
                id: chatId,
                title,
                messages: [],
                lastUpdated: new Date().toISOString()
            };
        },
        addNewMessage: (state, action) => {
            const { chatId, content, role, sources, images } = action.payload;
            if (!state.chats[chatId]) return;
            state.chats[chatId].messages.push({
                content,
                role,
                sources: sources || [],
                images: images || [],
            });
        },
        addMessages: (state, action) => {
            const { chatId, messages } = action.payload;
            if (!state.chats[chatId]) return;
            state.chats[chatId].messages = messages;
        },

        // ── streaming ──
        startStreaming: (state, action) => {
            const { chatId } = action.payload;
            if (!state.chats[chatId]) return;
            state.chats[chatId].messages.push({
                content: '',
                role: 'ai',
                sources: [],
                images: [],
                streaming: true,
            });
        },
        appendToken: (state, action) => {
            const { chatId, token } = action.payload;
            const msgs = state.chats[chatId]?.messages;
            if (!msgs?.length) return;
            const last = msgs[msgs.length - 1];
            if (last.role === 'ai' && last.streaming) last.content += token;
        },
        finishStreaming: (state, action) => {
            const { chatId, content, sources, images } = action.payload;
            const msgs = state.chats[chatId]?.messages;
            if (!msgs?.length) return;
            const last = msgs[msgs.length - 1];
            if (last.role === 'ai' && last.streaming) {
                if (content != null && content !== '') last.content = content;
                last.sources = sources || [];
                last.images = images || [];
                last.streaming = false;
            }
        },
        updateChatTitle: (state, action) => {
            const { chatId, title } = action.payload;
            if (state.chats[chatId]) state.chats[chatId].title = title;
        },
        setChatStatus: (state, action) => {
            state.chatStatus = action.payload;
        },

        setChats: (state, action) => {
            state.chats = action.payload;
        },
        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload;
        },
        removeChat: (state, action) => {
            const chatId = action.payload;
            delete state.chats[chatId];
            if (state.currentChatId === chatId) state.currentChatId = null;
        },
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setOpeningChat: (state, action) => {
            state.isOpeningChat = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const {
    CreateNewChat,
    addNewMessage,
    addMessages,
    startStreaming,
    appendToken,
    finishStreaming,
    updateChatTitle,
    setChatStatus,
    setChats,
    setCurrentChatId,
    removeChat,
    setIsLoading,
    setOpeningChat,
    setError,
} = chatSlice.actions;

export default chatSlice.reducer;