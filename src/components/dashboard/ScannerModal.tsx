'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

interface ScannerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onScanSuccess: () => void;
}

export function ScannerModal({ isOpen, onOpenChange, onScanSuccess }: ScannerModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsScanning(true);
      setIsSuccess(false);
      
      // Start scanning timeout
      const timeout = setTimeout(() => {
        setIsScanning(false);
        setIsSuccess(true);
        
        // Call success callback after showing checkmark
        setTimeout(() => {
          onScanSuccess();
          onOpenChange(false);
        }, 500);
      }, 2000);

      return () => {
        clearTimeout(timeout);
      };
    } else {
      // Reset state when modal closes
      setIsScanning(false);
      setIsSuccess(false);
    }
  }, [isOpen, onScanSuccess, onOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 bg-black/95 border-none">
        <div className="relative w-full aspect-square flex items-center justify-center overflow-hidden">
          {/* Dark background */}
          <div className="absolute inset-0 bg-black" />
          
          {/* Viewfinder frame */}
          <div className="relative z-10 w-64 h-64 border-4 border-white rounded-lg">
            {/* Corner decorations */}
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-teal-400 rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-teal-400 rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-teal-400 rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-teal-400 rounded-br-lg" />
            
            {/* Scanning laser line */}
            {isScanning && (
              <div className="absolute inset-0 overflow-hidden rounded-lg">
                <div className="absolute left-0 right-0 h-0.5 bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)] animate-scan-line" />
              </div>
            )}
            
            {/* Success checkmark */}
            {isSuccess && (
              <div className="absolute inset-0 flex items-center justify-center bg-teal-500/20 rounded-lg animate-fade-in">
                <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center animate-scale-in">
                  <Check className="w-10 h-10 text-white" strokeWidth={3} />
                </div>
              </div>
            )}
          </div>
          
          {/* Instruction text */}
          {!isSuccess && (
            <div className="absolute bottom-8 left-0 right-0 text-center z-10">
              <p className="text-white text-sm font-medium">
                Align QR code within frame
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
