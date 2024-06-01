import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import OpenAI from "openai";
dotenv.config();

const app = express();

// Middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

// CORS settings
const allowedOrigins = [process.env.CLIENT_URL];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
const APIKEY = process.env.APIKEY;
console.log(APIKEY);
const openai = new OpenAI({ apiKey: APIKEY });
const speechFile = path.resolve("./speech.mp3");

async function main(res, text) {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: "Today is a wonderful day to build something people love!",
  });
  console.log(speechFile);
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);
  res.send(buffer);
}
main();
app.get("/", (req, res) => {
  main(res, "i m genreated sound");
});
// Server
const PORT = process.env.PORT || 8000;
app
  .listen(8000, () => {
    console.log(`Server is running on port ${PORT}`);
  })
  .on("error", (err) => {
    if (err.code === "EACCES") {
      console.error(`Port ${PORT} requires elevated privileges`);
    } else if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use`);
    } else {
      console.error(`Error occurred: ${err.message}`);
    }
    process.exit(1);
  });
