
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface PointAllocationFieldProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

const PointAllocationField = ({ 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  className = "" 
}: PointAllocationFieldProps) => {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDecrement}
        disabled={value <= min}
        className="bg-white/20 border-white/30 text-white hover:bg-white/30 disabled:opacity-50"
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
      <div className="bg-white/20 border border-white/30 rounded-md px-4 py-2 min-w-[60px] text-center text-white font-medium">
        {value}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleIncrement}
        disabled={value >= max}
        className="bg-white/20 border-white/30 text-white hover:bg-white/30 disabled:opacity-50"
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
      <div className="text-xs text-blue-200">
        {min}-{max}
      </div>
    </div>
  );
};

export default PointAllocationField;
