import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Players table - Enhanced for RPG mechanics
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  title: text("title").notNull().default("Knight"),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  health: integer("health").notNull().default(100),
  maxHealth: integer("max_health").notNull().default(100),
  honor: integer("honor").notNull().default(100),
  gold: integer("gold").notNull().default(5000),
  food: integer("food").notNull().default(2000),
  materials: integer("materials").notNull().default(1000),
  population: integer("population").notNull().default(10000),
  turnNumber: integer("turn_number").notNull().default(1),
  positionX: integer("position_x").notNull().default(5),
  positionY: integer("position_y").notNull().default(5),
  movingToX: integer("moving_to_x"),
  movingToY: integer("moving_to_y"),
  moveEndTime: timestamp("move_end_time"),
  isMoving: boolean("is_moving").notNull().default(false),
  factionReputations: jsonb("faction_reputations").notNull().default('{"Kingdom of Valor": 0, "Bandit Clan": 0, "Dragon Cult": 0}'),
  skills: jsonb("skills").notNull().default('{}'),
  lastTurnTime: timestamp("last_turn_time").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// World map tiles
export const mapTiles = pgTable("map_tiles", {
  id: serial("id").primaryKey(),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  terrain: text("terrain").notNull().default("plains"), // plains, forest, hills, water, road
  moveCost: integer("move_cost").notNull().default(1),
  hasQuestGiver: boolean("has_quest_giver").notNull().default(false),
  questGiverFaction: text("quest_giver_faction"),
  resources: jsonb("resources").notNull().default('{}'),
  buildings: jsonb("buildings").notNull().default('{}'),
  settlementId: integer("settlement_id").references(() => settlements.id),
  isExplored: boolean("is_explored").notNull().default(false),
});

// Settlements table - Detailed settlement system
export const settlements = pgTable("settlements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // village, town, city, castle, capital
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  population: integer("population").notNull().default(100),
  wealth: integer("wealth").notNull().default(1000),
  militiaSize: integer("militia_size").notNull().default(10),
  factionId: integer("faction_id").references(() => factions.id),
  factionLoyalty: integer("faction_loyalty").notNull().default(50), // 0-100
  
  // Buildings and services
  hasBlacksmith: boolean("has_blacksmith").notNull().default(false),
  blacksmithLevel: integer("blacksmith_level").notNull().default(1), // 1-5
  hasTavern: boolean("has_tavern").notNull().default(false),
  hasMarket: boolean("has_market").notNull().default(false),
  hasTemple: boolean("has_temple").notNull().default(false),
  hasBarracks: boolean("has_barracks").notNull().default(false),
  hasWalls: boolean("has_walls").notNull().default(false),
  wallLevel: integer("wall_level").notNull().default(0), // 0-3
  
  // Economy and trade
  tradeGoods: jsonb("trade_goods").notNull().default('{}'), // what they buy/sell
  taxRate: integer("tax_rate").notNull().default(10), // percentage
  prosperity: integer("prosperity").notNull().default(50), // 0-100
  
  // Mercenaries and recruitment
  availableMercenaries: jsonb("available_mercenaries").notNull().default('[]'),
  recruitmentCapacity: integer("recruitment_capacity").notNull().default(5),
  
  // Quest system
  availableQuests: jsonb("available_quests").notNull().default('[]'),
  questGiverNames: jsonb("quest_giver_names").notNull().default('[]'),
  
  // Politics and diplomacy
  politicalStatus: text("political_status").notNull().default("neutral"), // allied, hostile, neutral, vassal
  lastRaidTime: timestamp("last_raid_time"),
  defenseStrength: integer("defense_strength").notNull().default(10),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Territories table - Simplified for world map integration
export const territories = pgTable("territories", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => players.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'capital', 'fortress', 'village', 'outpost'
  population: integer("population").notNull().default(1000),
  garrison: integer("garrison").notNull().default(100),
  taxIncome: integer("tax_income").notNull().default(100),
  fortificationLevel: integer("fortification_level").notNull().default(1),
  buildings: jsonb("buildings").notNull().default('{}'), // {barracks: 1, market: 2, walls: 3, temple: 1}
  positionX: integer("position_x").notNull(),
  positionY: integer("position_y").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Companions table - New feature
export const companions = pgTable("companions", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => players.id).notNull(),
  name: text("name").notNull(),
  class: text("class").notNull(), // Squire, Archer, Warrior, Mage
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  health: integer("health").notNull().default(50),
  maxHealth: integer("max_health").notNull().default(50),
  attack: integer("attack").notNull().default(10),
  defense: integer("defense").notNull().default(5),
  wealth: integer("wealth").notNull().default(0),
  background: text("background").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  loyalty: integer("loyalty").notNull().default(50),
  morale: integer("morale").notNull().default(50),
  skills: jsonb("skills").notNull().default('{}'),
  equipment: jsonb("equipment").notNull().default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Items table - Inventory system
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // weapon, armor, consumable, quest
  rarity: text("rarity").notNull().default("common"), // common, uncommon, rare, epic, legendary
  description: text("description").notNull(),
  value: integer("value").notNull().default(0),
  effects: jsonb("effects").notNull().default('{}'), // stat bonuses, healing amounts, etc.
  requirements: jsonb("requirements").notNull().default('{}'), // level, class restrictions
  isStackable: boolean("is_stackable").notNull().default(false),
  maxStack: integer("max_stack").notNull().default(1),
});

