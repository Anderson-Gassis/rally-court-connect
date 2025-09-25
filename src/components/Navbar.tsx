
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Activity } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path ? "text-tennis-blue font-medium" : "text-gray-600 hover:text-tennis-blue";
  };

  return (
    <nav className="sticky top-0 bg-white shadow-sm z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-tennis-blue" />
            <Link to="/" className="font-semibold text-xl text-gray-900">
              Kourtify.com
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className={isActive("/")}>Home</Link>
            <Link to="/courts" className={isActive("/courts")}>Quadras</Link>
            <Link to="/rankings" className={isActive("/rankings")}>Rankings</Link>
            <Link to="/tournaments" className={isActive("/tournaments")}>Torneios</Link>
            <Link to="/instructors" className={isActive("/instructors")}>Professores</Link>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="outline" className="border-tennis-blue text-tennis-blue hover:bg-tennis-blue hover:text-white">
              Entrar
            </Button>
            <Button className="bg-tennis-blue hover:bg-tennis-blue-dark text-white">
              Cadastrar
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pb-3 border-t border-gray-200">
            <div className="flex flex-col space-y-3 pt-3">
              <Link to="/" className="text-gray-600 hover:text-tennis-blue py-2" onClick={toggleMenu}>Home</Link>
              <Link to="/courts" className="text-gray-600 hover:text-tennis-blue py-2" onClick={toggleMenu}>Quadras</Link>
              <Link to="/rankings" className="text-gray-600 hover:text-tennis-blue py-2" onClick={toggleMenu}>Rankings</Link>
              <Link to="/tournaments" className="text-gray-600 hover:text-tennis-blue py-2" onClick={toggleMenu}>Torneios</Link>
              <Link to="/instructors" className="text-gray-600 hover:text-tennis-blue py-2" onClick={toggleMenu}>Professores</Link>
              <div className="flex flex-col space-y-2 pt-2">
                <Button variant="outline" className="border-tennis-blue text-tennis-blue hover:bg-tennis-blue hover:text-white w-full">
                  Entrar
                </Button>
                <Button className="bg-tennis-blue hover:bg-tennis-blue-dark text-white w-full">
                  Cadastrar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
