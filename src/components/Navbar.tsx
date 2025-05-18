
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X, Activity } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 bg-white shadow-sm z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-tennis-blue" />
            <Link to="/" className="font-semibold text-xl text-gray-900">
              CourtConnect
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-tennis-blue">Home</Link>
            <Link to="/courts" className="text-gray-600 hover:text-tennis-blue">Find Courts</Link>
            <Link to="/about" className="text-gray-600 hover:text-tennis-blue">About</Link>
            <Link to="/contact" className="text-gray-600 hover:text-tennis-blue">Contact</Link>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="outline" className="border-tennis-blue text-tennis-blue hover:bg-tennis-blue hover:text-white">
              Sign In
            </Button>
            <Button className="bg-tennis-blue hover:bg-tennis-blue-dark text-white">
              Sign Up
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
              <Link to="/courts" className="text-gray-600 hover:text-tennis-blue py-2" onClick={toggleMenu}>Find Courts</Link>
              <Link to="/about" className="text-gray-600 hover:text-tennis-blue py-2" onClick={toggleMenu}>About</Link>
              <Link to="/contact" className="text-gray-600 hover:text-tennis-blue py-2" onClick={toggleMenu}>Contact</Link>
              <div className="flex flex-col space-y-2 pt-2">
                <Button variant="outline" className="border-tennis-blue text-tennis-blue hover:bg-tennis-blue hover:text-white w-full">
                  Sign In
                </Button>
                <Button className="bg-tennis-blue hover:bg-tennis-blue-dark text-white w-full">
                  Sign Up
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
