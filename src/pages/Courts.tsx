
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CourtTabContent from '@/components/CourtTabContent';
import PlayersTabContent from '@/components/PlayersTabContent';
import { courtsData } from '@/data/courtsData';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from '@/components/ui/button';
import { Info, Book, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Courts = () => {
  // State for the booking process step
  const [activeStep, setActiveStep] = useState<number>(1);
  
  // Steps for the booking process
  const bookingSteps = [
    { 
      id: 1, 
      title: "Find", 
      description: "Search for courts with advanced filters",
      icon: <MapPin className="h-8 w-8 text-tennis-blue" />
    },
    { 
      id: 2, 
      title: "Book", 
      description: "Select time and confirm with payment",
      icon: <Book className="h-8 w-8 text-tennis-blue" />
    },
    { 
      id: 3, 
      title: "Play", 
      description: "Present digital reservation at the court",
      icon: <Info className="h-8 w-8 text-tennis-blue" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Help Menu */}
        <div className="bg-gray-50 border-b py-3">
          <div className="container mx-auto px-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>How it works</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-3">
                      {bookingSteps.map((step) => (
                        <li key={step.id} className="p-3 border rounded-md">
                          <div className="flex flex-col items-center text-center">
                            <div className="mb-2">{step.icon}</div>
                            <div className="font-medium text-tennis-blue">{step.title}</div>
                            <p className="text-sm text-gray-500">{step.description}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/help">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Help Center
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/contact">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Contact Us
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

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

        {/* Registration Banner */}
        <div className="bg-tennis-blue py-12 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Growing Community of Players</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Connect with thousands of players, find courts, join tournaments, and track your progress.
              Register now and start playing today!
            </p>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-tennis-blue">
              Sign up for free
            </Button>
          </div>
        </div>

        {/* Booking Process Explanation */}
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">How Court Booking Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {bookingSteps.map((step, index) => (
              <div 
                key={step.id} 
                className={`p-6 rounded-lg border ${activeStep === step.id ? 'border-tennis-blue bg-blue-50' : ''} hover:border-tennis-blue transition-all cursor-pointer`}
                onClick={() => setActiveStep(step.id)}
              >
                <div className="flex items-center mb-4">
                  <div className="rounded-full bg-tennis-blue text-white h-10 w-10 flex items-center justify-center font-bold mr-3">
                    {step.id}
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                </div>
                <p className="text-gray-600">{step.description}</p>
                {index < bookingSteps.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Courts;
