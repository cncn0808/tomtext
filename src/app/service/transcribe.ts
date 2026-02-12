
import axios from "axios";

interface TranscribeResponse {
    transcription: string | null;
    error: string | null;
}

export const transcribeVideo = async (
    youtubeUrl: string
): Promise<TranscribeResponse> => {
    try {
        const response = await axios.post("/api/transcribe", { youtubeUrl });

        // Check if the response data has the transcription
        const { transcription } = response.data;
        if (!transcription) {
            return {
                transcription: null,
                error: "Received an empty transcription from the server."
            };
        }

        return {
            transcription,
            error: null,
        };
    } catch (err: any) {
        console.error("Transcription API error:", err);

        // Extract error message from axios response or error object
        const errorMessage =
            err.response?.data?.error ||
            (err instanceof Error ? err.message : "An unknown error occurred.");

        return {
            transcription: null,
            error: errorMessage,
        };
    }
};
