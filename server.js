import express from "express";
import ytdl from "ytdl-core";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔵 Get video or shorts info
app.post("/info", async (req, res) => {
  try {
    const { url } = req.body;

    if (!ytdl.validateURL(url)) {
      return res.json({ error: "Invalid YouTube URL" });
    }

    const info = await ytdl.getInfo(url);

    const formats = info.formats;

    const links = {
      "480p": formats.find((f) => f.qualityLabel === "480p")?.url || null,
      "720p": formats.find((f) => f.qualityLabel === "720p")?.url || null,
      "1080p": formats.find((f) => f.qualityLabel === "1080p")?.url || null,
    };

    res.json({
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails.pop().url,
      links,
    });
  } catch (err) {
    console.log(err);
    res.json({ error: "Failed to fetch video" });
  }
});

// 🟢 Download stream (optional but nice for direct downloads)
app.get("/download", async (req, res) => {
  try {
    const { url, quality } = req.query;

    if (!ytdl.validateURL(url)) {
      return res.status(400).send("Invalid URL");
    }

    res.header("Content-Disposition", 'attachment; filename="video.mp4"');

    ytdl(url, { quality })
      .pipe(res);
  } catch (err) {
    console.log(err);
    res.status(500).send("Download failed");
  }
});

app.listen(3000, () => console.log("YouTube API running on port 3000"));
