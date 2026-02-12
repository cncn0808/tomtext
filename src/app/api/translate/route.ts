
import { generateContent } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json(
                { error: "Missing 'text' in request body." },
                { status: 400 }
            );
        }

        const prompt = `Translate the following text to Vietnamese:\n\n${text}\n\nReturn ONLY the translated text.`;

        const translation = await generateContent({
            prompt,
        });

        return NextResponse.json({ translation });
    } catch (error) {
        console.error("Error during translation:", error);
        return NextResponse.json(
            {
                error:
                    "Translation error: " +
                    (error instanceof Error ? error.message : "Unknown"),
            },
            { status: 500 }
        );
    }
}
