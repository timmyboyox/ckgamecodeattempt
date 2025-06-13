import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Coins, Users, Wheat, Hammer } from "lucide-react";
import type { GameState } from "@shared/schema";

interface EconomyTabProps {
  gameState: GameState;
}

export default function EconomyTab({ gameState }: EconomyTabProps) {
  const { player, territories = [], armies = [] } = gameState || {};

  const totalIncome = territories.reduce((sum, t) => sum + (t.taxIncome || 0), 0);
  const totalUpkeep = armies.reduce((sum, a) => sum + (a.upkeepCost || 0), 0);
  const netIncome = totalIncome - totalUpkeep;
  const totalPopulation = territories.reduce((sum, t) => sum + (t.population || 0), 0);

  return (
    <div className="p-6 space-y-6 bg-medieval-dark min-h-full">
      <div className="flex justify-between items-center">
        <h1 className="font-medieval text-3xl text-medieval-gold">Economy</h1>
        <Badge variant="outline" className="text-medieval-gold border-medieval-gold">
          Turn {player?.turnNumber || 1}
        </Badge>
      </div>

      {/* Resource Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-medieval-slate border-medieval-bronze/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-medieval-beige">Gold</CardTitle>
            <Coins className="h-4 w-4 text-medieval-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{player?.gold?.toLocaleString() || 0}</div>
            <p className={`text-xs flex items-center ${netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {netIncome >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {netIncome >= 0 ? '+' : ''}{netIncome}/turn
            </p>
          </CardContent>
        </Card>

        <Card className="bg-medieval-slate border-medieval-bronze/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-medieval-beige">Food</CardTitle>
            <Wheat className="h-4 w-4 text-medieval-bronze" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{player?.food?.toLocaleString() || 0}</div>
            <p className="text-xs text-medieval-beige opacity-75">
              Stable
            </p>
          </CardContent>
        </Card>

        <Card className="bg-medieval-slate border-medieval-bronze/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-medieval-beige">Materials</CardTitle>
            <Hammer className="h-4 w-4 text-medieval-gray" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{player?.materials?.toLocaleString() || 0}</div>
            <p className="text-xs text-medieval-beige opacity-75">
              Stable
            </p>
          </CardContent>
        </Card>

        <Card className="bg-medieval-slate border-medieval-bronze/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-medieval-beige">Population</CardTitle>
            <Users className="h-4 w-4 text-medieval-beige" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalPopulation.toLocaleString()}</div>
            <p className="text-xs text-medieval-beige opacity-75">
              Across {territories.length} territories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Income Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-medieval-slate border-medieval-bronze/30">
          <CardHeader>
            <CardTitle className="text-medieval-gold">Income Sources</CardTitle>
            <CardDescription className="text-medieval-beige">
              Gold income per turn from territories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {territories.length > 0 ? (
              <div className="space-y-3">
                {territories.map((territory) => (
                  <div key={territory.id} className="flex justify-between items-center">
                    <span className="text-medieval-beige">{territory.name}</span>
                    <span className="text-medieval-gold">+{territory.taxIncome || 0}</span>
                  </div>
                ))}
                <div className="border-t border-medieval-bronze/30 pt-2 mt-2">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-white">Total Income</span>
                    <span className="text-medieval-gold">+{totalIncome}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-medieval-beige opacity-75 text-center py-4">No territories</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-medieval-slate border-medieval-bronze/30">
          <CardHeader>
            <CardTitle className="text-medieval-gold">Expenses</CardTitle>
            <CardDescription className="text-medieval-beige">
              Gold expenses per turn
            </CardDescription>
          </CardHeader>
          <CardContent>
            {armies.length > 0 ? (
              <div className="space-y-3">
                {armies.map((army) => (
                  <div key={army.id} className="flex justify-between items-center">
                    <span className="text-medieval-beige">{army.name}</span>
                    <span className="text-red-400">-{army.upkeepCost || 0}</span>
                  </div>
                ))}
                <div className="border-t border-medieval-bronze/30 pt-2 mt-2">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-white">Total Upkeep</span>
                    <span className="text-red-400">-{totalUpkeep}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-medieval-beige opacity-75 text-center py-4">No armies</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Net Income Summary */}
      <Card className="bg-medieval-slate border-medieval-bronze/30">
        <CardHeader>
          <CardTitle className="text-medieval-gold">Financial Summary</CardTitle>
          <CardDescription className="text-medieval-beige">
            Your realm's financial status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">+{totalIncome}</div>
              <p className="text-sm text-medieval-beige">Total Income</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">-{totalUpkeep}</div>
              <p className="text-sm text-medieval-beige">Total Expenses</p>
            </div>
            <div>
              <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {netIncome >= 0 ? '+' : ''}{netIncome}
              </div>
              <p className="text-sm text-medieval-beige">Net Income per Turn</p>
            </div>
          </div>

          {netIncome < 0 && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded">
              <p className="text-red-300 text-sm">
                ⚠️ Warning: Your realm is losing gold each turn. Consider reducing army sizes or expanding your territories.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}