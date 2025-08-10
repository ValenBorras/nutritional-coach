"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { EmbeddedCheckout } from '@/app/components/embedded-checkout';
import { Button } from '@/app/components/ui/button';
import { X } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  priceId: string;
  planName: string;
  amount: number;
  currency: string;
  interval: string;
  trialDays?: number;
  onSuccess?: () => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  priceId,
  planName,
  amount,
  currency,
  interval,
  trialDays,
  onSuccess,
}: CheckoutModalProps) {
  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-marcellus text-charcoal">
              Checkout Seguro
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          <EmbeddedCheckout
            priceId={priceId}
            planName={planName}
            amount={amount}
            currency={currency}
            interval={interval}
            trialDays={trialDays}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 