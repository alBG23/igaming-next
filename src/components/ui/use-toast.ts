'use client';

import { useState } from 'react';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

export function useToast() {
  const toast = ({ title, description }: ToastProps) => {
    if (typeof window !== 'undefined') {
      console.log(`[Toast] ${title ? title + ': ' : ''}${description || ''}`);
    }
  };

  return {
    toast,
    toasts: [],
    dismiss: () => {},
  };
}
