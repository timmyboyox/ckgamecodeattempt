import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertPlayerSchema, 
  insertArmySchema, 
  insertCrusadeSchema, 
  insertPlayerQuestSchema,
  insertCompanionSchema,
  insertTerritorySchema,
  insertGameEventSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Player management routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertPlayerSchema.parse(req.body);

      // Check if username already exists
      const existingPlayer = await storage.getPlayerByUsername(data.username);
      if (existingPlayer) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const player = await storage.createPlayer(data);

      // Initialize starting data
      await initializeStartingData(player.id);

      res.json({ player });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const player = await storage.getPlayerByUsername(username);

      if (!player || player.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Don't send password back to client
      const { password: _, ...playerWithoutPassword } = player;
      res.json({ player: playerWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Game state - FIXED
  app.get("/api/game-state/:playerId", async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);

      if (isNaN(playerId) || playerId <= 0) {
        console.error("Invalid player ID received:", req.params.playerId);
        return res.status(400).json({ message: "Invalid player ID format" });
      }

      console.log("Fetching game state for player ID:", playerId);

      const gameState = await storage.getGameState(playerId);

      if (!gameState || !gameState.player) {
        console.error("Game state not found for player:", playerId);
        return res.status(404).json({ message: "Game state not found" });
      }

      console.log("Successfully returning game state for player:", playerId);
      res.json(gameState);
    } catch (error) {
      console.error("Game state fetch error:", error);
      res.status(500).json({ 
        message: "Failed to fetch game state", 
        error: error.message 
      });
    }
  });

  // Recruit army
  app.post("/api/recruit-army", async (req, res) => {
    try {
      const { playerId, armyType, cost } = req.body;
      
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      
      if (player.gold < cost) {
        return res.status(400).json({ error: "Insufficient gold" });
      }
      
      // Deduct gold
      await storage.updatePlayer(playerId, { gold: player.gold - cost });
      
      // Create new army
      const army = await storage.createArmy({
        playerId,
        name: `${armyType} Regiment`,
        description: `A regiment of ${armyType} soldiers`,
        positionX: player.positionX,
        positionY: player.positionY,
        strength: armyType === "knight" ? 150 : 100,
        morale: 100,
        experience: 0,
        equipment: armyType === "knight" ? "Heavy Armor" : "Basic Equipment",
        status: "active",
        movementPoints: 3
      });
      
      res.json({ success: true, army });
    } catch (error) {
      console.error("Error recruiting army:", error);
      res.status(500).json({ error: "Failed to recruit army" });
    }
  });

  // Hire companion
  app.post("/api/hire-companion", async (req, res) => {
    try {
      const { playerId, companionType, cost } = req.body;
      
      const player = await storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      
      if (player.gold < cost) {
        return res.status(400).json({ error: "Insufficient gold" });
      }
      
      // Deduct gold
      await storage.updatePlayer(playerId, { gold: player.gold - cost });
      
      // Create new companion
      const companion = await storage.createCompanion({
        playerId,
        name: companionType === "knight" ? "Sir Galahad" : "Squire Thomas",
        class: companionType === "knight" ? "Knight" : "Squire",
        background: companionType === "knight" ? "Noble Knight" : "Common Folk",
        level: 1,
        experience: 0,
        health: companionType === "knight" ? 120 : 80,
        maxHealth: companionType === "knight" ? 120 : 80,
        attack: companionType === "knight" ? 25 : 15,
        defense: companionType === "knight" ? 20 : 12,
        skills: {},
        equipment: {},
        loyalty: 75
      });
      
      res.json({ success: true, companion });
    } catch (error) {
      console.error("Error hiring companion:", error);
      res.status(500).json({ error: "Failed to hire companion" });
    }
  });

  // Player management
  app.patch("/api/players/:id", async (req, res) => {
    try {
      const playerId = parseInt(req.params.id);
      if (isNaN(playerId)) {
        return res.status(400).json({ message: "Invalid player ID" });
      }

      const updates = req.body;
      const player = await storage.updatePlayer(playerId, updates);

      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      res.json(player);
    } catch (error) {
      console.error("Player update error:", error);
      res.status(500).json({ message: "Failed to update player" });
    }
  });

  // Movement
  app.post("/api/players/:id/move", async (req, res) => {
    try {
      const playerId = parseInt(req.params.id);
      const { x, y } = req.body;

      const player = await storage.updatePlayer(playerId, {
        positionX: x,
        positionY: y,
        isMoving: false,
        moveEndTime: null,
        movingToX: null,
        movingToY: null
      });

      // Create movement event
      await storage.createGameEvent({
        playerId,
        type: "movement",
        message: `Moved to position (${x}, ${y})`,
        icon: "map-pin",
        importance: "low"
      });

      res.json(player);
    } catch (error) {
      console.error("Movement error:", error);
      res.status(500).json({ message: "Failed to move player" });
    }
  });

  // Army management
  app.post("/api/armies", async (req, res) => {
    try {
      const data = insertArmySchema.parse(req.body);

      // Calculate army strength and cost
      const heavyInfantry = data.heavyInfantry || 0;
      const archers = data.archers || 0;
      const cavalry = data.cavalry || 0;
      const siegeEngines = data.siegeEngines || 0;

      const totalStrength = heavyInfantry * 10 + archers * 8 + cavalry * 15 + siegeEngines * 25;
      const upkeepCost = heavyInfantry * 2 + archers * 1 + cavalry * 3 + siegeEngines * 5;

      const army = await storage.createArmy({
        ...data,
        heavyInfantry,
        archers,
        cavalry,
        siegeEngines,
        totalStrength,
        upkeepCost,
      });

      res.json(army);
    } catch (error) {
      console.error("Army creation error:", error);
      res.status(400).json({ message: "Invalid army data" });
    }
  });

  app.get("/api/armies/player/:playerId", async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const armies = await storage.getArmiesByPlayer(playerId);
      res.json(armies);
    } catch (error) {
      console.error("Armies fetch error:", error);
      res.status(500).json({ message: "Failed to fetch armies" });
    }
  });

  app.patch("/api/armies/:id", async (req, res) => {
    try {
      const armyId = parseInt(req.params.id);
      const updates = req.body;
      const army = await storage.updateArmy(armyId, updates);

      if (!army) {
        return res.status(404).json({ message: "Army not found" });
      }

      res.json(army);
    } catch (error) {
      console.error("Army update error:", error);
      res.status(500).json({ message: "Failed to update army" });
    }
  });

  app.delete("/api/armies/:id", async (req, res) => {
    try {
      const armyId = parseInt(req.params.id);
      const success = await storage.deleteArmy(armyId);

      if (!success) {
        return res.status(404).json({ message: "Army not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Army deletion error:", error);
      res.status(500).json({ message: "Failed to delete army" });
    }
  });

  // Army movement
  app.post("/api/armies/:id/move", async (req, res) => {
    try {
      const armyId = parseInt(req.params.id);
      const { x, y } = req.body;

      const army = await storage.updateArmy(armyId, {
        positionX: x,
        positionY: y,
        isMoving: false,
        moveEndTime: null,
        movingToX: null,
        movingToY: null,
        status: "idle"
      });

      res.json(army);
    } catch (error) {
      console.error("Army movement error:", error);
      res.status(500).json({ message: "Failed to move army" });
    }
  });

  // Territory management
  app.post("/api/territories", async (req, res) => {
    try {
      const data = insertTerritorySchema.parse(req.body);
      const territory = await storage.createTerritory(data);
      res.json(territory);
    } catch (error) {
      console.error("Territory creation error:", error);
      res.status(400).json({ message: "Invalid territory data" });
    }
  });

  app.get("/api/territories/player/:playerId", async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const territories = await storage.getTerritoriesByPlayer(playerId);
      res.json(territories);
    } catch (error) {
      console.error("Territories fetch error:", error);
      res.status(500).json({ message: "Failed to fetch territories" });
    }
  });

  app.patch("/api/territories/:id", async (req, res) => {
    try {
      const territoryId = parseInt(req.params.id);
      const updates = req.body;
      const territory = await storage.updateTerritory(territoryId, updates);

      if (!territory) {
        return res.status(404).json({ message: "Territory not found" });
      }

      res.json(territory);
    } catch (error) {
      console.error("Territory update error:", error);
      res.status(500).json({ message: "Failed to update territory" });
    }
  });

  // Companion management
  app.post("/api/companions", async (req, res) => {
    try {
      const data = insertCompanionSchema.parse(req.body);
      const companion = await storage.createCompanion(data);
      res.json(companion);
    } catch (error) {
      console.error("Companion creation error:", error);
      res.status(400).json({ message: "Invalid companion data" });
    }
  });

  app.get("/api/companions/player/:playerId", async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const companions = await storage.getCompanionsByPlayer(playerId);
      res.json(companions);
    } catch (error) {
      console.error("Companions fetch error:", error);
      res.status(500).json({ message: "Failed to fetch companions" });
    }
  });

  // Quest management
  app.get("/api/quests/available/:playerId", async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const quests = await storage.getAvailableQuests(playerId);
      res.json(quests);
    } catch (error) {
      console.error("Available quests error:", error);
      res.status(500).json({ message: "Failed to fetch available quests" });
    }
  });

  app.post("/api/player-quests", async (req, res) => {
    try {
      const data = insertPlayerQuestSchema.parse(req.body);
      const playerQuest = await storage.createPlayerQuest(data);

      // Create quest accepted event
      await storage.createGameEvent({
        playerId: data.playerId,
        type: "quest_accepted",
        message: "New quest accepted",
        icon: "scroll",
        importance: "normal"
      });

      res.json(playerQuest);
    } catch (error) {
      console.error("Quest acceptance error:", error);
      res.status(400).json({ message: "Invalid quest data" });
    }
  });

  app.get("/api/player-quests/:playerId", async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const quests = await storage.getPlayerQuests(playerId);
      res.json(quests);
    } catch (error) {
      console.error("Player quests error:", error);
      res.status(500).json({ message: "Failed to fetch player quests" });
    }
  });

  // Crusade management
  app.post("/api/crusades", async (req, res) => {
    try {
      const data = insertCrusadeSchema.parse(req.body);
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + data.duration);

      const crusade = await storage.createCrusade({
        ...data,
        endTime,
      });

      res.json(crusade);
    } catch (error) {
      console.error("Crusade creation error:", error);
      res.status(400).json({ message: "Invalid crusade data" });
    }
  });

  app.get("/api/crusades/player/:playerId", async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const crusades = await storage.getCrusadesByPlayer(playerId);
      res.json(crusades);
    } catch (error) {
      console.error("Crusades fetch error:", error);
      res.status(500).json({ message: "Failed to fetch crusades" });
    }
  });

  // Combat system
  app.post("/api/combat/start", async (req, res) => {
    try {
      const { playerId, encounterType, positionX, positionY, enemyData } = req.body;

      const encounter = await storage.createCombatEncounter({
        playerId,
        encounterType,
        positionX,
        positionY,
        enemyData,
      });

      res.json(encounter);
    } catch (error) {
      console.error("Combat start error:", error);
      res.status(500).json({ message: "Failed to start combat" });
    }
  });

  app.get("/api/combat/:playerId", async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const encounter = await storage.getCombatEncounter(playerId);
      res.json(encounter);
    } catch (error) {
      console.error("Combat fetch error:", error);
      res.status(500).json({ message: "Failed to fetch combat" });
    }
  });

  // Inventory
  app.get("/api/inventory/:playerId", async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const inventory = await storage.getPlayerInventory(playerId);
      res.json(inventory);
    } catch (error) {
      console.error("Inventory fetch error:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  // Factions
  app.get("/api/factions", async (req, res) => {
    try {
      const factions = await storage.getFactions();
      res.json(factions);
    } catch (error) {
      console.error("Factions fetch error:", error);
      res.status(500).json({ message: "Failed to fetch factions" });
    }
  });

  // Events
  app.get("/api/events/:playerId", async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const limit = parseInt(req.query.limit as string) || 10;
      const events = await storage.getRecentEvents(playerId, limit);
      res.json(events);
    } catch (error) {
      console.error("Events fetch error:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // World events
  app.get("/api/world-events", async (req, res) => {
    try {
      const events = await storage.getActiveWorldEvents();
      res.json(events);
    } catch (error) {
      console.error("World events fetch error:", error);
      res.status(500).json({ message: "Failed to fetch world events" });
    }
  });

  // Map data
  app.get("/api/map/:playerId", async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const player = await storage.getPlayer(playerId);

      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }

      const mapTiles = await storage.getMapTiles(
        player.positionX - 5,
        player.positionX + 5,
        player.positionY - 5,
        player.positionY + 5
      );

      res.json(mapTiles);
    } catch (error) {
      console.error("Map fetch error:", error);
      res.status(500).json({ message: "Failed to fetch map data" });
    }
  });

  // Kingdoms Management
  app.post("/api/kingdoms", async (req, res) => {
    try {
      const { name, color, description, rulerId } = req.body;
      
      const kingdom = await storage.createKingdom({
        name,
        rulerId,
        color,
        description
      });

      res.json(kingdom);
    } catch (error) {
      console.error("Kingdom creation error:", error);
      res.status(400).json({ message: "Failed to create kingdom" });
    }
  });

  app.get("/api/kingdoms", async (req, res) => {
    try {
      const kingdoms = await storage.getKingdoms();
      res.json(kingdoms);
    } catch (error) {
      console.error("Kingdoms fetch error:", error);
      res.status(500).json({ message: "Failed to fetch kingdoms" });
    }
  });

  // Player-Generated Quests
  app.post("/api/player-quests", async (req, res) => {
    try {
      const { authorId, boardLocation, title, description, requirements, reward } = req.body;

      const quest = await storage.createPlayerGeneratedQuest({
        authorId,
        boardLocation,
        title,
        description,
        requirements,
        reward
      });

      res.json(quest);
    } catch (error) {
      console.error("Player quest creation error:", error);
      res.status(400).json({ message: "Failed to create quest" });
    }
  });

  app.get("/api/player-quests", async (req, res) => {
    try {
      const { location } = req.query;
      const quests = await storage.getPlayerGeneratedQuests(location as string);
      res.json(quests);
    } catch (error) {
      console.error("Player quests fetch error:", error);
      res.status(500).json({ message: "Failed to fetch player quests" });
    }
  });

  // Chat System
  app.get("/api/chat/channels", async (req, res) => {
    try {
      const channels = await storage.getChatChannels();
      res.json(channels);
    } catch (error) {
      console.error("Chat channels error:", error);
      res.status(500).json({ message: "Failed to fetch chat channels" });
    }
  });

  app.post("/api/chat/messages", async (req, res) => {
    try {
      const { channelId, playerId, message } = req.body;

      const chatMessage = await storage.createChatMessage({
        channelId,
        playerId,
        message,
        messageType: "text"
      });

      res.json(chatMessage);
    } catch (error) {
      console.error("Chat message error:", error);
      res.status(400).json({ message: "Failed to send message" });
    }
  });

  // Guild System
  app.post("/api/guilds", async (req, res) => {
    try {
      const { name, type, description, leaderPlayerId } = req.body;

      const guild = await storage.createGuild({
        name,
        type,
        description,
        leaderPlayerId
      });

      res.json(guild);
    } catch (error) {
      console.error("Guild creation error:", error);
      res.status(400).json({ message: "Failed to create guild" });
    }
  });

  app.get("/api/guilds", async (req, res) => {
    try {
      const guilds = await storage.getGuilds();
      res.json(guilds);
    } catch (error) {
      console.error("Guilds fetch error:", error);
      res.status(500).json({ message: "Failed to fetch guilds" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to initialize starting data for new players
async function initializeStartingData(playerId: number) {
  try {
    console.log("Initializing starting data for player:", playerId);

    // Create starting territory (capital)
    await storage.createTerritory({
      playerId,
      name: "Royal Capital",
      type: "capital",
      population: 5000,
      garrison: 500,
      taxIncome: 500,
      fortificationLevel: 2,
      buildings: { castle: 1, barracks: 1, market: 1, temple: 1 },
      positionX: 5,
      positionY: 5,
    });

    // Create starting companion
    await storage.createCompanion({
      playerId,
      name: "Sir Gareth",
      class: "Warrior",
      level: 1,
      health: 80,
      maxHealth: 80,
      attack: 15,
      defense: 10,
      wealth: 100,
      background: "A loyal knight who has served your family for years. Skilled in combat and unwavering in loyalty.",
      loyalty: 80,
      morale: 70,
    });

    // Create starting army
    await storage.createArmy({
      playerId,
      name: "Royal Guard",
      description: "Your personal guard unit",
      positionX: 5,
      positionY: 5,
      heavyInfantry: 50,
      archers: 30,
      cavalry: 20,
      siegeEngines: 2,
      totalStrength: 50 * 10 + 30 * 8 + 20 * 15 + 2 * 25,
      upkeepCost: 50 * 2 + 30 * 1 + 20 * 3 + 2 * 5,
      status: "idle",
    });

    // Create welcome event
    await storage.createGameEvent({
      playerId,
      type: "welcome",
      message: "Welcome to the realm! Your journey as a noble begins now.",
      icon: "crown",
      importance: "high",
    });

    console.log("Starting data initialized successfully for player:", playerId);
  } catch (error) {
    console.error("Failed to initialize starting data for player", playerId, ":", error);
  }
}

// Generate map tiles with realistic resource distribution and settlements
async function generateMapTiles(playerId: number) {
  const mapSize = 11; // 11x11 grid
  const centerX = 5;
  const centerY = 5;

  for (let x = 0; x < mapSize; x++) {
    for (let y = 0; y < mapSize; y++) {
      const distanceFromCenter = Math.abs(x - centerX) + Math.abs(y - centerY);

      // Determine terrain based on position and randomness
      const terrainRoll = Math.random();
      let terrain = "plains";

      if (terrainRoll < 0.15) terrain = "forest";
      else if (terrainRoll < 0.25) terrain = "hills";
      else if (terrainRoll < 0.35) terrain = "mountains";
      else if (terrainRoll < 0.4) terrain = "water";
      else if (terrainRoll < 0.45) terrain = "swamp";
      else terrain = "plains";

      // Generate resources based on terrain (only 30% chance for any resources)
      let resources = {};
      if (Math.random() < 0.3) {
        switch (terrain) {
          case "mountains":
            if (Math.random() < 0.05) resources = { gems: Math.floor(Math.random() * 3) + 1 };
            else if (Math.random() < 0.2) resources = { iron: Math.floor(Math.random() * 5) + 1 };
            else resources = { stone: Math.floor(Math.random() * 8) + 2 };
            break;
          case "forest":
            if (Math.random() < 0.1) resources = { gold: Math.floor(Math.random() * 2) + 1 };
            else resources = { wood: Math.floor(Math.random() * 10) + 3 };
            break;
          case "hills":
            if (Math.random() < 0.15) resources = { iron: Math.floor(Math.random() * 4) + 1 };
            else resources = { stone: Math.floor(Math.random() * 6) + 1 };
            break;
          case "plains":
            if (Math.random() < 0.08) resources = { gold: Math.floor(Math.random() * 3) + 1 };
            break;
        }
      }

      // Generate buildings/settlements
      let buildings = {};
      let hasQuestGiver = false;
      let questGiverFaction = null;
      let settlementId = null;

      if (x === centerX && y === centerY) {
        // Player's starting capital
        buildings = { castle: 1 };
        hasQuestGiver = true;
        questGiverFaction = "Kingdom of Valor";
      } else if (distanceFromCenter > 2 && Math.random() < 0.15) {
        // Random settlements - increased probability to 15%
        const settlementRoll = Math.random();
        let settlementType = "";

        if (settlementRoll < 0.03) {
          buildings = { castle: 1 };
          settlementType = "castle";
          hasQuestGiver = true;
          questGiverFaction = "Kingdom of Valor";
        } else if (settlementRoll < 0.07) {
          buildings = { city: 1 };
          settlementType = "city";
          hasQuestGiver = Math.random() < 0.7;
          questGiverFaction = hasQuestGiver ? "Kingdom of Valor" : null;
        } else if (settlementRoll < 0.11) {
          buildings = { town: 1 };
          settlementType = "town";
          hasQuestGiver = Math.random() < 0.5;
          questGiverFaction = hasQuestGiver ? "Kingdom of Valor" : null;
        } else {
          buildings = { village: 1 };
          settlementType = "village";
          hasQuestGiver = Math.random() < 0.3;
          questGiverFaction = hasQuestGiver ? "Kingdom of Valor" : null;
        }

        // Create settlement name
        const settlementNames = [
          "Ironhold", "Goldbrook", "Stormwatch", "Greenhill", "Brightwater",
          "Redstone", "Oakenford", "Silverdale", "Blackwater", "Whitehaven",
          "Thornfield", "Ravenshollow", "Dragonspire", "Wolfsburg", "Lionheart"
        ];
        const settlementName = settlementNames[Math.floor(Math.random() * settlementNames.length)] + 
          (settlementType === "castle" ? " Castle" : 
           settlementType === "city" ? " City" : 
           settlementType === "town" ? " Town" : " Village");
      }

      // Calculate movement cost based on terrain
      let moveCost = 1;
      switch (terrain) {
        case "forest": moveCost = 2; break;
        case "hills": moveCost = 2; break;
        case "mountains": moveCost = 4; break;
        case "swamp": moveCost = 3; break;
        case "water": moveCost = 5; break;
        default: moveCost = 1;
      }

      // Create map tile
      const mapTile = {
        x,
        y,
        terrain,
        moveCost,
        hasQuestGiver,
        questGiverFaction,
        resources,
        buildings,
        settlementId,
        isExplored: distanceFromCenter <= 2 // Auto-explore tiles close to starting position
      };
      await storage.getMapTiles(x, x, y, y).then(existingTiles => {
        if (existingTiles.length === 0) {
          // Only create if tile doesn't exist
          storage.updateMapTile(x, y, mapTile);
        }
      });
    }
  }
}