
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Flag } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface ChallengePlayerButtonProps {
  playerId: string;
}

const ChallengePlayerButton = ({ playerId }: ChallengePlayerButtonProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [sportType, setSportType] = useState("tennis");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  
  const handleChallenge = () => {
    if (!date || !time) {
      toast({
        title: "Informações incompletas",
        description: "Por favor, selecione a data e o horário para o desafio.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    // In a real app, this would send a challenge request to the API
    toast({
      title: "Desafio enviado!",
      description: `O jogador será notificado sobre o seu desafio de ${getSportLabel(sportType)} para ${format(date, "dd/MM/yyyy")} às ${time}.`,
      duration: 3000,
    });
    
    // You would likely store the challenge in a database and send notifications
    console.log(`Challenge sent to player ${playerId} for ${sportType} on ${format(date, "yyyy-MM-dd")} at ${time}`);
    
    setOpen(false);
  };
  
  const getSportLabel = (sport: string) => {
    switch(sport) {
      case 'tennis': return 'Tênis';
      case 'beach-tennis': return 'Beach Tennis';
      case 'padel': return 'Padel';
      default: return sport;
    }
  };
  
  const getSportEmoji = (sport: string) => {
    switch(sport) {
      case 'tennis': return '🎾';
      case 'beach-tennis': return '🏖️';
      case 'padel': return '🏸';
      default: return '';
    }
  };
  
  return (
    <>
      <Button 
        className="bg-tennis-blue hover:bg-tennis-blue-dark"
        onClick={() => setOpen(true)}
      >
        <Flag className="mr-2 h-4 w-4" />
        Desafiar
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Desafiar Jogador</DialogTitle>
            <DialogDescription>
              Envie um desafio para jogar uma partida. Selecione o esporte, a data e o horário desejados.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="sport" className="text-sm font-medium">
                Esporte
              </label>
              <Select value={sportType} onValueChange={setSportType}>
                <SelectTrigger id="sport">
                  <SelectValue placeholder="Selecione um esporte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tennis">
                    {getSportEmoji('tennis')} Tênis
                  </SelectItem>
                  <SelectItem value="beach-tennis">
                    {getSportEmoji('beach-tennis')} Beach Tennis
                  </SelectItem>
                  <SelectItem value="padel">
                    {getSportEmoji('padel')} Padel
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="date" className="text-sm font-medium">
                Data
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="time" className="text-sm font-medium">
                Horário
              </label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger id="time">
                  <SelectValue placeholder="Selecione um horário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="08:00">08:00</SelectItem>
                  <SelectItem value="09:00">09:00</SelectItem>
                  <SelectItem value="10:00">10:00</SelectItem>
                  <SelectItem value="11:00">11:00</SelectItem>
                  <SelectItem value="14:00">14:00</SelectItem>
                  <SelectItem value="15:00">15:00</SelectItem>
                  <SelectItem value="16:00">16:00</SelectItem>
                  <SelectItem value="17:00">17:00</SelectItem>
                  <SelectItem value="18:00">18:00</SelectItem>
                  <SelectItem value="19:00">19:00</SelectItem>
                  <SelectItem value="20:00">20:00</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleChallenge}>Enviar Desafio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChallengePlayerButton;
