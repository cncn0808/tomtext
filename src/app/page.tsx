"use client";

import {
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Bars3Icon, BoltIcon, PlayCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Spinner from "./components/Spinner";



import { transcribeVideo } from "./service/transcribe";
import { translateText } from "./service/translate";

const HISTORY_KEY = "avt_history";

export default function Page() {
  // Center panel state
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [englishTranscription, setEnglishTranscription] = useState<string>("");
  const [vietnameseTranslation, setVietnameseTranslation] =
    useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasProcessed, setHasProcessed] = useState<boolean>(false);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [history, setHistory] = useState<HistoryTransactionType[]>([]);

  // ---- History helpers ----
  const loadHistory = () => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as HistoryTransactionType[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const prettyDate = (t: number) =>
    new Date(t).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  useEffect(() => {
    // Load sidebar history on mount
    const items = loadHistory();
    setHistory(items);
  }, []);

  // ---- Main action ----
  const handleProcessVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl) {
      setError("Please paste a YouTube URL to begin.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasProcessed(true);
    setEnglishTranscription("");
    setVietnameseTranslation("");

    try {
      // 1. Transcribe
      const { transcription, error: apiError } = await transcribeVideo(youtubeUrl);

      if (apiError || !transcription) {
        throw new Error(apiError || "Failed to get transcription");
      }

      setEnglishTranscription(transcription);

      // 2. Translate
      const { translation, error: translateError } = await translateText(transcription);

      if (translateError) {
        // We don't throw here to avoid wiping out the successful transcription
        console.error("Translation error:", translateError);
        setError(translateError);
      } else if (translation) {
        setVietnameseTranslation(translation);
      }

    } catch (err: any) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Click an item in history → load into center panel
  const handleOpenHistory = (item: HistoryTransactionType) => {
    setYoutubeUrl(item.url);
    setEnglishTranscription(item.fullEnglish || "");
    setVietnameseTranslation(item.fullVietnamese || "");
    setHasProcessed(true);
  };

  // Layout tweaks
  const sidebarWidth = sidebarOpen ? "w-72" : "w-14";
  ``;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      {/* Sidebar */}
      <aside
        className={`border-r border-slate-800 bg-slate-950/60 ${sidebarWidth} transition-all duration-200 ease-in-out flex flex-col`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-3">
          <button
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="p-2 rounded-lg hover:bg-slate-800/70 transition"
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? "Collapse" : "Expand"}
          >
            {/* hamburger icon */}

            <Bars3Icon className="w-5 h-5 text-slate-300" />
          </button>

          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">History</span>
              {history.length > 0 && (
                <button
                  className="text-xs px-2 py-1 rounded border border-slate-700 hover:bg-slate-800 text-slate-300"
                  onClick={() => { }}
                  title="Clear history"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* History list */}
        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            sidebarOpen ? (
              <div className="px-3 py-4 text-sm text-slate-500">
                Past transcriptions will appear here.
              </div>
            ) : null
          ) : (
            <ul className="px-2 pb-3 space-y-1">
              {history.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleOpenHistory(item)}
                    className={`w-full text-left rounded-lg px-3 py-2 hover:bg-slate-800/70 transition group ${sidebarOpen ? "" : "flex items-center justify-center"
                      }`}
                    title={sidebarOpen ? "" : item.title}
                  >
                    {sidebarOpen ? (
                      <>
                        <div className="text-sm font-medium text-slate-200 truncate">
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          {prettyDate(item.createdAt)}
                        </div>
                        <div className="mt-1 text-xs text-slate-400 line-clamp-2">
                          {item.englishPreview || item.vietnamesePreview || ""}
                        </div>
                      </>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Main content + top bar */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-14 border-b border-slate-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="size-6 text-blue-500" />
            <span className="font-semibold text-slate-200">
              Tomtext
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 ">
            <div>
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition text-sm"
              >
                Log in
              </Link>
            </div>

            <div>
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition text-sm"
              >
                Sign up for free
              </Link>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 py-6">
            {/* Prompt area (center panel) */}
            <div className="mb-4 text-slate-400 text-sm">
              Paste a YouTube link, get a transcription & translation.
            </div>

            <form onSubmit={handleProcessVideo} className="mb-6">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-grow w-full">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    <PlayCircleIcon className="w-5 h-5" />
                  </span>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pr-4 pl-12 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all placeholder:text-slate-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg px-6 py-3 font-semibold transition-all"
                >
                  {isLoading ? (
                    <>
                      <Spinner />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <BoltIcon className="w-5 h-5" />
                      <span>Transcribe</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="bg-red-900/40 border border-red-700 text-red-300 p-4 rounded-lg my-6 text-center flex items-center justify-center gap-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Results grid (like ChatGPT response area) */}
            {hasProcessed && (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* English */}
                <div className="bg-slate-800/70 rounded-xl p-5 shadow">
                  <h2 className="text-base font-semibold text-slate-300 mb-3">
                    Original Transcription (English)
                  </h2>
                  <div className="min-h-[16rem] pr-2 text-slate-300 leading-relaxed space-y-4">
                    {isLoading ? (
                      <div className="text-slate-400">
                        Generating transcription...
                      </div>
                    ) : (
                      <p>
                        {englishTranscription || "No transcription available."}
                      </p>
                    )}
                  </div>
                </div>

                {/* Vietnamese */}
                <div className="bg-slate-800/70 rounded-xl p-5 shadow">
                  <h2 className="text-base font-semibold text-slate-300 mb-3">
                    Translation (Vietnamese)
                  </h2>
                  <div className="min-h-[16rem] pr-2 text-slate-300 leading-relaxed space-y-4">
                    {isLoading ? (
                      <div className="text-slate-400">Đang tạo bản dịch...</div>
                    ) : (
                      <p>{vietnameseTranslation || "Chưa có bản dịch."}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
