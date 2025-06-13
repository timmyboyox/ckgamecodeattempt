import type { GameState, Army, Territory, Crusade, Player } from "@shared/schema";

export interface GameStats {
  totalTerritories: number;
  totalArmyStrength: number;
  activeCrusades: number;
  kingdomRank: number;
  economicEfficiency: number;
  totalIncome: number;
  totalUpkeep: number;
  netIncome: number;
}

export function calculateGameStats(gameState: GameState): GameStats {
  const { player, territories, armies, crusades } = gameState;

  const totalTerritories = territories.length;
  const totalArmyStrength = armies.reduce((sum, army) => sum + army.totalStrength, 0);
  const activeCrusades = crusades.filter(c => c.status === "active").length;
  
  // Mock ranking calculation (in a real game, this would compare with other players)
  const kingdomRank = Math.max(1, Math.floor(Math.random() * 20) + 1);
  
  const totalIncome = territories.reduce((sum, t) => sum + t.taxIncome, 0);
  const totalUpkeep = armies.reduce((sum, a) => sum + a.upkeepCost, 0);
  const netIncome = totalIncome - totalUpkeep;
  
  const economicEfficiency = totalIncome > 0 ? Math.min(100, (netIncome / totalIncome) * 100) : 0;

  return {
    totalTerritories,
    totalArmyStrength,
    activeCrusades,
    kingdomRank,
    economicEfficiency,
    totalIncome,
    totalUpkeep,
    netIncome,
  };
}

export function calculateArmyCost(
  heavyInfantry: number,
  archers: number,
  cavalry: number,
  siegeEngines: number
) {
  const unitCosts = {
    heavyInfantry: 45,
    archers: 35,
    cavalry: 85,
    siegeEngines: 200,
  };

  const totalCost = 
    (heavyInfantry * unitCosts.heavyInfantry) +
    (archers * unitCosts.archers) +
    (cavalry * unitCosts.cavalry) +
    (siegeEngines * unitCosts.siegeEngines);

  return totalCost;
}

export function calculateArmyStrength(
  heavyInfantry: number,
  archers: number,
  cavalry: number,
  siegeEngines: number
) {
  const unitStrength = {
    heavyInfantry: 5,
    archers: 3,
    cavalry: 8,
    siegeEngines: 20,
  };

  const totalStrength = 
    (heavyInfantry * unitStrength.heavyInfantry) +
    (archers * unitStrength.archers) +
    (cavalry * unitStrength.cavalry) +
    (siegeEngines * unitStrength.siegeEngines);

  return totalStrength;
}

export function calculateArmyUpkeep(
  heavyInfantry: number,
  archers: number,
  cavalry: number,
  siegeEngines: number
) {
  const unitUpkeep = {
    heavyInfantry: 2,
    archers: 1.5,
    cavalry: 4,
    siegeEngines: 8,
  };

  const totalUpkeep = 
    (heavyInfantry * unitUpkeep.heavyInfantry) +
    (archers * unitUpkeep.archers) +
    (cavalry * unitUpkeep.cavalry) +
    (siegeEngines * unitUpkeep.siegeEngines);

  return totalUpkeep;
}

export function calculateBuildingUpgradeCost(
  buildingType: string,
  currentLevel: number
): number {
  const baseCost = 500;
  return (currentLevel + 1) * baseCost;
}

export function calculateTerritoryEfficiency(territory: Territory): number {
  const populationFactor = territory.population * 0.1;
  const buildings = territory.buildings as Record<string, number>;
  const buildingBonus = Object.values(buildings).reduce((sum, level) => sum + level * 10, 0);
  
  const maxPossibleIncome = populationFactor + buildingBonus;
  const efficiency = maxPossibleIncome > 0 ? (territory.taxIncome / maxPossibleIncome) * 100 : 0;
  
  return Math.min(100, Math.max(0, efficiency));
}

export function formatTimeRemaining(endTime: string | Date | null): string {
  if (!endTime) return "Unknown";
  
  const now = Date.now();
  const end = new Date(endTime).getTime();
  const remaining = Math.max(0, end - now);
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  if (days > 0) {
    return `${days}d ${remainingHours}h`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return "< 1h";
  }
}

export function formatNumber(num: number): string {
  return num.toLocaleString();
}

export function getArmyStatusColor(status: string): string {
  switch (status) {
    case "idle":
      return "text-green-500";
    case "crusading":
      return "text-red-500";
    case "moving":
      return "text-blue-500";
    case "defending":
      return "text-yellow-500";
    default:
      return "text-gray-500";
  }
}

export function getCrusadeStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "text-orange-500";
    case "completed":
      return "text-green-500";
    case "failed":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
}

export function getQuestDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "easy":
      return "text-green-500";
    case "medium":
      return "text-yellow-500";
    case "hard":
      return "text-orange-500";
    case "legendary":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
}

export function canAfford(playerGold: number, cost: number): boolean {
  return playerGold >= cost;
}

export function hasRequiredTroops(army: Army, requiredTroops: number): boolean {
  return army.totalStrength >= requiredTroops;
}

export function isArmyAvailable(army: Army): boolean {
  return army.status === "idle";
}

export function calculateResourceProduction(territories: Territory[]): {
  goldProduction: number;
  foodProduction: number;
  materialProduction: number;
} {
  let goldProduction = 0;
  let foodProduction = 0;
  let materialProduction = 0;

  territories.forEach(territory => {
    const buildings = territory.buildings as Record<string, number>;
    const marketLevel = buildings.market || 0;
    const barracksLevel = buildings.barracks || 0;
    
    goldProduction += territory.taxIncome;
    foodProduction += (territory.population * 0.1) + (marketLevel * 50);
    materialProduction += (territory.population * 0.05) + (barracksLevel * 25);
  });

  return {
    goldProduction: Math.floor(goldProduction),
    foodProduction: Math.floor(foodProduction),
    materialProduction: Math.floor(materialProduction),
  };
}

export function simulateCombat(
  attackerStrength: number,
  defenderStrength: number
): { attackerWins: boolean; attackerLosses: number; defenderLosses: number } {
  // Simple combat simulation
  const attackerAdvantage = attackerStrength / (attackerStrength + defenderStrength);
  const random = Math.random();
  
  const attackerWins = random < attackerAdvantage;
  
  // Calculate losses (simplified)
  const totalStrength = attackerStrength + defenderStrength;
  const baseLossRate = 0.1 + (Math.random() * 0.2); // 10-30% losses
  
  const attackerLosses = Math.floor(attackerStrength * baseLossRate);
  const defenderLosses = Math.floor(defenderStrength * baseLossRate);
  
  return {
    attackerWins,
    attackerLosses,
    defenderLosses,
  };
}
