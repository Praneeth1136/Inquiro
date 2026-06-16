import { tavily } from "@tavily/core";

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

export const searchInternet = async ({ query }) => {
  try {
    const response = await tvly.search(query, {
      max_results: 5,
      include_images: true,
      // searchDepth: "advanced"
    });
    return JSON.stringify(response);
  } catch (error) {
    console.error("Error searching internet:", error);
    throw error;
  }
};