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
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const prompt = req.body.prompt;
    console.log("Received prompt:", prompt);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return res.json({ image: part.inlineData.data });
      }
    }

    res.status(400).json({ error: "No image generated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }

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
