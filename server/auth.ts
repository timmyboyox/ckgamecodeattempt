import { Express, Request, Response } from "express";
import { storage } from "./storage";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Register endpoint
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      // Check if user already exists
      const existingPlayer = await storage.getPlayerByUsername(username);
      if (existingPlayer) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Create new player
      const hashedPassword = await hashPassword(password);
      const player = await storage.createPlayer({
        username,
        password: hashedPassword,
        name: username,
        title: "Peasant",
        level: 1,
        experience: 0,
        health: 100,
        maxHealth: 100,
        honor: 10,
        gold: 100,
        food: 50,
        materials: 25,
        prestige: 0,
        faith: 50,
        morale: 75,
        x: 0,
        y: 0,
        lastActionTime: new Date(),
        createdAt: new Date()
      });

      // Return player without password
      const { password: _, ...playerResponse } = player;
      res.status(201).json(playerResponse);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Login endpoint
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const player = await storage.getPlayerByUsername(username);
      if (!player) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const passwordValid = await comparePasswords(password, player.password);
      if (!passwordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Return player without password
      const { password: _, ...playerResponse } = player;
      res.json(playerResponse);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
}