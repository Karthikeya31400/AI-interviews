import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import db from "./src/lib/db.ts";
import { v4 as uuidv4 } from "uuid";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // API Routes
  
  // AI Proxy Endpoints
  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { model, prompt, config } = req.body;
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config
      });
      res.json({ text: response.text });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { model, history, message, config } = req.body;
      const chat = ai.chats.create({
        model,
        config: config?.systemInstruction ? { systemInstruction: config.systemInstruction } : undefined,
        history: history.map((h: any) => ({
          role: h.role,
          parts: [{ text: h.text }]
        }))
      });
      const response = await chat.sendMessage({ message });
      res.json({ text: response.text });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Auth Endpoints
  app.post("/api/auth/login", (req, res) => {
    const { email, displayName, photoURL, uid: providedUid } = req.body;
    
    // Check if user exists
    const checkStmt = db.prepare("SELECT * FROM users WHERE email = ?");
    let user = checkStmt.get(email);

    if (!user) {
      const uid = providedUid || uuidv4();
      const createdAt = Date.now();
      const role = email === 'pillkarthikeya63761241@gmail.com' ? 'ADMIN' : 'USER';
      const insertStmt = db.prepare(`
        INSERT INTO users (uid, email, displayName, photoURL, role, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run(uid, email, displayName, photoURL, role, createdAt);
      user = { uid, email, displayName, photoURL, role, createdAt };
    }

    res.json(user);
  });

  app.get("/api/users/:uid", (req, res) => {
    const { uid } = req.params;
    const stmt = db.prepare("SELECT * FROM users WHERE uid = ?");
    const user = stmt.get(uid);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });

  // Admin Endpoints
  app.get("/api/admin/users", (req, res) => {
    // In a real app, verify admin role here
    const stmt = db.prepare("SELECT * FROM users ORDER BY createdAt DESC");
    const users = stmt.all();
    res.json(users);
  });

  app.post("/api/admin/users/:uid/role", (req, res) => {
    const { uid } = req.params;
    const { role } = req.body;
    const stmt = db.prepare("UPDATE users SET role = ? WHERE uid = ?");
    stmt.run(role, uid);
    res.json({ success: true });
  });

  // DB Endpoints
  app.get("/api/interviews", (req, res) => {
    const { userId } = req.query;
    const stmt = db.prepare("SELECT * FROM interviews WHERE userId = ? ORDER BY createdAt DESC");
    const interviews = stmt.all(userId);
    res.json(interviews.map((i: any) => ({ ...i, evaluation: JSON.parse(i.evaluation), questions: JSON.parse(i.questions) })));
  });

  app.post("/api/interviews", (req, res) => {
    const { userId, type, position, status, score, feedback, questions, evaluation } = req.body;
    const id = uuidv4();
    const createdAt = Date.now();
    const stmt = db.prepare(`
      INSERT INTO interviews (id, userId, type, position, status, score, feedback, questions, evaluation, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, userId, type, position, status, score, feedback, JSON.stringify(questions), JSON.stringify(evaluation), createdAt);
    res.json({ id, createdAt });
  });

  app.get("/api/resume-analyses", (req, res) => {
    const { userId } = req.query;
    const stmt = db.prepare("SELECT * FROM resume_analyses WHERE userId = ? ORDER BY createdAt DESC");
    const analyses = stmt.all(userId);
    res.json(analyses.map((a: any) => ({ ...a, analysis: JSON.parse(a.analysis) })));
  });

  app.post("/api/resume-analyses", (req, res) => {
    const { userId, fileName, analysis } = req.body;
    const id = uuidv4();
    const createdAt = Date.now();
    const stmt = db.prepare(`
      INSERT INTO resume_analyses (id, userId, fileName, analysis, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, userId, fileName, JSON.stringify(analysis), createdAt);
    res.json({ id, createdAt });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
