
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Activity, User, LogOut } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import LoginModal from './LoginModal';
import NotificationsDropdown from './NotificationsDropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  
  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
    setIsMenuOpen(false);
  };

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
            {isAuthenticated && (
              <Link to="/add-court" className={isActive("/add-court")}>Cadastrar Quadra</Link>
            )}
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <NotificationsDropdown />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{user?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <Link to={user?.role === 'partner' ? '/partner/dashboard' : user?.role === 'instructor' ? '/instructor/dashboard' : '/player/dashboard'}>
                        {user?.role === 'partner' ? 'Dashboard Parceiro' : 'Minha Área'}
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === 'partner' && (
                      <DropdownMenuItem asChild>
                        <Link to="/add-court">Cadastrar Quadra</Link>
                      </DropdownMenuItem>
                    )}
                    {user?.role === 'instructor' && (
                      <DropdownMenuItem asChild>
                        <Link to="/instructor/dashboard">Minhas Reservas</Link>
                      </DropdownMenuItem>
                    )}
                    {(!user?.role || user?.role === 'player') && (
                      <DropdownMenuItem asChild>
                        <Link to="/player/bookings">Minhas Reservas</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="border-tennis-blue text-tennis-blue hover:bg-tennis-blue hover:text-white"
                  onClick={handleLoginClick}
                >
                  Entrar
                </Button>
                <Button 
                  className="bg-tennis-blue hover:bg-tennis-blue-dark text-white"
                  onClick={handleLoginClick}
                >
                  Cadastrar
                </Button>
              </>
            )}
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
              {isAuthenticated && (
                <Link to="/add-court" className="text-gray-600 hover:text-tennis-blue py-2" onClick={toggleMenu}>Cadastrar Quadra</Link>
              )}
              <div className="flex flex-col space-y-2 pt-2">
                {isAuthenticated ? (
                  <>
                    <Link to={user?.role === 'partner' ? '/partner/dashboard' : user?.role === 'instructor' ? '/instructor/dashboard' : '/player/dashboard'} onClick={toggleMenu}>
                      <Button variant="outline" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        {user?.role === 'partner' ? 'Dashboard Parceiro' : 'Minha Área'}
                      </Button>
                    </Link>
                    {user?.role === 'instructor' && (
                      <Link to="/instructor/dashboard" onClick={toggleMenu}>
                        <Button variant="outline" className="w-full justify-start">
                          Minhas Reservas
                        </Button>
                      </Link>
                    )}
                    {(!user?.role || user?.role === 'player') && (
                      <Link to="/player/bookings" onClick={toggleMenu}>
                        <Button variant="outline" className="w-full justify-start">
                          Minhas Reservas
                        </Button>
                      </Link>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-red-600 hover:text-red-700"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="border-tennis-blue text-tennis-blue hover:bg-tennis-blue hover:text-white w-full"
                      onClick={handleLoginClick}
                    >
                      Entrar
                    </Button>
                    <Button 
                      className="bg-tennis-blue hover:bg-tennis-blue-dark text-white w-full"
                      onClick={handleLoginClick}
                    >
                      Cadastrar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;
