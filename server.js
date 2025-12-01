import express from "express";
import ytdl from "ytdl-core";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Supported qualities
const QUALITY_MAP = ["144p", "240p", "360p", "480p", "720p", "1080p"];

// Extract download links safely
function extractLinks(info) {
  const f = info.formats;
  const links = {};

  QUALITY_MAP.forEach((q) => {
    const match = f.find((fmt) => fmt.qualityLabel === q);
    links[q] = match ? match.url : null;
  });

  return links;
}

// 🔵 Unified endpoint for video + shorts
app.post("/info", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !ytdl.validateURL(url)) {
      return res.json({ error: "Invalid YouTube URL" });
    }

    const info = await ytdl.getInfo(url);

    res.json({
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails.pop().url,
      links: extractLinks(info),
    });
  } catch (error) {
    console.error("ERROR in /info:", error);
    res.json({ error: "Failed to fetch video info" });
  }
});

// 🟢 Direct stream download
app.get("/download", async (req, res) => {
  try {
    const { url, quality } = req.query;

    if (!url || !ytdl.validateURL(url)) {
      return res.status(400).send("Invalid URL");
    }

    const safeQuality = QUALITY_MAP.includes(quality) ? quality : "360p";

    res.header("Content-Disposition", 'attachment; filename="video.mp4"');

    ytdl(url, { quality: safeQuality }).pipe(res);
  } catch (error) {
    console.error("DOWNLOAD ERROR:", error);
    res.status(500).send("Download failed");
  }
});

app.listen(3000, () => console.log("🔥 YouTube API running on port 3000"));
