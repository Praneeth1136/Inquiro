import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage, AIMessage, tool, createAgent } from "langchain";
import { z } from "zod";
import { searchInternet } from './internet.service.js';

const geminiModel = new ChatGoogleGenerativeAI({
  model: 'gemini-3.1-flash-lite',
  apiKey: process.env.GEMINI_API_KEY,
});

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
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

const geminiAgent = createAgent({
  model: geminiModel,
  tools: [searchInternetTool],
});

const mistralAgent = createAgent({
  model: mistralModel,
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
export async function streamResponse({ messages, onToken, systemPrompt = "", modelName = "gemini", onStatus }) {
  let text = "";
  const seen = new Set();
  const sources = [];
  const images = [];

  const agent = modelName === "mistral" ? mistralAgent : geminiAgent;

  const eventStream = agent.streamEvents(
    { messages: toLangchainMessages(messages, systemPrompt) },
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
  const response = await agent.invoke({ messages: toLangchainMessages(messages) });
  const text = response.messages[response.messages.length - 1].text;

  const seen = new Set();
  const sources = [];
  const images = [];
  for (const m of response.messages) {
    if (typeof m?.content === "string") collectFromToolResult(m.content, seen, sources, images);
  }
  return { text, sources, images };
}

export async function generateChatTitle(message) {
  const response = await mistralModel.invoke([
    new SystemMessage(`You are an AI assistant specialized in creating concise, meaningful titles for user conversations.

### Your Task
Analyze the user's first message and generate a title that accurately reflects the main topic, question, or intent.

### Title Generation Guidelines

1. **Length**: Keep the title short — 2 to 7 words maximum.
2. **Clarity**: The title should be clear and easy to understand at a glance.
3. **Relevance**: It must accurately represent the core subject of the conversation.
4. **Style**:
   - Use natural, conversational language.
   - Do NOT use ALL CAPS, excessive punctuation, or emojis.
   - Avoid generic phrases like "Chat," "Conversation," or "Query."
   - Do NOT add quotation marks or special formatting.
5. **Focus**: If the user asks a question, the title should reflect the question. If they state a topic, the title should reflect the topic.

### Output Format
Return ONLY the title text. Do not include any additional explanation, labels, or metadata.
        `),
    new HumanMessage(message)
  ]);
  return response.text;
}