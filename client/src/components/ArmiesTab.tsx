import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Swords, Users, Clock } from "lucide-react";
import type { GameState } from "@shared/schema";

interface ArmiesTabProps {
  gameState: GameState;
}

export default function ArmiesTab({ gameState }: ArmiesTabProps) {
  const { armies = [] } = gameState || {};

  const getStatusColor = (status: string) => {
    switch (status) {
      case "idle": return "bg-green-600";
      case "crusading": return "bg-red-600";
      case "moving": return "bg-yellow-600";
      case "defending": return "bg-blue-600";
      default: return "bg-gray-600";
    }
  };

  return (
    <div className="p-6 space-y-6 bg-medieval-dark min-h-full">
      <div className="flex justify-between items-center">
        <h1 className="font-medieval text-3xl text-medieval-gold">Armies</h1>
        <div className="flex space-x-2">
          <Badge variant="outline" className="text-medieval-gold border-medieval-gold">
            {armies.length} armies
          </Badge>
          <Button className="bg-medieval-crimson hover:bg-medieval-crimson/80">
            <Shield className="w-4 h-4 mr-2" />
            Recruit New Army
          </Button>
        </div>
      </div>

      {armies.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 mx-auto text-medieval-gold opacity-50 mb-4" />
          <h2 className="font-medieval text-2xl text-medieval-gold mb-2">No Armies</h2>
          <p className="text-medieval-beige opacity-75 mb-4">You haven't recruited any armies yet.</p>
          <Button className="bg-medieval-crimson hover:bg-medieval-crimson/80">
            Recruit Your First Army
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {armies.map((army) => (
            <Card key={army.id} className="bg-medieval-slate border-medieval-bronze/30">
              <CardHeader>
                <CardTitle className="text-medieval-gold flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    {army.name}
                  </div>
                  <Badge className={`${getStatusColor(army.status)} text-white capitalize`}>
                    {army.status}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-medieval-beige">
                  {army.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {army.totalStrength || 0}
                  </div>
                  <p className="text-xs text-medieval-beige opacity-75">Total Strength</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-medieval-beige">Heavy Infantry:</span>
                    <span className="text-white">{army.heavyInfantry || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-medieval-beige">Archers:</span>
                    <span className="text-white">{army.archers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-medieval-beige">Cavalry:</span>
                    <span className="text-white">{army.cavalry || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-medieval-beige">Siege:</span>
                    <span className="text-white">{army.siegeEngines || 0}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-medieval-beige">Upkeep:</span>
                  <span className="text-medieval-gold">{army.upkeepCost || 0} gold/turn</span>
                </div>

                <div className="space-y-2">
                  {army.status === "idle" ? (
                    <div className="space-y-2">
                      <Button size="sm" className="w-full bg-medieval-crimson hover:bg-medieval-crimson/80">
                        <Swords className="w-4 h-4 mr-2" />
                        Deploy to Crusade
                      </Button>
                      <Button size="sm" variant="outline" className="w-full border-medieval-bronze text-medieval-beige">
                        Manage Army
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2 text-medieval-beige">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Currently {army.status}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}