import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Users, MessageCircle, Crown } from "lucide-react";
import type { GameState } from "@shared/schema";

interface DiplomacyTabProps {
  gameState: GameState;
}

export default function DiplomacyTab({ gameState }: DiplomacyTabProps) {
  return (
    <div className="p-6 space-y-6 bg-medieval-dark min-h-full">
      <div className="flex justify-between items-center">
        <h1 className="font-medieval text-3xl text-medieval-gold">Diplomacy</h1>
      </div>

      {/* Coming Soon Placeholder */}
      <div className="text-center py-12">
        <Globe className="w-16 h-16 mx-auto text-medieval-gold opacity-50 mb-4" />
        <h2 className="font-medieval text-2xl text-medieval-gold mb-2">Diplomacy System</h2>
        <p className="text-medieval-beige opacity-75 mb-6 max-w-md mx-auto">
          Forge alliances, declare wars, and negotiate treaties with other kingdoms. 
          The diplomacy system is coming soon!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <Card className="bg-medieval-slate/50 border-medieval-bronze/20">
            <CardHeader className="text-center">
              <Crown className="w-8 h-8 mx-auto text-medieval-gold mb-2" />
              <CardTitle className="text-medieval-gold">Royal Courts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-medieval-beige text-sm">
                Interact with other noble houses and establish diplomatic relations.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-medieval-slate/50 border-medieval-bronze/20">
            <CardHeader className="text-center">
              <MessageCircle className="w-8 h-8 mx-auto text-medieval-gold mb-2" />
              <CardTitle className="text-medieval-gold">Treaties</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-medieval-beige text-sm">
                Negotiate trade agreements, non-aggression pacts, and military alliances.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-medieval-slate/50 border-medieval-bronze/20">
            <CardHeader className="text-center">
              <Users className="w-8 h-8 mx-auto text-medieval-gold mb-2" />
              <CardTitle className="text-medieval-gold">Alliances</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-medieval-beige text-sm">
                Form powerful alliances to protect your realm and expand your influence.
              </p>
            </CardContent>
          </Card>
        </div>

        <Button className="mt-6 bg-medieval-bronze hover:bg-medieval-bronze/80" disabled>
          Coming Soon
        </Button>
      </div>
    </div>
  );
}