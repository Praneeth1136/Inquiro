import { ChatGroq } from '@langchain/groq';
import { HumanMessage, SystemMessage, AIMessage, tool, createAgent } from "langchain";
import { z } from "zod";
import { searchInternet } from './internet.service.js';

const groqVersatileModel = new ChatGroq({
  model: 'llama-3.3-70b-versatile',
  apiKey: process.env.GROQ_API_KEY,
});

const groqVisionModel = new ChatGroq({
  model: 'llama-3.2-11b-vision-preview',
  apiKey: process.env.GROQ_API_KEY,
});

const searchInternetTool = tool(
  searchInternet,
  {
    name: "searchInternet",
    description: "Search the internet for current information",
    schema: z.object({
      query: z.string().describe("Search query for the internet")
    })
  }
);

const versatileAgent = createAgent({
  model: groqVersatileModel,
  tools: [searchInternetTool],
});

const visionAgent = createAgent({
  model: groqVisionModel,
  tools: [searchInternetTool],
});

const BASE_SYSTEM_PROMPT = `You are a helpful assistant. Search the internet for current information using the searchInternet tool when needed. 
      
      If you don't find the answer in the search results, respond with your own knowledge.
      `;

const toLangchainMessages = (messages, customPrompt = "") => {
  const fullSystem = customPrompt ? `${BASE_SYSTEM_PROMPT}\n\nUser's Custom Instructions:\n${customPrompt}` : BASE_SYSTEM_PROMPT;
  return [
    new SystemMessage(fullSystem),
    ...messages.map((msg) => {
      if (msg.role === "user") {
        if (msg.images && msg.images.length > 0) {
          return new HumanMessage({
            content: [
              { type: "text", text: msg.content },
              ...msg.images.map(img => ({ type: "image_url", image_url: { url: img } }))
            ]
          });
        }
        return new HumanMessage(msg.content);
      } else {
        return new AIMessage(msg.content);
      }
    }),
  ];
};

// Pull links + images out of a Tavily tool-result string.
function collectFromToolResult(raw, seen, sources, images) {
  if (typeof raw !== "string") return;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return;
  }
  if (Array.isArray(parsed?.results)) {
    for (const r of parsed.results) {
      if (r?.url && !seen.has(r.url)) {
        seen.add(r.url);
        sources.push({ title: r.title || r.url, url: r.url });
      }
    }
  }
  if (Array.isArray(parsed?.images)) {
    for (const im of parsed.images) {
      const u = typeof im === "string" ? im : im?.url;
      if (u && !images.includes(u)) images.push(u);
    }
  }
}

/**
 * Streams the answer token-by-token via the onToken callback while collecting
 * the web sources/images from the tool calls. Returns the full text + sources.
 */
export const streamResponse = async ({ messages, systemPrompt = "", modelName = "llama-70b", onToken, onStatus }) => {
  const langchainMessages = toLangchainMessages(messages, systemPrompt);

  // If the user attached images in the current prompt, we MUST force the vision model
  const hasImages = messages.some(m => m.role === "user" && m.images && m.images.length > 0);
  
  let agent;
  if (hasImages || modelName === "llama-vision") {
    agent = visionAgent;
  } else {
    agent = versatileAgent;
  }
  
  let text = "";
  const seen = new Set();
  const sources = [];
  const images = [];

  const eventStream = agent.streamEvents(
    { messages: langchainMessages },
    { version: "v2" }
  );

  for await (const ev of eventStream) {
    if (ev.event === "on_tool_start") {
      if (onStatus) onStatus("Searching the web...");
    }
    if (ev.event === "on_chat_model_stream") {
      const content = ev.data?.chunk?.content;
      let piece = "";
      if (typeof content === "string") {
        piece = content;
      } else if (Array.isArray(content)) {
        piece = content.map((p) => (typeof p === "string" ? p : p?.text || "")).join("");
      }
      if (piece) {
        text += piece;
        onToken(piece);
      }
    } else if (ev.event === "on_tool_end") {
      if (onStatus) onStatus("Reading sources...");
      const out = ev.data?.output;
      const raw = typeof out === "string" ? out : out?.content;
      collectFromToolResult(raw, seen, sources, images);
    }
  }

  if (onStatus) onStatus(null); // clear status
  return { text, sources, images };
}

// Kept for non-streaming use if you ever need it.
export async function generateResponse(messages) {
  const response = await versatileAgent.invoke({ messages: toLangchainMessages(messages) });
  const text = response.messages[response.messages.length - 1].content;

  const seen = new Set();
  const sources = [];
  const images = [];
  for (const m of response.messages) {
    if (typeof m?.content === "string") collectFromToolResult(m.content, seen, sources, images);
  }
  return { text, sources, images };
}

export const generateChatTitle = async (message) => {
  const model = new ChatGroq({ model: 'llama-3.3-70b-versatile', apiKey: process.env.GROQ_API_KEY });
  const response = await model.invoke([
    new SystemMessage("You are an expert copywriter. Given the user's first message, generate a 2 to 4 word title for the chat. Do not include quotes or punctuation."),
    new HumanMessage(message)
  ]);
  return response.content;
};