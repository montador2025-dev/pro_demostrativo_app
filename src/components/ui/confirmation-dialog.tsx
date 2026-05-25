import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './dialog';
import { Button } from './button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'primary' | 'warning';
}

export function ConfirmationDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'destructive'
}: ConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-stone-200 rounded-3xl max-w-sm shadow-xl">
        <DialogHeader>
          <DialogTitle className={`font-extrabold uppercase italic flex items-center gap-2 ${variant === 'destructive' ? 'text-rose-600' : 'text-stone-900'}`}>
            <AlertTriangle className={`w-5 h-5 ${variant === 'destructive' ? 'text-rose-600' : 'text-amber-500'}`} />
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-500 mt-2 block">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-5 gap-2 flex flex-row justify-end">
          <Button 
            type="button" 
            variant="ghost" 
            className="h-10 text-xs text-stone-500" 
            onClick={() => onOpenChange(false)}
          >
            {cancelText}
          </Button>
          <Button 
            type="button" 
            variant={variant === 'destructive' ? 'destructive' : 'default'} 
            className={`h-10 rounded-xl font-extrabold text-xs uppercase px-4 transition-all active:scale-95 shadow-xs ${variant === 'destructive' ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-amber-700 hover:bg-amber-800 text-white'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
