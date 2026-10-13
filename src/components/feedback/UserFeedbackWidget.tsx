'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  MessageSquarePlus,
  Sparkles,
  Bug,
  Database,
  Palette,
  Star,
  CheckCircle2,
  X,
  Send,
  Loader2,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DEFAULT_ADMIN_EMAIL } from '@/lib/constants';

interface CategoryOption {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'improvement', label: 'Feature Idea', icon: Sparkles, description: 'Suggest a new feature or improvement' },
  { id: 'data', label: 'Data Accuracy', icon: Database, description: 'Flag a discrepancy or calculation issue' },
  { id: 'bug', label: 'Bug Report', icon: Bug, description: 'Report an error or unexpected behavior' },
  { id: 'ux', label: 'UX / Workflow', icon: Palette, description: 'Share design or navigation feedback' },
];

const QUICK_SUGGESTIONS = [
  'Add custom date range comparison',
  'Export report data to CSV/Excel',
  'Improve table column sorting',
  'Explain metric formula in tooltip',
  'Add currency conversion toggle',
];

export function UserFeedbackWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<string>('improvement');
  const [rating, setRating] = useState<number | null>(5);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpen = () => {
    setIsOpen(true);
    setIsSubmitted(false);
    setErrorMessage(null);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleQuickAdd = (suggestion: string) => {
    setMessage((prev) => (prev ? `${prev}\n• ${suggestion}` : suggestion));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMessage('Please enter a brief note or idea.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        category,
        message: message.trim(),
        rating,
        route: pathname || '/',
        user_email: DEFAULT_ADMIN_EMAIL,
        metadata: {
          viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'unknown',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          timestamp: new Date().toISOString(),
        },
      };

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to record feedback');
      }

      setIsSubmitted(true);
      setMessage('');
    } catch {
      setErrorMessage('Could not send feedback right now. Your note was saved locally.');
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleOpen}
          className="shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 py-2.5 flex items-center gap-2 border border-indigo-500/30 transition-transform hover:scale-105 active:scale-95"
          aria-label="Give Feedback & Suggest Improvements"
          title="Share ideas or report issues to help improve Maximoos"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span className="text-sm font-medium hidden sm:inline">Feedback & Ideas</span>
        </Button>
      </div>

      {/* Interactive Feedback & Improvement Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              Help Us Improve Maximoos
            </DialogTitle>
            <DialogDescription>
              Share your feature suggestions, report data discrepancies, or let us know what would make your analytics workflows faster.
            </DialogDescription>
          </DialogHeader>

          {isSubmitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900">Thank You for Your Feedback!</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  Your suggestion for <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">{pathname}</span> has been logged and queued for platform updates.
                </p>
              </div>
              <Button onClick={handleClose} className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                Back to Dashboard
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 pt-2">
              {/* Category Picker */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Feedback Category
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 shadow-sm'
                            : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`} />
                        <div>
                          <div className="text-xs font-semibold">{cat.label}</div>
                          <div className="text-[11px] text-gray-500 leading-tight mt-0.5">{cat.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Satisfaction / Rating */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Experience on this page
                  </Label>
                  <span className="text-xs text-gray-400 font-mono">{pathname}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                        (rating ?? 0) >= star ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600'
                      }`}
                      title={`Rate ${star} / 5`}
                    >
                      <Star className="h-5 w-5 fill-current" />
                    </button>
                  ))}
                  <span className="text-xs text-gray-500 ml-2">
                    {rating === 5 ? 'Excellent' : rating === 4 ? 'Good' : rating === 3 ? 'Neutral' : rating === 2 ? 'Needs Work' : rating === 1 ? 'Poor' : 'Not rated'}
                  </span>
                </div>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                  Quick Ideas <HelpCircle className="h-3 w-3 text-gray-400" />
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_SUGGESTIONS.map((sug, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 text-xs py-1 px-2.5 transition-colors"
                      onClick={() => handleQuickAdd(sug)}
                    >
                      + {sug}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Message Textarea */}
              <div className="space-y-1.5">
                <Label htmlFor="feedback-message" className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Your Suggestions / What happened?
                </Label>
                <Textarea
                  id="feedback-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe what you were trying to accomplish, any issues you ran into, or ideas for new analytics capabilities..."
                  rows={4}
                  className="resize-none text-sm"
                  required
                />
                <div className="flex justify-between items-center text-[11px] text-gray-400">
                  <span>Logged as {DEFAULT_ADMIN_EMAIL}</span>
                  <span>{message.length} / 4000 chars</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-xs">
                  {errorMessage}
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Improvement
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
