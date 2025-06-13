import { eq, and, desc } from "drizzle-orm";
import { db } from "./db";
import {
  players,
  companions,
  territories,
  armies,
  crusades,
  playerQuests,
  items,
  playerInventory,
  factions,
  gameEvents,
  worldEvents,
  combatEncounters,
  kingdoms,
  kingdomMemberships,
  mapTiles,
  playerGeneratedQuests,
  chatChannels,
  chatMessages,
  guilds,
  guildMemberships,
  tradeOrders,
  resourceNodes,
  diplomaticMessages,
  diplomacyRelations,
  settlements,
} from "../shared/schema";
import type {
  Player,
  Companion,
  Territory,
  Army,
  Crusade,
  PlayerQuest,
  Quest,
  Item,
  Faction,
  GameEvent,
  WorldEvent,
  CombatEncounter,
  MapTile,
  Settlement,
  GameState,
  InsertPlayer,
  InsertCompanion,
  InsertTerritory,
  InsertArmy,
  InsertCrusade,
  InsertPlayerQuest,
  InsertItem,
  InsertFaction,
  InsertGameEvent,
  InsertCombatEncounter,
  InsertSettlement,
} from "../shared/schema";

// PostgreSQL connection is imported from db.ts

interface IStorage {
  // Player operations
  createPlayer(insertPlayer: InsertPlayer): Promise<Player>;
  getPlayer(id: number): Promise<Player | undefined>;
  getPlayerByUsername(username: string): Promise<Player | undefined>;
  updatePlayer(id: number, updates: Partial<Player>): Promise<Player | undefined>;

  // Game state
  getGameState(playerId: number): Promise<GameState>;

  // All other methods from the original implementation...
  createCompanion(insertCompanion: InsertCompanion): Promise<Companion>;
  getCompanionsByPlayer(playerId: number): Promise<Companion[]>;
  updateCompanion(id: number, updates: Partial<Companion>): Promise<Companion | undefined>;
  createTerritory(insertTerritory: InsertTerritory): Promise<Territory>;
  getTerritoriesByPlayer(playerId: number): Promise<Territory[]>;
  getTerritory(id: number): Promise<Territory | undefined>;
  updateTerritory(id: number, updates: Partial<Territory>): Promise<Territory | undefined>;
  createArmy(insertArmy: InsertArmy): Promise<Army>;
  getArmiesByPlayer(playerId: number): Promise<Army[]>;
  getArmy(id: number): Promise<Army | undefined>;
  updateArmy(id: number, updates: Partial<Army>): Promise<Army | undefined>;
  deleteArmy(id: number): Promise<boolean>;
  getNearbyArmies(x: number, y: number, radius: number): Promise<Army[]>;
  createCrusade(insertCrusade: InsertCrusade): Promise<Crusade>;
  getCrusadesByPlayer(playerId: number): Promise<Crusade[]>;
  updateCrusade(id: number, updates: Partial<Crusade>): Promise<Crusade | undefined>;
  getAvailableQuests(playerId: number): Promise<Quest[]>;
  createPlayerQuest(insertPlayerQuest: InsertPlayerQuest): Promise<PlayerQuest>;
  getPlayerQuests(playerId: number): Promise<PlayerQuest[]>;
  updatePlayerQuest(id: number, updates: Partial<PlayerQuest>): Promise<PlayerQuest | undefined>;
  createItem(insertItem: InsertItem): Promise<Item>;
  getPlayerInventory(playerId: number): Promise<(typeof playerInventory.$inferSelect & { item: Item })[]>;
  addItemToInventory(playerId: number, itemId: number, quantity: number): Promise<void>;
  getFactions(): Promise<Faction[]>;
  createFaction(insertFaction: InsertFaction): Promise<Faction>;
  updateFactionRelation(playerId: number, factionId: number, reputation: number): Promise<void>;
  getMapTiles(minX: number, maxX: number, minY: number, maxY: number): Promise<MapTile[]>;
  updateMapTile(x: number, y: number, updates: Partial<MapTile>): Promise<void>;
  createCombatEncounter(insertEncounter: InsertCombatEncounter): Promise<CombatEncounter>;
  getCombatEncounter(playerId: number): Promise<CombatEncounter | undefined>;
  updateCombatEncounter(id: number, updates: Partial<CombatEncounter>): Promise<CombatEncounter | undefined>;
  createGameEvent(insertEvent: InsertGameEvent): Promise<GameEvent>;
  getRecentEvents(playerId: number, limit?: number): Promise<GameEvent[]>;
  getActiveWorldEvents(): Promise<WorldEvent[]>;
  createKingdom(kingdom: any): Promise<any>;
  getKingdoms(): Promise<any[]>;
  getKingdomMembership(playerId: number, kingdomId: number): Promise<any>;
  createKingdomMembership(membership: any): Promise<any>;
  claimTerritory(kingdomId: number, x: number, y: number): Promise<void>;
  createPlayerGeneratedQuest(quest: any): Promise<any>;
  getPlayerGeneratedQuests(location?: string): Promise<any[]>;
  acceptPlayerGeneratedQuest(questId: number, playerId: number): Promise<any>;
  getChatChannels(): Promise<any[]>;
  getChatMessages(channelId: number, limit: number): Promise<any[]>;
  createChatMessage(message: any): Promise<any>;
  createGuild(guild: any): Promise<any>;
  getGuilds(): Promise<any[]>;
  createGuildMembership(membership: any): Promise<any>;
  createTradeOrder(order: any): Promise<any>;
  getTradeOrders(location?: string, orderType?: string): Promise<any[]>;
  getResourceNodes(minX: number, maxX: number, minY: number, maxY: number): Promise<any[]>;
  harvestResourceNode(nodeId: number, playerId: number): Promise<any>;
  createDiplomaticProposal(proposal: any): Promise<any>;
  getDiplomaticRelations(playerId: number): Promise<any[]>;
  createSettlement(insertSettlement: InsertSettlement): Promise<Settlement>;
  getSettlement(id: number): Promise<Settlement | undefined>;
  getSettlementByPosition(x: number, y: number): Promise<Settlement | undefined>;
  getSettlementsInArea(minX: number, maxX: number, minY: number, maxY: number): Promise<Settlement[]>;
  updateSettlement(id: number, updates: Partial<Settlement>): Promise<Settlement | undefined>;
  getAllSettlements(): Promise<Settlement[]>;
}

