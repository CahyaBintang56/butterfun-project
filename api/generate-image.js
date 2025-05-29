import { GoogleGenAI, Modality } from "@google/genai";

export default async function handler(req, res) {
  // Set CORS headers (sama seperti cors() middleware)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST method (sesuai dengan kode lokal)
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Debug: Log environment variable (tanpa expose full key)
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("API Key exists:", !!apiKey);
    console.log(
      "API Key prefix:",
      apiKey ? apiKey.substring(0, 10) + "..." : "undefined"
    );

    // Initialize AI dengan error handling
    let ai;
    try {
      ai = new GoogleGenAI({ apiKey: apiKey });
      console.log("GoogleGenAI initialized successfully");
    } catch (initError) {
      console.error("Failed to initialize GoogleGenAI:", initError);
      return res
        .status(500)
        .json({
          error: "AI initialization failed",
          details: initError.message,
        });
    }

    const prompt = req.body.prompt;
    console.log("Received prompt:", prompt);

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Debug: Log sebelum API call
    console.log(
      "Calling Gemini API with model: gemini-2.0-flash-preview-image-generation"
    );

    // Panggil Gemini AI dengan konfigurasi yang sama seperti lokal
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    // Debug: Log response structure
    console.log("Response received:", !!response);
    console.log("Response candidates:", response?.candidates?.length || 0);

    if (response?.candidates?.[0]?.content?.parts) {
      console.log("Parts count:", response.candidates[0].content.parts.length);
      response.candidates[0].content.parts.forEach((part, index) => {
        console.log(`Part ${index}:`, Object.keys(part));
      });
    }

    // Check response seperti di kode lokal
    if (!response.candidates || response.candidates.length === 0) {
      console.log("No candidates in response");
      return res.status(400).json({ error: "No response from AI" });
    }

    // Loop untuk mencari image data (sama seperti kode lokal)
    for (const part of response.candidates[0].content.parts) {
      console.log("Checking part:", Object.keys(part));
      if (part.inlineData) {
        console.log("Found inline data, mime type:", part.inlineData.mimeType);
        console.log("Data length:", part.inlineData.data?.length || 0);

        // Return format yang sama seperti kode lokal
        return res.json({
          image: part.inlineData.data,
          mimeType: part.inlineData.mimeType || "image/png",
          success: true,
        });
      }
    }

    // Jika sampai sini, tidak ada image yang ditemukan
    console.log("No image data found in response parts");

    // Debug: Return full response structure for debugging
    return res.status(400).json({
      error: "No image generated",
      debug: {
        candidatesCount: response.candidates?.length || 0,
        partsCount: response.candidates?.[0]?.content?.parts?.length || 0,
        partTypes:
          response.candidates?.[0]?.content?.parts?.map((p) =>
            Object.keys(p)
          ) || [],
      },
    });
  } catch (error) {
    console.error("Full error object:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Return lebih detail error untuk debugging
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
