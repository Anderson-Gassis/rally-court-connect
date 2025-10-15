import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Building2,
  Calendar,
  User,
  Trophy,
  Star,
  Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const RoleBasedNavigation = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  // Admin users get all navigation options
  const isAdmin = user.isAdmin || false;
  const isPartner = user.isPartner || user.role === 'partner';
  const isPlayer = user.isPlayer || user.role === 'player';
  const isInstructor = user.isInstructor || user.role === 'instructor';

  return (
    <div className="flex items-center space-x-2">
      {(isPartner || isAdmin) && (
        <>
          <Button asChild variant="outline" size="sm">
            <Link to="/partner/dashboard">
              <Building2 className="h-4 w-4 mr-1" />
              Dashboard Parceiro
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/add-court">
              <Plus className="h-4 w-4 mr-1" />
              Nova Quadra
            </Link>
          </Button>
        </>
      )}
      
      {(isInstructor || isAdmin) && (
        <>
          <Button asChild variant="outline" size="sm">
            <Link to="/instructor/dashboard">
              <Trophy className="h-4 w-4 mr-1" />
              Dashboard Professor
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/instructor/profile">
              <User className="h-4 w-4 mr-1" />
              Perfil Professor
            </Link>
          </Button>
        </>
      )}
      
      {(isPlayer || isAdmin) && (
        <>
          <Button asChild variant="outline" size="sm">
            <Link to="/player/dashboard">
              <User className="h-4 w-4 mr-1" />
              Minha Área
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/courts">
              <Calendar className="h-4 w-4 mr-1" />
              Reservar
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/instructors">
              <Star className="h-4 w-4 mr-1" />
              Professores
            </Link>
          </Button>
        </>
      )}
    </div>
  );
};

export default RoleBasedNavigation;