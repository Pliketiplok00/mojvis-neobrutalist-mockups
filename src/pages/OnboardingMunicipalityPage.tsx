import { MobileFrame } from "@/components/layout/MobileFrame";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, MapPin, Search, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const municipalities = [
  { id: "rijeka", name: "GRAD RIJEKA", region: "Primorsko-goranska", population: "128.624" },
  { id: "opatija", name: "GRAD OPATIJA", region: "Primorsko-goranska", population: "11.659" },
  { id: "kastav", name: "GRAD KASTAV", region: "Primorsko-goranska", population: "10.440" },
  { id: "crikvenica", name: "GRAD CRIKVENICA", region: "Primorsko-goranska", population: "10.800" },
  { id: "krk", name: "GRAD KRK", region: "Primorsko-goranska", population: "6.281" },
];

export default function OnboardingMunicipalityPage() {
  const navigate = useNavigate();
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMunicipalities = municipalities.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MobileFrame>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="p-6 neo-border-b">
          <button 
            onClick={() => navigate("/onboarding/mode")}
            className="flex items-center gap-2 font-display font-bold text-sm mb-4"
          >
            <ArrowLeft size={20} strokeWidth={3} />
            NATRAG
          </button>
          <h1 className="font-display font-bold text-3xl">ODABERI GRAD</h1>
          <p className="font-body text-muted-foreground mt-2">
            Koji grad želiš pratiti?
          </p>
        </div>

        {/* Search */}
        <div className="p-6 pb-0">
          <div className="relative">
            <Search size={20} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Pretraži gradove..."
              className="pl-12 neo-border-heavy font-body"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Municipality List */}
        <div className="flex-1 p-6 space-y-3 overflow-auto">
          {filteredMunicipalities.map((municipality) => {
            const isSelected = selectedMunicipality === municipality.id;
            
            return (
              <Card
                key={municipality.id}
                variant="flat"
                className={`neo-border-heavy neo-hover p-4 cursor-pointer transition-all ${
                  isSelected ? 'bg-primary neo-shadow' : ''
                }`}
                onClick={() => setSelectedMunicipality(municipality.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 neo-border-heavy flex items-center justify-center ${
                    isSelected ? 'bg-white' : 'bg-muted'
                  }`}>
                    <MapPin size={24} strokeWidth={2.5} className={isSelected ? 'text-primary' : 'text-muted-foreground'} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-display font-bold ${isSelected ? 'text-primary-foreground' : ''}`}>
                      {municipality.name}
                    </h3>
                    <p className={`font-body text-sm ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {municipality.region} • {municipality.population} stan.
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-8 h-8 bg-white neo-border flex items-center justify-center">
                      <Check size={20} strokeWidth={3} className="text-primary" />
                    </div>
                  )}
                </div>
              </Card>
            );
          })}

          {filteredMunicipalities.length === 0 && (
            <div className="text-center py-12">
              <MapPin size={48} strokeWidth={2} className="mx-auto text-muted-foreground mb-4" />
              <p className="font-display font-bold text-muted-foreground">NEMA REZULTATA</p>
              <p className="font-body text-sm text-muted-foreground mt-2">Pokušaj s drugim pojmom</p>
            </div>
          )}
        </div>

        {/* GPS Option */}
        <div className="px-6">
          <Button 
            variant="outline"
            className="w-full neo-border-heavy neo-hover font-display"
          >
            <MapPin size={18} strokeWidth={2.5} className="mr-2" />
            KORISTI GPS LOKACIJU
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 my-4">
          <div className="flex gap-2">
            <div className="flex-1 h-2 bg-foreground neo-border" />
            <div className="flex-1 h-2 bg-foreground neo-border" />
            <div className="flex-1 h-2 bg-foreground neo-border" />
          </div>
          <p className="font-body text-xs text-muted-foreground text-center mt-2">KORAK 3 OD 3</p>
        </div>

        {/* CTA */}
        <div className="p-6 bg-card neo-border-t">
          <Button 
            size="lg" 
            className="w-full bg-secondary text-secondary-foreground neo-border-heavy neo-shadow font-display text-lg py-6"
            onClick={() => navigate("/home")}
            disabled={!selectedMunicipality}
          >
            ZAVRŠI POSTAVLJANJE
            <ArrowRight size={24} strokeWidth={3} className="ml-3" />
          </Button>
        </div>
      </div>
    </MobileFrame>
  );
}
