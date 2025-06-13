import { storage } from "./storage";

export async function initializeGameData() {
  try {
    // Check if factions already exist
    const existingFactions = await storage.getFactions();
    if (existingFactions.length > 0) {
      console.log("Game data already initialized, skipping...");
      return;
    }

    // Initialize factions
    await storage.createFaction({
      name: "Kingdom of Valor",
      description: "The noble kingdom that values honor and justice above all.",
      capitalX: 15,
      capitalY: 15,
      color: "#3B82F6",
      power: 150,
      wealth: 5000,
      relations: {}
    });

    await storage.createFaction({
      name: "Bandit Clan",
      description: "Ruthless outlaws who prey on travelers and merchants.",
      capitalX: 25,
      capitalY: 10,
      color: "#DC2626",
      power: 80,
      wealth: 2000,
      relations: {}
    });

    await storage.createFaction({
      name: "Dragon Cult",
      description: "Mysterious cultists who worship ancient dragons.",
      capitalX: 5,
      capitalY: 25,
      color: "#7C3AED",
      power: 120,
      wealth: 3000,
      relations: {}
    });

    // Initialize items
    const ironSword = await storage.createItem({
      name: "Iron Sword",
      type: "weapon",
      rarity: "common",
      description: "A reliable iron sword, well-balanced for combat.",
      value: 100,
      effects: { attack: 5 },
      requirements: { level: 1 }
    });

    const steelArmor = await storage.createItem({
      name: "Steel Armor",
      type: "armor",
      rarity: "uncommon",
      description: "Sturdy steel armor that provides excellent protection.",
      value: 300,
      effects: { defense: 8 },
      requirements: { level: 3 }
    });

    const healingPotion = await storage.createItem({
      name: "Healing Potion",
      type: "consumable",
      rarity: "common",
      description: "A magical potion that restores health when consumed.",
      value: 50,
      effects: { heal: 25 },
      requirements: {},
      isStackable: true,
      maxStack: 10
    });

    console.log("Game data initialized successfully");
  } catch (error) {
    console.error("Failed to initialize game data:", error);
  }
}