import { generateContent } from "@/lib/gemini";
import { execa } from "execa";
import { createReadStream, unlink, existsSync, copyFileSync } from "fs-extra";
import { NextRequest, NextResponse } from "next/server";
import { tmpdir } from "os";
import path from "path";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

//  Helper to convert stream to base64 buffer
async function streamToBase64(
  filePath: string
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => {
      if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
      }
    });
    stream.on("error", reject);
    stream.on("end", () => {
      const buffer = Buffer.concat(chunks);
      resolve({ base64: buffer.toString("base64"), mimeType: "audio/mpeg" });
    });
  });
}

export async function POST(req: NextRequest) {
  const tempFile = path.join(tmpdir(), `${uuidv4()}.mp3`);
  let tempCookies: string | undefined;

  try {
    const { youtubeUrl } = await req.json();


    if (!youtubeUrl || !youtubeUrl.includes("youtube.com")) {
      return NextResponse.json(
        { error: "Invalid or missing YouTube URL" },
        { status: 400 }
      );
    }

    // Check cache
    console.log('Check cache')
    const existingVideo = await prisma.video.findUnique({
      where: { url: youtubeUrl },
    });
    console.log('Check cache finished: ', existingVideo)
    if (existingVideo && existingVideo.transcription) {
      console.log('DEBUG: exist item ', existingVideo)
      return NextResponse.json({ transcription: existingVideo.transcription });
    }

    console.log("Downloading audio with yt-dlp to:", tempFile);

    // 1. Get the paths to the binaries.

    const ytDlpPath = "yt-dlp";

    // 2. Define the command-line arguments.
    const args = [
      youtubeUrl,
      "--extract-audio",
      "--audio-format",
      "mp3",
      "--output",
      tempFile,
      "--quiet",
    ];

    // Check for cookies file to bypass 429/Sign-in errors
    const cookiesSource = process.env.COOKIES_PATH || "/etc/secrets/cookies.txt";
    tempCookies = path.join(tmpdir(), `cookies-${uuidv4()}.txt`);

    if (existsSync(cookiesSource)) {
      try {
        // Copy cookies to a writable location to avoid "Read-only file system" error
        // Need to import copyFileSync or use createReadStream/writeStream if fs-extra doesn't export copyFileSync (it mimics fs, so it should have copySync or copy)
        // fs-extra has copySync. Let's use that or standard fs methods.
        // Since we only imported specific methods, let's just use a simple read/write with fs-extra or import fs.
        // Actually, we can just use `require('fs').copyFileSync`.
        copyFileSync(cookiesSource, tempCookies);

        console.log(`Copied cookies from ${cookiesSource} to ${tempCookies}`);
        args.push("--cookies", tempCookies);
      } catch (err) {
        console.error("Failed to copy cookies file:", err);
      }
    } else {
      console.log(`Cookies file not found at ${cookiesSource}, proceeding without cookies.`);
    }

    // 3. Execute the command.
    await execa(ytDlpPath, args);

    const { base64, mimeType } = await streamToBase64(tempFile);
    const audioPart = { inlineData: { data: base64, mimeType } };
    const prompt =
      "Provide a detailed, accurate transcription of this audio. Return ONLY the plain text of what is said. Do NOT include timestamps, speaker labels, or any other metadata. Do NOT format it as a script.";

    console.log("Sending audio to Gemini API...");
    const transcription = await generateContent({
      prompt,
      audio: {
        data: audioPart.inlineData.data,
        mimeType: audioPart.inlineData.mimeType,
      },
    });

    if (!transcription) {
      return NextResponse.json(
        { error: "Failed to transcribe audio." },
        { status: 500 }
      );
    }

    // Save to cache
    await prisma.video.create({
      data: {
        url: youtubeUrl,
        transcription: transcription,
      },
    });

    return NextResponse.json({ transcription });
  } catch (error) {
    console.error("Error during transcription:", error);

    return NextResponse.json(
      {
        error:
          "Server error: " +
          (error instanceof Error ? error.message : "Unknown"),
      },
      { status: 500 }
    );
  } finally {
    unlink(tempFile).catch((err) => {
      console.error("Failed to delete temporary file:", tempFile, err);
    });

    if (typeof tempCookies !== 'undefined' && existsSync(tempCookies)) {
      unlink(tempCookies).catch((err) => {
        console.error("Failed to delete temporary cookies file:", tempCookies, err);
      });
    }
  }
}