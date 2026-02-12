
import axios from "axios";

interface TranslateResponse {
    translation: string | null;
    error: string | null;
}

export const translateText = async (
    text: string
): Promise<TranslateResponse> => {
    try {
        const response = await axios.post("/api/translate", { text });

        const { translation } = response.data;
        if (!translation) {
            return {
                translation: null,
                error: "Received an empty translation from the server."
            };
        }

        return {
            translation,
            error: null,
        };
    } catch (err: any) {
        console.error("Translation API error:", err);

        const errorMessage =
            err.response?.data?.error ||
            (err instanceof Error ? err.message : "An unknown error occurred.");

        return {
            translation: null,
            error: errorMessage,
        };
    }
};
