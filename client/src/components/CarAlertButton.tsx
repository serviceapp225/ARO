import { useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CarAlertButtonProps {
  make?: string;
  model?: string;
}

export default function CarAlertButton({ make, model }: CarAlertButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAlert, setHasAlert] = useState(false);

  const handleCreateAlert = () => {
    console.log(`Creating alert for ${make} ${model}`);
    setHasAlert(true);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={hasAlert ? "default" : "outline"}
          size="sm"
          className={`w-6 h-6 ${hasAlert ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-black/50 text-white hover:bg-black/70"}`}
        >
          {hasAlert ? <BellRing className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Уведомления о новых автомобилях</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Получайте уведомления о новых автомобилях марки <strong>{make}</strong>
            {model && <span> модели <strong>{model}</strong></span>}
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleCreateAlert} className="flex-1">
              {hasAlert ? "Уведомления включены" : "Включить уведомления"}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}