class DatabaseStorage implements IStorage {
  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    try {
      const [player] = await db
        .insert(players)
        .values(insertPlayer)
        .returning();
      return player;
    } catch (error) {
      console.error("Error creating player:", error);
      throw new Error("Failed to create player");
    }
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    try {
      if (!id || isNaN(id)) {
        console.error("Invalid player ID:", id);
        return undefined;
      }
      const [player] = await db.select().from(players).where(eq(players.id, id));
      return player;
    } catch (error) {
      console.error("Error fetching player:", error);
      return undefined;
    }
  }

  async getPlayerByUsername(username: string): Promise<Player | undefined> {
    try {
      if (!username) {
        return undefined;
      }
      const [player] = await db.select().from(players).where(eq(players.username, username));
      return player;
    } catch (error) {
      console.error("Error fetching player by username:", error);
      return undefined;
    }
  }

  async updatePlayer(id: number, updates: Partial<Player>): Promise<Player | undefined> {
    try {
      const [player] = await db
        .update(players)
        .set(updates)
        .where(eq(players.id, id))
        .returning();
      return player;
    } catch (error) {
      console.error("Error updating player:", error);
      return undefined;
    }
  }

  async getGameState(playerId: number): Promise<GameState> {
    try {
      console.log("Starting game state fetch for player:", playerId);

      if (!playerId || isNaN(playerId)) {
        throw new Error("Invalid player ID provided");
      }

      const player = await this.getPlayer(playerId);
      if (!player) {
        throw new Error(`Player with ID ${playerId} not found`);
      }

      console.log("Player found, fetching related data...");

      let companions: Companion[] = [];
      let territories: Territory[] = [];
      let armies: Army[] = [];
      let crusades: Crusade[] = [];
      let activeQuests: PlayerQuest[] = [];
      let availableQuests: Quest[] = [];
      let recentEvents: GameEvent[] = [];
      let inventory: (typeof playerInventory.$inferSelect & { item: Item })[] = [];
      let factions: Faction[] = [];
      let worldEvents: WorldEvent[] = [];
      let mapTiles: MapTile[] = [];
      let nearbyArmies: Army[] = [];
      let combatEncounter: CombatEncounter | undefined;

      try {
        companions = await this.getCompanionsByPlayer(playerId);
      } catch (error) {
        console.warn("Failed to fetch companions:", error);
      }

      try {
        territories = await this.getTerritoriesByPlayer(playerId);
      } catch (error) {
        console.warn("Failed to fetch territories:", error);
      }

      try {
        armies = await this.getArmiesByPlayer(playerId);
      } catch (error) {
        console.warn("Failed to fetch armies:", error);
      }

      try {
        crusades = await this.getCrusadesByPlayer(playerId);
      } catch (error) {
        console.warn("Failed to fetch crusades:", error);
      }

      try {
        activeQuests = await this.getPlayerQuests(playerId);
      } catch (error) {
        console.warn("Failed to fetch active quests:", error);
      }

      try {
        availableQuests = await this.getAvailableQuests(playerId);
      } catch (error) {
        console.warn("Failed to fetch available quests:", error);
      }

      try {
        recentEvents = await this.getRecentEvents(playerId);
      } catch (error) {
        console.warn("Failed to fetch recent events:", error);
      }

      try {
        inventory = await this.getPlayerInventory(playerId);
      } catch (error) {
        console.warn("Failed to fetch inventory:", error);
      }

      try {
        factions = await this.getFactions();
      } catch (error) {
        console.warn("Failed to fetch factions:", error);
      }

      try {
        worldEvents = await this.getActiveWorldEvents();
      } catch (error) {
        console.warn("Failed to fetch world events:", error);
      }

      try {
        mapTiles = await this.getMapTiles(
          player.positionX - 5,
          player.positionX + 5,
          player.positionY - 5,
          player.positionY + 5
        );
      } catch (error) {
        console.warn("Failed to fetch map tiles:", error);
      }

      try {
        nearbyArmies = await this.getNearbyArmies(player.positionX, player.positionY, 3);
      } catch (error) {
        console.warn("Failed to fetch nearby armies:", error);
      }

      try {
        combatEncounter = await this.getCombatEncounter(playerId);
      } catch (error) {
        console.warn("Failed to fetch combat encounter:", error);
      }

      const gameState: GameState = {
        player,
        companions,
        territories,
        armies,
        crusades,
        activeQuests,
        availableQuests,
        recentEvents,
        inventory,
        factions,
        mapTiles,
        nearbyArmies,
        worldEvents,
        combatEncounter,
      };

      console.log("Game state compiled successfully for player:", playerId);
      return gameState;
    } catch (error) {
      console.error("Critical error in getGameState:", error);
      throw new Error(`Failed to fetch game state: ${error.message}`);
    }
  }

  async createCompanion(insertCompanion: InsertCompanion): Promise<Companion> {
    try {
      const [companion] = await db
        .insert(companions)
        .values(insertCompanion)
        .returning();
      return companion;
    } catch (error) {
      console.error("Error creating companion:", error);
      throw new Error("Failed to create companion");
    }
  }

  async getCompanionsByPlayer(playerId: number): Promise<Companion[]> {
    try {
      return await db.select().from(companions).where(eq(companions.playerId, playerId));
    } catch (error) {
      console.error("Error fetching companions:", error);
      return [];
    }
  }

  async updateCompanion(id: number, updates: Partial<Companion>): Promise<Companion | undefined> {
    try {
      const [companion] = await db
        .update(companions)
        .set(updates)
        .where(eq(companions.id, id))
        .returning();
      return companion;
    } catch (error) {
      console.error("Error updating companion:", error);
      return undefined;
    }
  }

  async createTerritory(insertTerritory: InsertTerritory): Promise<Territory> {
    try {
      const [territory] = await db
        .insert(territories)
        .values(insertTerritory)
        .returning();
      return territory;
    } catch (error) {
      console.error("Error creating territory:", error);
      throw new Error("Failed to create territory");
    }
  }

  async getTerritoriesByPlayer(playerId: number): Promise<Territory[]> {
    try {
      return await db.select().from(territories).where(eq(territories.playerId, playerId));
    } catch (error) {
      console.error("Error fetching territories:", error);
      return [];
    }
  }

  async getTerritory(id: number): Promise<Territory | undefined> {
    try {
      const [territory] = await db.select().from(territories).where(eq(territories.id, id));
      return territory;
    } catch (error) {
      console.error("Error fetching territory:", error);
      return undefined;
    }
  }

  async updateTerritory(id: number, updates: Partial<Territory>): Promise<Territory | undefined> {
    try {
      const [territory] = await db
        .update(territories)
        .set(updates)
        .where(eq(territories.id, id))
        .returning();
      return territory;
    } catch (error) {
      console.error("Error updating territory:", error);
      return undefined;
    }
  }

  async createArmy(insertArmy: InsertArmy): Promise<Army> {
    try {
      const [army] = await db
        .insert(armies)
        .values(insertArmy)
        .returning();
      return army;
    } catch (error) {
      console.error("Error creating army:", error);
      throw new Error("Failed to create army");
    }
  }

  async getArmiesByPlayer(playerId: number): Promise<Army[]> {
    try {
      return await db.select().from(armies).where(eq(armies.playerId, playerId));
    } catch (error) {
      console.error("Error fetching armies:", error);
      return [];
    }
  }

  async getArmy(id: number): Promise<Army | undefined> {
    try {
      const [army] = await db.select().from(armies).where(eq(armies.id, id));
      return army;
    } catch (error) {
      console.error("Error fetching army:", error);
      return undefined;
    }
  }

  async updateArmy(id: number, updates: Partial<Army>): Promise<Army | undefined> {
    try {
      const [army] = await db
        .update(armies)
        .set(updates)
        .where(eq(armies.id, id))
        .returning();
      return army;
    } catch (error) {
      console.error("Error updating army:", error);
      return undefined;
    }
  }

  async deleteArmy(id: number): Promise<boolean> {
    try {
      const result = await db.delete(armies).where(eq(armies.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting army:", error);
      return false;
    }
  }

  async getNearbyArmies(x: number, y: number, radius: number): Promise<Army[]> {
    try {
      return await db.select().from(armies);
    } catch (error) {
      console.error("Error fetching nearby armies:", error);
      return [];
    }
  }

  async createCrusade(insertCrusade: InsertCrusade): Promise<Crusade> {
    try {
      const [crusade] = await db
        .insert(crusades)
        .values(insertCrusade)
        .returning();
      return crusade;
    } catch (error) {
      console.error("Error creating crusade:", error);
      throw new Error("Failed to create crusade");
    }
  }

  async getCrusadesByPlayer(playerId: number): Promise<Crusade[]> {
    try {
      return await db.select().from(crusades).where(eq(crusades.playerId, playerId));
    } catch (error) {
      console.error("Error fetching crusades:", error);
      return [];
    }
  }

  async updateCrusade(id: number, updates: Partial<Crusade>): Promise<Crusade | undefined> {
    try {
      const [crusade] = await db
        .update(crusades)
        .set(updates)
        .where(eq(crusades.id, id))
        .returning();
      return crusade;
    } catch (error) {
      console.error("Error updating crusade:", error);
      return undefined;
    }
  }

  async getAvailableQuests(playerId: number): Promise<Quest[]> {
    try {
      const playerData = await this.getPlayer(playerId);
      if (!playerData) return [];

      return [
        {
          id: 1,
          name: "Clear the Bandit Camp",
          description: "A group of bandits has been terrorizing merchant caravans near the eastern road. Clear them out and restore safe passage.",
          factionId: null,
          questGiverName: "Captain Aldric",
          questType: "kill",
          difficulty: "medium",
          duration: 4,
          goldReward: 500,
          experienceReward: 250,
          honorReward: 10,
          itemRewards: [],
          factionReputationChanges: {},
          requiredTroops: 25,
          requiredLevel: 1,
          requirements: {},
          objectives: ["Locate the bandit camp", "Defeat the bandit leader", "Report back to Captain Aldric"],
          isActive: true,
          isChainQuest: false,
          nextQuestId: null,
          positionX: 8,
          positionY: 6,
        },
        {
          id: 2,
          name: "Escort the Merchant Caravan",
          description: "A wealthy merchant requires protection for his valuable cargo traveling to the northern city.",
          factionId: null,
          questGiverName: "Master Gareth",
          questType: "escort",
          difficulty: "easy",
          duration: 2,
          goldReward: 300,
          experienceReward: 150,
          honorReward: 5,
          itemRewards: [],
          factionReputationChanges: {},
          requiredTroops: 15,
          requiredLevel: 1,
          requirements: {},
          objectives: ["Meet the merchant", "Escort to destination"],
          isActive: true,
          isChainQuest: false,
          nextQuestId: null,
          positionX: 3,
          positionY: 7,
        },
      ] as Quest[];
    } catch (error) {
      console.error("Error fetching available quests:", error);
      return [];
    }
  }

  async createPlayerQuest(insertPlayerQuest: InsertPlayerQuest): Promise<PlayerQuest> {
    try {
      const [playerQuest] = await db
        .insert(playerQuests)
        .values(insertPlayerQuest)
        .returning();
      return playerQuest;
    } catch (error) {
      console.error("Error creating player quest:", error);
      throw new Error("Failed to create player quest");
    }
  }

  async getPlayerQuests(playerId: number): Promise<PlayerQuest[]> {
    try {
      return await db.select().from(playerQuests).where(eq(playerQuests.playerId, playerId));
    } catch (error) {
      console.error("Error fetching player quests:", error);
      return [];
    }
  }

  async updatePlayerQuest(id: number, updates: Partial<PlayerQuest>): Promise<PlayerQuest | undefined> {
    try {
      const [playerQuest] = await db
        .update(playerQuests)
        .set(updates)
        .where(eq(playerQuests.id, id))
        .returning();
      return playerQuest;
    } catch (error) {
      console.error("Error updating player quest:", error);
      return undefined;
    }
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    try {
      const [item] = await db
        .insert(items)
        .values(insertItem)
        .returning();
      return item;
    } catch (error) {
      console.error("Error creating item:", error);
      throw new Error("Failed to create item");
    }
  }

  async getPlayerInventory(playerId: number): Promise<(typeof playerInventory.$inferSelect & { item: Item })[]> {
    try {
      const inventory = await db
        .select({
          id: playerInventory.id,
          playerId: playerInventory.playerId,
          itemId: playerInventory.itemId,
          quantity: playerInventory.quantity,
          isEquipped: playerInventory.isEquipped,
          slot: playerInventory.slot,
          item: items,
        })
        .from(playerInventory)
        .innerJoin(items, eq(playerInventory.itemId, items.id))
        .where(eq(playerInventory.playerId, playerId));

      return inventory;
    } catch (error) {
      console.error("Error fetching player inventory:", error);
      return [];
    }
  }

  async addItemToInventory(playerId: number, itemId: number, quantity: number): Promise<void> {
    try {
      await db.insert(playerInventory).values({
        playerId,
        itemId,
        quantity,
      });
    } catch (error) {
      console.error("Error adding item to inventory:", error);
      throw new Error("Failed to add item to inventory");
    }
  }

  async getFactions(): Promise<Faction[]> {
    try {
      return await db.select().from(factions);
    } catch (error) {
      console.error("Error fetching factions:", error);
      return [];
    }
  }

  async createFaction(insertFaction: InsertFaction): Promise<Faction> {
    try {
      const [faction] = await db
        .insert(factions)
        .values(insertFaction)
        .returning();
      return faction;
    } catch (error) {
      console.error("Error creating faction:", error);
      throw new Error("Failed to create faction");
    }
  }

  async updateFactionRelation(playerId: number, factionId: number, reputation: number): Promise<void> {
    try {
      const player = await this.getPlayer(playerId);
      if (player) {
        const factionData = await db.select().from(factions).where(eq(factions.id, factionId));
        if (factionData.length > 0) {
          const reputations = player.factionReputations as Record<string, number>;
          reputations[factionData[0].name] = reputation;
          await this.updatePlayer(playerId, { factionReputations: reputations });
        }
      }
    } catch (error) {
      console.error("Error updating faction relation:", error);
    }
  }

  async getMapTiles(minX: number, maxX: number, minY: number, maxY: number): Promise<MapTile[]> {
    try {
      const tiles: MapTile[] = [];
      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          tiles.push({
            id: x * 1000 + y,
            x,
            y,
            terrain: x === 5 && y === 5 ? "capital" : Math.random() > 0.7 ? "forest" : "plains",
            moveCost: 1,
            hasQuestGiver: Math.random() > 0.9,
            questGiverFaction: null,
            resources: [],
            buildings: [],
            isExplored: Math.abs(x - 5) <= 2 && Math.abs(y - 5) <= 2,
          });
        }
      }
      return tiles;
    } catch (error) {
      console.error("Error fetching map tiles:", error);
      return [];
    }
  }

  async updateMapTile(x: number, y: number, updates: Partial<MapTile>): Promise<void> {
    try {
    } catch (error) {
      console.error("Error updating map tile:", error);
    }
  }

  async createCombatEncounter(insertEncounter: InsertCombatEncounter): Promise<CombatEncounter> {
    try {
      const [encounter] = await db
        .insert(combatEncounters)
        .values(insertEncounter)
        .returning();
      return encounter;
    } catch (error) {
      console.error("Error creating combat encounter:", error);
      throw new Error("Failed to create combat encounter");
    }
  }

  async getCombatEncounter(playerId: number): Promise<CombatEncounter | undefined> {
    try {
      const [encounter] = await db
        .select()
        .from(combatEncounters)
        .where(and(eq(combatEncounters.playerId, playerId), eq(combatEncounters.status, "active")));
      return encounter;
    } catch (error) {
      console.error("Error fetching combat encounter:", error);
      return undefined;
    }
  }

  async updateCombatEncounter(id: number, updates: Partial<CombatEncounter>): Promise<CombatEncounter | undefined> {
    try {
      const [encounter] = await db
        .update(combatEncounters)
        .set(updates)
        .where(eq(combatEncounters.id, id))
        .returning();
      return encounter;
    } catch (error) {
      console.error("Error updating combat encounter:", error);
      return undefined;
    }
  }

  async createGameEvent(insertEvent: InsertGameEvent): Promise<GameEvent> {
    try {
      const [event] = await db
        .insert(gameEvents)
        .values(insertEvent)
        .returning();
      return event;
    } catch (error) {
      console.error("Error creating game event:", error);
      throw new Error("Failed to create game event");
    }
  }

  async getRecentEvents(playerId: number, limit = 10): Promise<GameEvent[]> {
    try {
      return await db
        .select()
        .from(gameEvents)
        .where(eq(gameEvents.playerId, playerId))
        .orderBy(desc(gameEvents.createdAt))
        .limit(limit);
    } catch (error) {
      console.error("Error fetching recent events:", error);
      return [];
    }
  }

  async getActiveWorldEvents(): Promise<WorldEvent[]> {
    try {
      return await db.select().from(worldEvents).where(eq(worldEvents.isActive, true));
    } catch (error) {
      console.error("Error fetching world events:", error);
      return [];
    }
  }

  async createKingdom(kingdom: any): Promise<any> {
    try {
      const [result] = await db
        .insert(kingdoms)
        .values(kingdom)
        .returning();
      return result;
    } catch (error) {
      console.error("Error creating kingdom:", error);
      throw new Error("Failed to create kingdom");
    }
  }

  async getKingdoms(): Promise<any[]> {
    try {
      return await db.select().from(kingdoms);
    } catch (error) {
      console.error("Error fetching kingdoms:", error);
      return [];
    }
  }

  async getKingdomMembership(playerId: number, kingdomId: number): Promise<any> {
    try {
      const [membership] = await db
        .select()
        .from(kingdomMemberships)
        .where(and(eq(kingdomMemberships.playerId, playerId), eq(kingdomMemberships.kingdomId, kingdomId)));
      return membership;
    } catch (error) {
      console.error("Error fetching kingdom membership:", error);
      return undefined;
    }
  }

  async createKingdomMembership(membership: any): Promise<any> {
    try {
      const [result] = await db
        .insert(kingdomMemberships)
        .values(membership)
        .returning();
      return result;
    } catch (error) {
      console.error("Error creating kingdom membership:", error);
      throw new Error("Failed to create kingdom membership");
    }
  }

  async claimTerritory(kingdomId: number, x: number, y: number): Promise<void> {
    try {
      await db
        .update(mapTiles)
        .set({ controlledBy: kingdomId })
        .where(and(eq(mapTiles.x, x), eq(mapTiles.y, y)));
    } catch (error) {
      console.error("Error claiming territory:", error);
    }
  }

  async createPlayerGeneratedQuest(quest: any): Promise<any> {
    try {
      const [result] = await db
        .insert(playerGeneratedQuests)
        .values(quest)
        .returning();
      return result;
    } catch (error) {
      console.error("Error creating player generated quest:", error);
      throw new Error("Failed to create player generated quest");
    }
  }

  async getPlayerGeneratedQuests(location?: string): Promise<any[]> {
    try {
      const query = db.select().from(playerGeneratedQuests);
      if (location) {
        return await query.where(eq(playerGeneratedQuests.boardLocation, location));
      }
      return await query;
    } catch (error) {
      console.error("Error fetching player generated quests:", error);
      return [];
    }
  }

  async acceptPlayerGeneratedQuest(questId: number, playerId: number): Promise<any> {
    try {
      const [result] = await db
        .update(playerGeneratedQuests)
        .set({ acceptedBy: playerId, status: "accepted" })
        .where(eq(playerGeneratedQuests.id, questId))
        .returning();
      return result;
    } catch (error) {
      console.error("Error accepting player generated quest:", error);
      throw new Error("Failed to accept player generated quest");
    }
  }

  async getChatChannels(): Promise<any[]> {
    try {
      return await db.select().from(chatChannels);
    } catch (error) {
      console.error("Error fetching chat channels:", error);
      return [];
    }
  }

  async getChatMessages(channelId: number, limit: number): Promise<any[]> {
    try {
      return await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.channelId, channelId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(limit);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      return [];
    }
  }

  async createChatMessage(message: any): Promise<any> {
    try {
      const [result] = await db
        .insert(chatMessages)
        .values(message)
        .returning();
      return result;
    } catch (error) {
      console.error("Error creating chat message:", error);
      throw new Error("Failed to create chat message");
    }
  }

  async createGuild(guild: any): Promise<any> {
    try {
      const [result] = await db
        .insert(guilds)
        .values(guild)
        .returning();
      return result;
    } catch (error) {
      console.error("Error creating guild:", error);
      throw new Error("Failed to create guild");
    }
  }

  async getGuilds(): Promise<any[]> {
    try {
      return await db.select().from(guilds);
    } catch (error) {
      console.error("Error fetching guilds:", error);
      return [];
    }
  }

  async createGuildMembership(membership: any): Promise<any> {
    try {
      const [result] = await db
        .insert(guildMemberships)
        .values(membership)
        .returning();
      return result;
    } catch (error) {
      console.error("Error creating guild membership:", error);
      throw new Error("Failed to create guild membership");
    }
  }

  async createTradeOrder(order: any): Promise<any> {
    try {
      const [result] = await db
        .insert(tradeOrders)
        .values(order)
        .returning();
      return result;
    } catch (error) {
      console.error("Error creating trade order:", error);
      throw new Error("Failed to create trade order");
    }
  }

  async getTradeOrders(location?: string, orderType?: string): Promise<any[]> {
    try {
      let query = db.select().from(tradeOrders);
      const conditions = [];

      if (location) {
        conditions.push(eq(tradeOrders.location, location));
      }
      if (orderType) {
        conditions.push(eq(tradeOrders.orderType, orderType));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      return await query;
    } catch (error) {
      console.error("Error fetching trade orders:", error);
      return [];
    }
  }

  async getResourceNodes(minX: number, maxX: number, minY: number, maxY: number): Promise<any[]> {
    try {
      return await db
        .select()
        .from(resourceNodes)
        .where(
          and(
            eq(resourceNodes.x, minX),
            eq(resourceNodes.x, maxX),
            eq(resourceNodes.y, minY),
            eq(resourceNodes.y, maxY)
          )
        );
    } catch (error) {
      console.error("Error fetching resource nodes:", error);
      return [];
    }
  }

  async harvestResourceNode(nodeId: number, playerId: number): Promise<any> {
    try {
      const [node] = await db
        .select()
        .from(resourceNodes)
        .where(eq(resourceNodes.id, nodeId));

      if (!node) throw new Error("Resource node not found");

      await db
        .update(resourceNodes)
        .set({ currentQuantity: node.currentQuantity - 1 })
        .where(eq(resourceNodes.id, nodeId));

      return { resourceType: node.resourceType, quantity: 1 };
    } catch (error) {
      console.error("Error harvesting resource node:", error);
      throw new Error("Failed to harvest resource node");
    }
  }

  async createDiplomaticProposal(proposal: any): Promise<any> {
    try {
      const [result] = await db
        .insert(diplomaticMessages)
        .values(proposal)
        .returning();
      return result;
    } catch (error) {
      console.error("Error creating diplomatic proposal:", error);
      throw new Error("Failed to create diplomatic proposal");
    }
  }

  async getDiplomaticRelations(playerId: number): Promise<any[]> {
    try {
      return await db
        .select()
        .from(diplomacyRelations)
        .where(eq(diplomacyRelations.playerId, playerId));
    } catch (error) {
      console.error("Error fetching diplomatic relations:", error);
      return [];
    }
  }

  async createSettlement(insertSettlement: InsertSettlement): Promise<Settlement> {
    try {
      const [settlement] = await db
        .insert(settlements)
        .values(insertSettlement)
        .returning();
      return settlement;
    } catch (error) {
      console.error("Error creating settlement:", error);
      throw new Error("Failed to create settlement");
    }
  }

  async getSettlement(id: number): Promise<Settlement | undefined> {
    try {
      const [settlement] = await db
        .select()
        .from(settlements)
        .where(eq(settlements.id, id));
      return settlement;
    } catch (error) {
      console.error("Error fetching settlement:", error);
      return undefined;
    }
  }

  async getSettlementByPosition(x: number, y: number): Promise<Settlement | undefined> {
    try {
      const [settlement] = await db
        .select()
        .from(settlements)
        .where(and(eq(settlements.x, x), eq(settlements.y, y)));
      return settlement;
    } catch (error) {
      console.error("Error fetching settlement by position:", error);
      return undefined;
    }
  }

  async getSettlementsInArea(minX: number, maxX: number, minY: number, maxY: number): Promise<Settlement[]> {
    try {
      return await db
        .select()
        .from(settlements)
        .where(
          and(
            eq(settlements.x, minX),
            eq(settlements.x, maxX),
            eq(settlements.y, minY),
            eq(settlements.y, maxY)
          )
        );
    } catch (error) {
      console.error("Error fetching settlements in area:", error);
      return [];
    }
  }

  async updateSettlement(id: number, updates: Partial<Settlement>): Promise<Settlement | undefined> {
    try {
      const [settlement] = await db
        .update(settlements)
        .set(updates)
        .where(eq(settlements.id, id))
        .returning();
      return settlement;
    } catch (error) {
      console.error("Error updating settlement:", error);
      return undefined;
    }
  }

  async getAllSettlements(): Promise<Settlement[]> {
    try {
      return await db.select().from(settlements);
    } catch (error) {
      console.error("Error fetching all settlements:", error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();