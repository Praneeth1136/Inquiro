import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['user', 'ai'],
            required: true,
        },
        // Web sources returned by the Tavily search tool (only on AI messages)
        sources: [
            {
                title: { type: String },
                url: { type: String },
            },
        ],
        // Image URLs returned by Tavily (only on AI messages)
        images: [{ type: String }],
    },
    { timestamps: true }
);

const messageModel = mongoose.model('Message', messageSchema);

export default messageModel;