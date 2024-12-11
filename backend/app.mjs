import "dotenv/config";
import express, { json } from "express";
import cors from "cors";
import { memoryStorage } from "multer";

import { uploadToS3 } from "./s3.mjs";

const app = express();

const PORT = process.env.PORT || 4000;

// ALLOWS TO STORE THE img THAT WAS UPLOADED IN MEMORY SO LATER CAN BE UPLOADED TO S3
const storage = memoryStorage();
// ADD file VALIDATION FOR PROD ENV
const upload = multer({ storage });

app.use(
  cors({
    origin: "*", 
  })
);

app.use(json());

app.post("/images", upload.single("image"), (req, res) => {
  const { file } = req
  const userId = req.headers["x-user-id"];

  if(!file || !userId) {
    return res.status(400).send("No file uploaded")
  }

  const { key, error } = uploadToS3({ file, userId })

  if(error) {
    return res.status(500).json({ message: error.message })
  }
  
  return res.status(201).json({ key })
});

app.get("/images", async (req, res) => {
  const userId = req.headers["x-user-id"];

  if(!userId) {
    return res.status(400).send("No user id")
  }

  const { presignedUrls, error } = await getUserPresignedUrls(userId)

  if(error) {
    return res.status(400).json({ message: error.message })
  }

  return res.status(200).json(presignedUrls)
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
