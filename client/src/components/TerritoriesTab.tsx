import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Castle, Users, Coins, Shield } from "lucide-react";
import type { GameState } from "@shared/schema";

interface TerritoriesTabProps {
  gameState: GameState;
}

export default function TerritoriesTab({ gameState }: TerritoriesTabProps) {
  const { territories = [] } = gameState || {};

  if (territories.length === 0) {
    return (
      <div className="p-6 bg-medieval-dark min-h-full">
        <div className="text-center py-12">
          <Castle className="w-16 h-16 mx-auto text-medieval-gold opacity-50 mb-4" />
          <h2 className="font-medieval text-2xl text-medieval-gold mb-2">No Territories</h2>
          <p className="text-medieval-beige opacity-75">You don't control any territories yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-medieval-dark min-h-full">
      <div className="flex justify-between items-center">
        <h1 className="font-medieval text-3xl text-medieval-gold">Territories</h1>
        <Badge variant="outline" className="text-medieval-gold border-medieval-gold">
          {territories.length} territories
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {territories.map((territory) => (
          <Card key={territory.id} className="bg-medieval-slate border-medieval-bronze/30">
            <CardHeader>
              <CardTitle className="text-medieval-gold flex items-center">
                <Castle className="w-5 h-5 mr-2" />
                {territory.name}
              </CardTitle>
              <CardDescription className="text-medieval-beige">
                <Badge variant="secondary" className="capitalize">
                  {territory.type}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-medieval-beige mr-2" />
                  <span className="text-white">{territory.population?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-medieval-bronze mr-2" />
                  <span className="text-white">{territory.garrison || 0}</span>
                </div>
                <div className="flex items-center">
                  <Coins className="w-4 h-4 text-medieval-gold mr-2" />
                  <span className="text-white">{territory.taxIncome || 0}/turn</span>
                </div>
                <div className="flex items-center">
                  <Castle className="w-4 h-4 text-medieval-gray mr-2" />
                  <span className="text-white">Fort Lv.{territory.fortificationLevel || 1}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-medieval-gold">Buildings</h4>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {territory.buildings && typeof territory.buildings === 'object' ? (
                    Object.entries(territory.buildings as Record<string, number>).map(([building, level]) => (
                      <div key={building} className="flex justify-between">
                        <span className="text-medieval-beige capitalize">{building}:</span>
                        <span className="text-white">Lv.{level}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-medieval-beige opacity-50 col-span-2">No buildings</span>
                  )}
                </div>
              </div>

              <Button 
                size="sm" 
                className="w-full bg-medieval-bronze hover:bg-medieval-bronze/80"
              >
                Manage Territory
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}