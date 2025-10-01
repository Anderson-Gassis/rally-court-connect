import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface PackageOption {
  quantity: number;
  discount: number;
  label: string;
  description: string;
}

interface BookingPackageSelectorProps {
  selectedQuantity: number;
  onSelectQuantity: (quantity: number) => void;
  pricePerHour: number;
  totalHours: number;
}

const PACKAGE_OPTIONS: PackageOption[] = [
  {
    quantity: 1,
    discount: 0,
    label: "1 Sessão",
    description: "Sem desconto"
  },
  {
    quantity: 2,
    discount: 7,
    label: "2 Sessões",
    description: "7% de desconto"
  },
  {
    quantity: 3,
    discount: 13,
    label: "3+ Sessões",
    description: "13% de desconto"
  }
];

const BookingPackageSelector = ({
  selectedQuantity,
  onSelectQuantity,
  pricePerHour,
  totalHours
}: BookingPackageSelectorProps) => {
  const calculatePrice = (quantity: number, discount: number) => {
    const basePrice = pricePerHour * totalHours * quantity;
    const discountAmount = basePrice * (discount / 100);
    return basePrice - discountAmount;
  };

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm">Escolha seu pacote:</h4>
      <div className="grid grid-cols-1 gap-2">
        {PACKAGE_OPTIONS.map((option) => {
          const totalPrice = calculatePrice(option.quantity, option.discount);
          const isSelected = selectedQuantity === option.quantity;
          
          return (
            <Card
              key={option.quantity}
              className={`p-3 cursor-pointer transition-all hover:border-primary ${
                isSelected ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => onSelectQuantity(option.quantity)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{option.label}</span>
                    {option.discount > 0 && (
                      <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                        -{option.discount}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                  <p className="text-sm font-semibold text-primary mt-1">
                    R$ {totalPrice.toFixed(2)}
                    {option.discount > 0 && (
                      <span className="text-xs text-muted-foreground line-through ml-2">
                        R$ {(pricePerHour * totalHours * option.quantity).toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>
                {isSelected && (
                  <div className="ml-2">
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default BookingPackageSelector;
