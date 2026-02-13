
import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Missing GEMINI_API_KEY in environment variables.");
    }
    return new GoogleGenAI({ apiKey });
};

interface GenerateOptions {
    prompt: string;
    audio?: {
        data: string;
        mimeType: string;
    };
}

export async function generateContent(options: GenerateOptions): Promise<string> {
    const ai = getAiClient();
    const { prompt, audio } = options;

    const parts: any[] = [{ text: prompt }];
    if (audio) {
        parts.push({ inlineData: { data: audio.data, mimeType: audio.mimeType } });
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts }],
        });

        const text = response.text;
        if (!text) {
            throw new Error("Empty response from Gemini API");
        }

        return text;
    } catch (error: any) {
        console.error("Gemini API error:", error);
        throw new Error(
            "Gemini API error: " + (error instanceof Error ? error.message : String(error))
        );
    }
}
