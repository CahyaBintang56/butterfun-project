import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { GoogleGenAI, Modality } from "@google/genai";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());
app.use(express.json());

// Serve folder root (agar src/generate-image.html bisa diakses)
app.use(express.static(path.join(__dirname, "../../src")));

// Serve public folder (gambar)
app.use("/public", express.static(path.join(__dirname, "../../public")));

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post("/generate-image", async (req, res) => {
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
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Vercel Serverless Handler
export default app;