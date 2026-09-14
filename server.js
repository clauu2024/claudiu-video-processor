const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());

const uploadFolder = path.join(__dirname, "data");
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

const storage = multer.diskStorage({
  destination: uploadFolder,
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

app.post("/upload", upload.single("video"), (req, res) => {
  res.json({ status: "ok", file: req.file.originalname });
});

app.post("/gif", async (req, res) => {
  const { file, start, end, cropX, cropY, cropW, cropH } = req.body;

  const inputPath = path.join(uploadFolder, file);
  const outputPath = path.join(uploadFolder, "output.gif");

  if (!fs.existsSync(inputPath)) {
    return res.status(404).json({ error: "Fișierul nu există pe server" });
  }

  ffmpeg(inputPath)
    .setStartTime(start)
    .setDuration(end - start)
    .videoFilters(`crop=${cropW}:${cropH}:${cropX}:${cropY}`)
    .output(outputPath)
    .on("end", () => {
      res.sendFile(outputPath);
    })
    .on("error", (err) => {
      res.status(500).json({ error: err.message });
    })
    .run();
});

app.listen(10000, () => {
  console.log("claudiu-video-processor running on port 10000");
});