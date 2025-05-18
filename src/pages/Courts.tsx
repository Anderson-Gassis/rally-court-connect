
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CourtTabContent from '@/components/CourtTabContent';
import PlayersTabContent from '@/components/PlayersTabContent';
import { courtsData } from '@/data/courtsData';

const Courts = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="courts" className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="courts" className="w-1/2">Encontrar Quadras</TabsTrigger>
              <TabsTrigger value="players" className="w-1/2">Encontrar Jogadores</TabsTrigger>
            </TabsList>
            
            <TabsContent value="courts">
              <CourtTabContent courts={courtsData} />
            </TabsContent>
            
            <TabsContent value="players">
              <PlayersTabContent />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Courts;
