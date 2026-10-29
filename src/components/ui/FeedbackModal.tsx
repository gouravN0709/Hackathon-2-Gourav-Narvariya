'use client';

import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Field';
import { StatusText } from '@/components/ui/Alert';
import { showToast } from '@/components/ui/Toast';
import { EMAIL_RE } from '@/lib/validation';
import { cn } from '@/lib/cn';
import { createClient } from '@/lib/supabase/client';
import { submitFeedback } from '@/lib/data/repos/feedback';

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

export interface FeedbackEntry {
  id: string;
  type: 'bug' | 'idea';
  message: string;
  email?: string;
  createdAt: string;
}

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const [type, setType] = useState<'bug' | 'idea'>('bug');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanMsg = message.trim();
    if (!cleanMsg) {
      setError('Please enter a description for your feedback.');
      return;
    }

    const cleanEmail = email.trim();
    if (cleanEmail && !EMAIL_RE.test(cleanEmail)) {
      setError('Enter a valid email address or leave it blank.');
      return;
    }

    void (async () => {
      try {
        const client = createClient();
        const { data } = await client.auth.getUser();
        const sent = await submitFeedback(client, data?.user?.id ?? null, {
          type,
          message: cleanMsg,
          email: cleanEmail || undefined,
        });
        if (!sent) throw new Error('insert failed');
      } catch (err) {
        console.warn('[FitAI] feedback submit failed:', err);
        showToast('Could not send feedback. Try again.', 'error');
        return;
      }

      showToast('Feedback submitted. Thank you for helping improve FitAI!', 'success');
      setMessage('');
      setEmail('');
      setError('');
      onClose();
    })();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Report a problem or request a feature"
      description="Help us make FitAI better. Share a bug report or an idea you'd like to see."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div>
          <Label>Feedback type</Label>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setType('bug');
                setError('');
              }}
              className={cn(
                'flex-1 h-10 rounded-full border text-[14px] font-semibold transition-colors duration-150',
                type === 'bug'
                  ? 'border-lime bg-lime-tint text-lime'
                  : 'border-line-active bg-transparent text-soft hover:bg-chip',
              )}
            >
              Bug report
            </button>
            <button
              type="button"
              onClick={() => {
                setType('idea');
                setError('');
              }}
              className={cn(
                'flex-1 h-10 rounded-full border text-[14px] font-semibold transition-colors duration-150',
                type === 'idea'
                  ? 'border-lime bg-lime-tint text-lime'
                  : 'border-line-active bg-transparent text-soft hover:bg-chip',
              )}
            >
              Feature request
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="feedback-message">
            {type === 'bug' ? 'What went wrong?' : 'What would you like to see?'}
          </Label>
          <textarea
            id="feedback-message"
            data-testid="feedback-message-input"
            rows={4}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setError('');
            }}
            placeholder={
              type === 'bug'
                ? 'Describe what happened and steps to reproduce...'
                : 'Describe your idea and why it would be helpful...'
            }
            className="mt-2 w-full rounded-[14px] border border-line-strong bg-sidebar px-4 py-3 text-[15px] text-fg outline-none transition-colors placeholder:text-placeholder focus:border-lime"
          />
        </div>

        <div>
          <Label htmlFor="feedback-email">Your email (optional)</Label>
          <input
            id="feedback-email"
            data-testid="feedback-email-input"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="name@example.com"
            className="mt-2 h-[48px] w-full rounded-[14px] border border-line-strong bg-sidebar px-4 text-[15px] text-fg outline-none transition-colors placeholder:text-placeholder focus:border-lime"
          />
          <p className="mt-1 text-[12px] text-muted">Leave your email if you want a follow-up.</p>
        </div>

        {error && <StatusText tone="error">{error}</StatusText>}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" data-testid="feedback-submit-button">
            Send feedback
          </Button>
        </div>
      </form>
    </Modal>
  );
}

