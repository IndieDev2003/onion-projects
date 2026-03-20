import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import nacl from "tweetnacl";
import util from "tweetnacl-util";
import cors from "cors";


import connectDB from "./db/dbConnect.js";




const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = "super_secret";

// MongoDB
 connectDB();

// User Schema
const UserSchema = new mongoose.Schema({
  publicKey: String,
});
const User = mongoose.model("User", UserSchema);

// Store challenges temporarily
const challenges = new Map();


// 🧅 REGISTER
app.post("/register", async (req, res) => {
  const { publicKey } = req.body;

  const exists = await User.findOne({ publicKey });
  if (exists) return res.json({ message: "User exists" });

  await User.create({ publicKey });

  res.json({ message: "Registered" });
});


// 🔐 GET CHALLENGE
app.post("/challenge", async (req, res) => {
  const { publicKey } = req.body;

  const challenge = cryptoRandomString(32);
  challenges.set(publicKey, challenge);

  res.json({ challenge });
});


// 🔑 VERIFY SIGNATURE
app.post("/verify", async (req, res) => {
  const { publicKey, signature } = req.body;

  const challenge = challenges.get(publicKey);
  if (!challenge) return res.status(400).json({ error: "No challenge" });

  const isValid = nacl.sign.detached.verify(
    util.decodeUTF8(challenge),
    util.decodeBase64(signature),
    util.decodeBase64(publicKey)
  );

  if (!isValid) return res.status(401).json({ error: "Invalid signature" });

  challenges.delete(publicKey);

  const token = jwt.sign({ publicKey }, JWT_SECRET, {
    expiresIn: "15m",
  });

  res.json({ token });
});


// 🔒 PROTECTED ROUTE
app.get("/me", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.sendStatus(401);

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: decoded });
  } catch {
    res.sendStatus(401);
  }
});


// helper
function cryptoRandomString(length) {
  return [...crypto.getRandomValues(new Uint8Array(length))]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

app.listen(3000, () => console.log("Server running"));