// Player inventory
export const playerInventory = pgTable("player_inventory", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => players.id).notNull(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  isEquipped: boolean("is_equipped").notNull().default(false),
  slot: text("slot"), // weapon, armor, accessory for equipped items
});

// Armies table - Enhanced for world map movement
export const armies = pgTable("armies", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => players.id).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  territoryId: integer("territory_id").references(() => territories.id),
  positionX: integer("position_x").notNull().default(5),
  positionY: integer("position_y").notNull().default(5),
  movingToX: integer("moving_to_x"),
  movingToY: integer("moving_to_y"),
  moveEndTime: timestamp("move_end_time"),
  isMoving: boolean("is_moving").notNull().default(false),
  movePath: jsonb("move_path").notNull().default('[]'),
  heavyInfantry: integer("heavy_infantry").notNull().default(0),
  archers: integer("archers").notNull().default(0),
  cavalry: integer("cavalry").notNull().default(0),
  siegeEngines: integer("siege_engines").notNull().default(0),
  totalStrength: integer("total_strength").notNull().default(0),
  upkeepCost: integer("upkeep_cost").notNull().default(0),
  status: text("status").notNull().default("idle"), // 'idle', 'moving', 'crusading', 'defending'
  aiType: text("ai_type"), // 'patrol', 'guard', 'merchant' for AI armies
  aiWaypoints: jsonb("ai_waypoints").notNull().default('[]'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Factions table
export const factions = pgTable("factions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  capitalX: integer("capital_x").notNull(),
  capitalY: integer("capital_y").notNull(),
  color: text("color").notNull(), // for map display
  isPlayerFaction: boolean("is_player_faction").notNull().default(false),
  power: integer("power").notNull().default(100),
  wealth: integer("wealth").notNull().default(1000),
  relations: jsonb("relations").notNull().default('{}'), // relations with other factions
});

// Quests table - Enhanced with faction integration
export const quests = pgTable("quests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  factionId: integer("faction_id").references(() => factions.id),
  questGiverName: text("quest_giver_name").notNull(),
  questType: text("quest_type").notNull(), // 'kill', 'deliver', 'escort', 'gather', 'explore'
  difficulty: text("difficulty").notNull(), // 'easy', 'medium', 'hard', 'legendary'
  duration: integer("duration").notNull(), // in hours
  goldReward: integer("gold_reward").notNull(),
  experienceReward: integer("experience_reward").notNull().default(0),
  honorReward: integer("honor_reward").notNull().default(0),
  itemRewards: jsonb("item_rewards").notNull().default('[]'),
  factionReputationChanges: jsonb("faction_reputation_changes").notNull().default('{}'),
  requiredTroops: integer("required_troops").notNull(),
  requiredLevel: integer("required_level").notNull().default(1),
  requirements: jsonb("requirements").notNull().default('{}'), // other quest requirements
  objectives: jsonb("objectives").notNull().default('[]'), // multi-step objectives
  isActive: boolean("is_active").notNull().default(true),
  isChainQuest: boolean("is_chain_quest").notNull().default(false),
  nextQuestId: integer("next_quest_id"),
  positionX: integer("position_x"),
  positionY: integer("position_y"),
});

// Player Quests (for tracking accepted quests)
export const playerQuests = pgTable("player_quests", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => players.id).notNull(),
  questId: integer("quest_id").references(() => quests.id).notNull(),
  armyId: integer("army_id").references(() => armies.id),
  status: text("status").notNull().default("active"), // 'active', 'completed', 'failed'
  progress: jsonb("progress").notNull().default('{}'), // track objective completion
  currentObjective: integer("current_objective").notNull().default(0),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
});

