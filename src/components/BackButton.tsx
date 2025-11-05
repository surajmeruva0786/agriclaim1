import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from './ui/button';

interface BackButtonProps {
  showHome?: boolean;
  className?: string;
}

export default function BackButton({ showHome = true, className = '' }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(-1)}
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>
      {showHome && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <Home className="w-4 h-4" />
          Home
        </Button>
      )}
    </div>
  );
}
