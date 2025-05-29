import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenAI, Modality } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post("/generate-image", async (req, res) => {
  try {
    const prompt = req.body.prompt;

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
});

// Vercel Serverless Handler
export default app;
