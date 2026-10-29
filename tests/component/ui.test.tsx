import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';
import { Field, Label } from '@/components/ui/Field';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Ring } from '@/components/ui/Ring';
import { ToastContainer, showToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';

describe('UI Components', () => {
  describe('Button', () => {
    it('renders with label and fires onClick', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      const btn = screen.getByRole('button', { name: 'Click me' });
      expect(btn).toBeInTheDocument();
      await user.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('disables button when disabled prop is passed', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);
      const btn = screen.getByRole('button', { name: 'Disabled' });
      expect(btn).toBeDisabled();
      await user.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Field & Label', () => {
    it('associates label with field and displays value', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <div>
          <Label htmlFor="test-input">Test Field</Label>
          <Field id="test-input" placeholder="Enter text" onChange={handleChange} />
        </div>,
      );
      const input = screen.getByLabelText('Test Field');
      expect(input).toBeInTheDocument();
      await user.type(input, 'hello');
      expect(handleChange).toHaveBeenCalled();
    });

    it('applies invalid styles when invalid=true', () => {
      render(<Field aria-label="Invalid input" invalid />);
      const input = screen.getByLabelText('Invalid input');
      expect(input.className).toContain('border-danger-line');
    });
  });

  describe('SegmentedControl', () => {
    it('renders options and selects correctly', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <SegmentedControl
          label="Test Options"
          value="a"
          onChange={handleChange}
          options={[
            { value: 'a', label: 'Option A' },
            { value: 'b', label: 'Option B' },
          ]}
        />,
      );
      const optB = screen.getByRole('button', { name: 'Option B' });
      await user.click(optB);
      expect(handleChange).toHaveBeenCalledWith('b');
    });
  });

  describe('ProgressBar and Ring', () => {
    it('renders ProgressBar with accessible attributes', () => {
      render(<ProgressBar value={70} label="Protein target" />);
      const bar = screen.getByRole('img', { name: 'Protein target' });
      expect(bar).toBeInTheDocument();
      expect(bar).toHaveAttribute('aria-label', 'Protein target');
    });

    it('renders Ring with accessible attributes', () => {
      render(
        <Ring size={80} radius={30} stroke={6} value={68} label="Calories target">
          <span>68%</span>
        </Ring>,
      );
      const ring = screen.getByRole('img', { name: 'Calories target' });
      expect(ring).toBeInTheDocument();
      expect(ring).toHaveAttribute('aria-label', 'Calories target');
      expect(screen.getByText('68%')).toBeInTheDocument();
    });
  });

  describe('Toast with Undo', () => {
    it('renders toast notification and executes undo callback', async () => {
      const user = userEvent.setup();
      const handleUndo = vi.fn();
      render(<ToastContainer />);

      showToast('Item deleted', 'info', { onUndo: handleUndo, undoLabel: 'Undo' });

      const toast = await screen.findByRole('status');
      expect(toast).toHaveTextContent('Item deleted');

      const undoBtn = screen.getByRole('button', { name: 'Undo' });
      await user.click(undoBtn);
      expect(handleUndo).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal', () => {
    it('renders modal with title and trap elements', () => {
      const handleClose = vi.fn();
      render(
        <Modal open={true} onClose={handleClose} title="Test Modal" description="Modal description">
          <button>Inner button</button>
        </Modal>,
      );
      expect(screen.getByRole('dialog', { name: 'Test Modal' })).toBeInTheDocument();
      expect(screen.getByText('Modal description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Inner button' })).toBeInTheDocument();
    });

    it('calls onClose when close button clicked', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(
        <Modal open={true} onClose={handleClose} title="Test Modal">
          <p>Content</p>
        </Modal>,
      );
      const closeBtn = screen.getByRole('button', { name: 'Close dialog' });
      await user.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
