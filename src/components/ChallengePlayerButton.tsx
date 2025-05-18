
import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Flag } from "lucide-react";

interface ChallengePlayerButtonProps {
  playerId: string;
}

const ChallengePlayerButton = ({ playerId }: ChallengePlayerButtonProps) => {
  const { toast } = useToast();
  
  const handleChallenge = () => {
    // In a real app, this would send a challenge request to the API
    toast({
      title: "Desafio enviado!",
      description: "O jogador será notificado sobre o seu desafio.",
      duration: 3000,
    });
    
    // You would likely store the challenge in a database and send notifications
    console.log(`Challenge sent to player ${playerId}`);
  };
  
  return (
    <Button 
      className="bg-tennis-blue hover:bg-tennis-blue-dark"
      onClick={handleChallenge}
    >
      <Flag className="mr-2 h-4 w-4" />
      Desafiar
    </Button>
  );
};

export default ChallengePlayerButton;