// Crusades table - Enhanced
export const crusades = pgTable("crusades", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => players.id).notNull(),
  armyId: integer("army_id").references(() => armies.id).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  targetLocation: text("target_location").notNull(),
  targetX: integer("target_x"),
  targetY: integer("target_y"),
  objective: text("objective").notNull(), // 'conquest', 'raid', 'liberation', 'resources'
  progress: integer("progress").notNull().default(0), // 0-100
  duration: integer("duration").notNull(), // in hours
  supplyCost: integer("supply_cost").notNull(),
  status: text("status").notNull().default("active"), // 'active', 'completed', 'failed'
  rewards: jsonb("rewards").notNull().default('{}'),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
});

// Combat encounters
export const combatEncounters = pgTable("combat_encounters", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => players.id).notNull(),
  encounterType: text("encounter_type").notNull(), // 'bandits', 'monsters', 'rival_army'
  positionX: integer("position_x").notNull(),
  positionY: integer("position_y").notNull(),
  enemyData: jsonb("enemy_data").notNull(), // enemy composition and stats
  status: text("status").notNull().default("active"), // 'active', 'won', 'lost', 'fled'
  rewards: jsonb("rewards").notNull().default('{}'),
  turnOrder: jsonb("turn_order").notNull().default('[]'),
  currentTurn: integer("current_turn").notNull().default(0),
  battleLog: jsonb("battle_log").notNull().default('[]'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Diplomacy - Relations between players and factions
export const diplomacyRelations = pgTable("diplomacy_relations", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => players.id).notNull(),
  factionId: integer("faction_id").references(() => factions.id).notNull(),
  relation: text("relation").notNull().default("neutral"), // 'ally', 'enemy', 'neutral', 'war', 'trade'
  reputation: integer("reputation").notNull().default(0), // -100 to 100
  lastInteraction: timestamp("last_interaction").defaultNow(),
  treatyType: text("treaty_type"), // 'trade', 'non_aggression', 'alliance'
  treatyExpires: timestamp("treaty_expires"),
});

// Messages/Diplomacy communication
export const diplomaticMessages = pgTable("diplomatic_messages", {
  id: serial("id").primaryKey(),
  fromPlayerId: integer("from_player_id").references(() => players.id),
  toPlayerId: integer("to_player_id").references(() => players.id),
  fromFactionId: integer("from_faction_id").references(() => factions.id),
  toFactionId: integer("to_faction_id").references(() => factions.id),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  messageType: text("message_type").notNull(), // 'diplomatic', 'trade', 'threat', 'treaty'
  isRead: boolean("is_read").notNull().default(false),
  urgent: boolean("urgent").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Random events
export const worldEvents = pgTable("world_events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  eventType: text("event_type").notNull(), // 'weather', 'economic', 'military', 'magical'
  positionX: integer("position_x"),
  positionY: integer("position_y"),
  radius: integer("radius").notNull().default(1),
  effects: jsonb("effects").notNull().default('{}'),
  duration: integer("duration").notNull().default(24), // in hours
  isActive: boolean("is_active").notNull().default(true),
  startsAt: timestamp("starts_at").defaultNow(),
  endsAt: timestamp("ends_at"),
});

// Game Events table - Enhanced
export const gameEvents = pgTable("game_events", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => players.id).notNull(),
  type: text("type").notNull(), // 'conquest', 'trade', 'threat', 'quest_complete', 'combat', 'level_up'
  message: text("message").notNull(),
  icon: text("icon").notNull(),
  importance: text("importance").notNull().default("normal"), // 'low', 'normal', 'high', 'critical'
  relatedData: jsonb("related_data").notNull().default('{}'), // IDs of related quests, armies, etc.
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Kingdoms table - New feature for land claiming and governance
export const kingdoms = pgTable("kingdoms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  rulerId: integer("ruler_id").references(() => players.id).notNull(),
  color: text("color").notNull(), // for map overlay
  description: text("description").notNull(),
  foundedAt: timestamp("founded_at").defaultNow(),
  treasury: integer("treasury").notNull().default(0),
  influence: integer("influence").notNull().default(1),
  laws: jsonb("laws").notNull().default('{}'), // kingdom policies
  regions: jsonb("regions").notNull().default('[]'), // claimed tiles [{x,y}]
  castles: jsonb("castles").notNull().default('[]'), // castle locations [{x,y,level}]
});

// Kingdom membership and ranks
export const kingdomMemberships = pgTable("kingdom_memberships", {
  id: serial("id").primaryKey(),
  kingdomId: integer("kingdom_id").references(() => kingdoms.id).notNull(),
  playerId: integer("player_id").references(() => players.id).notNull(),
  rank: text("rank").notNull().default("Vassal"), // Ruler, Lord, Knight, Vassal
  joinedAt: timestamp("joined_at").defaultNow(),
  permissions: jsonb("permissions").notNull().default('[]'), // what they can do
  contribution: integer("contribution").notNull().default(0), // resources given
});

