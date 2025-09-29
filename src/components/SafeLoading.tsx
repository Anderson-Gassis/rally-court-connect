import React from 'react';
import { Loader2 } from 'lucide-react';

interface SafeLoadingProps {
  message?: string;
  className?: string;
}

const SafeLoading: React.FC<SafeLoadingProps> = ({ 
  message = 'Carregando...', 
  className = '' 
}) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4">
        <Loader2 className="h-8 w-8 opacity-0" />
      </div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
};

export default SafeLoading;