#!/usr/bin/env python3
"""
24/7 Livestream Automation for King of the Screen
Pipes live browser screen to Twitch / Kick / YouTube / TikTok RTMP endpoint using FFmpeg.
"""

import os
import sys
import subprocess

RTMP_URL = os.getenv("STREAM_RTMP_URL", "rtmp://live.twitch.tv/app/")
STREAM_KEY = os.getenv("STREAM_KEY", "")
TARGET_SITE = os.getenv("APP_URL", "http://localhost:3000")

def run_stream():
    if not STREAM_KEY:
        print("❌ Error: STREAM_KEY is missing!")
        print("To start 24/7 autonomous streaming:")
        print("1. Get your Stream Key from Twitch, Kick, or YouTube Studio")
        print("2. Set STREAM_KEY=your_key in .env")
        print(f"3. Run: python3 streamer_24_7.py\n")
        return

    full_target = f"{RTMP_URL}{STREAM_KEY}"
    print(f"🎥 Starting 24/7 Live Stream to {RTMP_URL}***")
    print(f"📺 Target Screen: {TARGET_SITE}")

    # FFmpeg command for desktop/window capture (macOS / Linux compatible)
    if sys.platform == "darwin":
        # macOS AVFoundation screen capture
        cmd = [
            "ffmpeg",
            "-f", "avfoundation",
            "-framerate", "30",
            "-video_size", "1920x1080",
            "-i", "1:0",
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-b:v", "3000k",
            "-maxrate", "3000k",
            "-bufsize", "6000k",
            "-pix_fmt", "yuv420p",
            "-g", "60",
            "-c:a", "aac",
            "-b:a", "128k",
            "-ar", "44100",
            "-f", "flv",
            full_target
        ]
    else:
        # Linux X11 screen capture
        cmd = [
            "ffmpeg",
            "-f", "x11grab",
            "-s", "1920x1080",
            "-r", "30",
            "-i", ":0.0",
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-b:v", "3000k",
            "-f", "flv",
            full_target
        ]

    try:
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\n🛑 Stream stopped by user.")
    except Exception as e:
        print(f"❌ FFmpeg execution error: {e}")

if __name__ == "__main__":
    run_stream()