// Player-generated quests (bulletin board system)
export const playerGeneratedQuests = pgTable("player_generated_quests", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").references(() => players.id).notNull(),
  boardLocation: text("board_location").notNull(), // 'settlement:id', 'inn:id'
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirements: jsonb("requirements").notNull(), // {type:'gather', resourceId, amount} or {type:'escort', npcId}
  reward: jsonb("reward").notNull(), // {gold, items:[{itemId,qty}]}
  status: text("status").notNull().default("open"), // 'open', 'accepted', 'completed'
  acceptedBy: integer("accepted_by").references(() => players.id),
  acceptedAt: timestamp("accepted_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat system
export const chatChannels = pgTable("chat_channels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // 'global', 'settlement:1', 'inn:2', 'kingdom:1'
  type: text("type").notNull(), // 'global', 'settlement', 'inn', 'kingdom', 'private'
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  channelId: integer("channel_id").references(() => chatChannels.id).notNull(),
  playerId: integer("player_id").references(() => players.id).notNull(),
  message: text("message").notNull(),
  messageType: text("message_type").notNull().default("text"), // 'text', 'emote', 'system'
  createdAt: timestamp("created_at").defaultNow(),
});

// Entity system for map objects
export const entities = pgTable("entities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'army', 'camp', 'questGiver', 'resourceNode', 'settlement', 'inn'
  faction: text("faction"), // which faction owns this
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  name: text("name"),
  description: text("description"),
  data: jsonb("data").notNull().default('{}'), // type-specific data
  patrolPath: jsonb("patrol_path").notNull().default('[]'), // for AI armies
  questsOffered: jsonb("quests_offered").notNull().default('[]'), // quest IDs
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bulletin boards for settlements/inns
export const bulletinBoards = pgTable("bulletin_boards", {
  id: serial("id").primaryKey(),
  entityId: integer("entity_id").references(() => entities.id).notNull(),
  location: text("location").notNull(), // 'settlement:id' or 'inn:id'
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
});

// Resource nodes and economy
export const resourceNodes = pgTable("resource_nodes", {
  id: serial("id").primaryKey(),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  resourceType: text("resource_type").notNull(), // 'farm', 'mine', 'lumber', 'quarry'
  yield: integer("yield").notNull().default(100), // resources per harvest
  capacity: integer("capacity").notNull().default(1000), // max storage
  currentStock: integer("current_stock").notNull().default(0),
  ownerId: integer("owner_id").references(() => players.id),
  harvestCooldown: integer("harvest_cooldown").notNull().default(3600), // seconds
  lastHarvested: timestamp("last_harvested"),
  isActive: boolean("is_active").notNull().default(true),
});

// Dynamic world events and encounters
export const encounterTemplates = pgTable("encounter_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'bandit', 'merchant', 'monster', 'traveler'
  description: text("description").notNull(),
  probability: integer("probability").notNull().default(10), // 1-100
  terrain: text("terrain"), // which terrain this spawns on
  minLevel: integer("min_level").notNull().default(1),
  maxLevel: integer("max_level").notNull().default(10),
  rewards: jsonb("rewards").notNull().default('{}'),
  enemyData: jsonb("enemy_data").notNull().default('{}'),
});

// Guild system
export const guilds = pgTable("guilds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  type: text("type").notNull(), // 'mercenary', 'merchant', 'craftsman', 'religious'
  description: text("description").notNull(),
  leaderPlayerId: integer("leader_player_id").references(() => players.id),
  headquarters: text("headquarters"), // settlement where they're based
  reputation: integer("reputation").notNull().default(0),
  treasury: integer("treasury").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  foundedAt: timestamp("founded_at").defaultNow(),
});

export const guildMemberships = pgTable("guild_memberships", {
  id: serial("id").primaryKey(),
  guildId: integer("guild_id").references(() => guilds.id).notNull(),
  playerId: integer("player_id").references(() => players.id).notNull(),
  rank: text("rank").notNull().default("Member"), // Leader, Officer, Member, Recruit
  joinedAt: timestamp("joined_at").defaultNow(),
  contribution: integer("contribution").notNull().default(0),
});

// Trading system
export const tradeOrders = pgTable("trade_orders", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => players.id).notNull(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  quantity: integer("quantity").notNull(),
  pricePerUnit: integer("price_per_unit").notNull(),
  orderType: text("order_type").notNull(), // 'buy', 'sell'
  location: text("location").notNull(), // settlement where order is placed
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
  lastTurnTime: true,
});

