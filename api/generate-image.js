import { GoogleGenAI, Modality } from "@google/genai";

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const prompt = req.body.prompt;
    console.log("Received prompt:", prompt);

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Check if API key exists
    // HANYA UNTUK TESTING - JANGAN DI PRODUCTION
    const apiKey =
      process.env.GEMINI_API_KEY || "AIzaSyB3I8lg3vW3Cha-PYkf1eHkjhPXbuz1dqY";
    console.log(
      "All env vars:",
      Object.keys(process.env).filter((key) => key.includes("GEMINI"))
    );
    console.log("API Key exists:", !!apiKey);
    console.log("API Key length:", apiKey ? apiKey.length : 0);
    console.log(
      "API Key first 10 chars:",
      apiKey ? apiKey.substring(0, 10) + "..." : "undefined"
    );

    if (!apiKey) {
      return res.status(500).json({
        error: "API key not configured",
        message: "GEMINI_API_KEY environment variable is not set",
        debug: {
          availableEnvVars: Object.keys(process.env).filter((key) =>
            key.includes("GEMINI")
          ),
        },
      });
    }

    // Initialize Gemini AI inside the handler (fresh instance)
    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    console.log("Calling Gemini API...");

    // Use the same format as the working local version
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: prompt, // Pass prompt directly like in local version
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    console.log("Response received from Gemini");

    // Check if response has candidates
    if (!response.candidates || response.candidates.length === 0) {
      console.log("No candidates in response");
      return res.status(400).json({ error: "No response from AI" });
    }

    const candidate = response.candidates[0];

    if (!candidate.content || !candidate.content.parts) {
      console.log("No content parts in response");
      return res.status(400).json({ error: "Invalid response structure" });
    }

    console.log("Processing response parts:", candidate.content.parts.length);

    // Use the same loop structure as local version
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        console.log("Found image data, size:", part.inlineData.data.length);

        // Return response with the same format as local version
        return res.status(200).json({
          image: part.inlineData.data,
        });
      }
    }

    // If no image data found
    console.log("No image data found in response parts");
    return res.status(400).json({ error: "No image generated" });
  } catch (error) {
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    // Handle specific Gemini API errors
    if (error.message?.includes("API key")) {
      return res.status(401).json({
        error: "Invalid API key",
        message: "Please check your Gemini API key configuration",
      });
    }

    if (error.message?.includes("quota") || error.message?.includes("limit")) {
      return res.status(429).json({
        error: "API quota exceeded",
        message: "Gemini API quota or rate limit exceeded",
      });
    }

    if (error.message?.includes("timeout")) {
      return res.status(408).json({
        error: "Request timeout",
        message: "API request timed out",
      });
    }

    // Generic error
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
}