export const insertCompanionSchema = createInsertSchema(companions).omit({
  id: true,
  createdAt: true,
});

export const insertTerritorySchema = createInsertSchema(territories).omit({
  id: true,
  createdAt: true,
});

export const insertArmySchema = createInsertSchema(armies).omit({
  id: true,
  createdAt: true,
});

export const insertCrusadeSchema = createInsertSchema(crusades).omit({
  id: true,
  startTime: true,
  endTime: true,
});

export const insertQuestSchema = createInsertSchema(quests).omit({
  id: true,
});

export const insertPlayerQuestSchema = createInsertSchema(playerQuests).omit({
  id: true,
  startTime: true,
  endTime: true,
});

export const insertGameEventSchema = createInsertSchema(gameEvents).omit({
  id: true,
  createdAt: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
});

export const insertFactionSchema = createInsertSchema(factions).omit({
  id: true,
});

export const insertCombatEncounterSchema = createInsertSchema(combatEncounters).omit({
  id: true,
  createdAt: true,
});

export const insertSettlementSchema = createInsertSchema(settlements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// New insert schemas for medieval features
export const insertKingdomSchema = createInsertSchema(kingdoms).omit({
  id: true,
  foundedAt: true,
});

export const insertKingdomMembershipSchema = createInsertSchema(kingdomMemberships).omit({
  id: true,
  joinedAt: true,
});

export const insertPlayerGeneratedQuestSchema = createInsertSchema(playerGeneratedQuests).omit({
  id: true,
  createdAt: true,
  acceptedAt: true,
  completedAt: true,
});

export const insertChatChannelSchema = createInsertSchema(chatChannels).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertEntitySchema = createInsertSchema(entities).omit({
  id: true,
  createdAt: true,
});

export const insertBulletinBoardSchema = createInsertSchema(bulletinBoards).omit({
  id: true,
});

export const insertResourceNodeSchema = createInsertSchema(resourceNodes).omit({
  id: true,
  lastHarvested: true,
});

export const insertEncounterTemplateSchema = createInsertSchema(encounterTemplates).omit({
  id: true,
});

export const insertGuildSchema = createInsertSchema(guilds).omit({
  id: true,
  foundedAt: true,
});

export const insertGuildMembershipSchema = createInsertSchema(guildMemberships).omit({
  id: true,
  joinedAt: true,
});

export const insertTradeOrderSchema = createInsertSchema(tradeOrders).omit({
  id: true,
  createdAt: true,
});

// Types
export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Companion = typeof companions.$inferSelect;
export type InsertCompanion = z.infer<typeof insertCompanionSchema>;
export type Territory = typeof territories.$inferSelect;
export type InsertTerritory = z.infer<typeof insertTerritorySchema>;
export type Army = typeof armies.$inferSelect;
export type InsertArmy = z.infer<typeof insertArmySchema>;
export type Crusade = typeof crusades.$inferSelect;
export type InsertCrusade = z.infer<typeof insertCrusadeSchema>;
export type Quest = typeof quests.$inferSelect;
export type InsertQuest = z.infer<typeof insertQuestSchema>;
export type PlayerQuest = typeof playerQuests.$inferSelect;
export type InsertPlayerQuest = z.infer<typeof insertPlayerQuestSchema>;
export type GameEvent = typeof gameEvents.$inferSelect;
export type InsertGameEvent = z.infer<typeof insertGameEventSchema>;
export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Faction = typeof factions.$inferSelect;
export type InsertFaction = z.infer<typeof insertFactionSchema>;
export type CombatEncounter = typeof combatEncounters.$inferSelect;
export type InsertCombatEncounter = z.infer<typeof insertCombatEncounterSchema>;
export type MapTile = typeof mapTiles.$inferSelect;
export type DiplomaticMessage = typeof diplomaticMessages.$inferSelect;
export type WorldEvent = typeof worldEvents.$inferSelect;
export type Settlement = typeof settlements.$inferSelect;
export type InsertSettlement = z.infer<typeof insertSettlementSchema>;

// Enhanced Game state type
export type GameState = {
  player: Player;
  companions: Companion[];
  territories: Territory[];
  armies: Army[];
  crusades: Crusade[];
  activeQuests: PlayerQuest[];
  availableQuests: Quest[];
  recentEvents: GameEvent[];
  inventory: (typeof playerInventory.$inferSelect & { item: Item })[];
  factions: Faction[];
  mapTiles: MapTile[];
  nearbyArmies: Army[];
  worldEvents: WorldEvent[];
  combatEncounter?: CombatEncounter;
};