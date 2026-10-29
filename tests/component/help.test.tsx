import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InfoTip } from '@/components/ui/InfoTip';
import { HelpCenter } from '@/components/features/help/HelpCenter';
import { CoachmarkTour } from '@/components/features/help/CoachmarkTour';
import { startAppTour, TOUR_SEEN_KEY } from '@/components/features/help/useTour';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/help',
  useSearchParams: () => new URLSearchParams(),
}));

describe('InfoTip Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders button with accessible aria attributes', () => {
    render(<InfoTip topicId="calories-ring" />);
    const btn = screen.getByRole('button', { name: 'What is Calories?' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(btn).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('opens desktop popover on click and closes on escape key', async () => {
    const user = userEvent.setup();
    render(<InfoTip topicId="calories-ring" />);
    const btn = screen.getByRole('button', { name: 'What is Calories?' });

    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');

    // Popover content is rendered in a dialog
    const dialog = await screen.findByRole('dialog', { name: 'Calories' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/Energy from the food you log today/i)).toBeInTheDocument();

    // Press Escape to dismiss
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Calories' })).not.toBeInTheDocument();
    });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders dynamic live example when passed', async () => {
    const user = userEvent.setup();
    render(
      <InfoTip
        topicId="remaining-calories"
        example="You have 760 kcal left today"
      />,
    );
    const btn = screen.getByRole('button', { name: 'What is Remaining calories?' });
    await user.click(btn);

    expect(await screen.findByText(/You have 760 kcal left today/i)).toBeInTheDocument();
  });

  it('enforces singleton pattern (only one InfoTip open at a time)', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <InfoTip topicId="calories-ring" />
        <InfoTip topicId="protein-target" />
      </div>,
    );

    const btn1 = screen.getByRole('button', { name: 'What is Calories?' });
    const btn2 = screen.getByRole('button', { name: 'What is Protein?' });

    // Open first tip
    await user.click(btn1);
    expect(await screen.findByRole('dialog', { name: 'Calories' })).toBeInTheDocument();

    // Open second tip
    await user.click(btn2);
    expect(await screen.findByRole('dialog', { name: 'Protein' })).toBeInTheDocument();

    // First tip should now be closed
    expect(screen.queryByRole('dialog', { name: 'Calories' })).not.toBeInTheDocument();
  });
});

describe('HelpCenter Component', () => {
  it('renders page header, disclaimer, search input, and accordion sections', () => {
    render(<HelpCenter />);

    expect(screen.getByRole('heading', { level: 1, name: /Help & Guides/i })).toBeInTheDocument();
    expect(screen.getByText(/FitAI gives general fitness guidance, not medical advice/i)).toBeInTheDocument();
    expect(screen.getByTestId('help-search-input')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Take a quick tour/i })).toBeInTheDocument();

    // Check key sections exist
    expect(screen.getByText('Getting started')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Workouts')).toBeInTheDocument();
    expect(screen.getByText('Nutrition')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('AI Coach (Nova)')).toBeInTheDocument();
    expect(screen.getByText('Privacy and your data')).toBeInTheDocument();
  });

  it('filters topics dynamically when search query is typed', async () => {
    const user = userEvent.setup();
    render(<HelpCenter />);

    const searchInput = screen.getByTestId('help-search-input');
    await user.type(searchInput, 'overload');

    // Progressive overload topic should appear
    expect(await screen.findByText('Progressive overload')).toBeInTheDocument();
    expect(screen.getByText(/Gradually increasing the weight, reps, or volume/i)).toBeInTheDocument();
  });

  it('toggles accordion sections', async () => {
    const user = userEvent.setup();
    render(<HelpCenter />);

    const toggle = screen.getByTestId('help-section-toggle-workouts');
    expect(toggle).toBeInTheDocument();

    await user.click(toggle);
    // Workouts topics should be rendered
    expect(await screen.findByText('AI-generated plan')).toBeInTheDocument();
  });
});

describe('CoachmarkTour Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('walks through the 5 steps and marks tour seen in localStorage upon completion', async () => {
    const user = userEvent.setup();
    render(<CoachmarkTour />);

    // Start tour via event
    startAppTour();

    // Step 1: Dashboard summary cards
    expect(await screen.findByRole('dialog', { name: 'App guided tour' })).toBeInTheDocument();
    expect(screen.getByText('Dashboard summary cards')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();

    // Advance to Step 2
    const nextBtn = screen.getByTestId('tour-next-button');
    await user.click(nextBtn);
    expect(screen.getByText('Quick actions')).toBeInTheDocument();
    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();

    // Advance to Step 3
    await user.click(screen.getByTestId('tour-next-button'));
    expect(screen.getByText('Workouts & planner')).toBeInTheDocument();

    // Advance to Step 4
    await user.click(screen.getByTestId('tour-next-button'));
    expect(screen.getByText('Log food & nutrition')).toBeInTheDocument();

    // Advance to Step 5
    await user.click(screen.getByTestId('tour-next-button'));
    expect(screen.getByText('Ask Nova (AI coach)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Got it!' })).toBeInTheDocument();

    // Finish tour
    await user.click(screen.getByRole('button', { name: 'Got it!' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'App guided tour' })).not.toBeInTheDocument();
    });
    expect(localStorage.getItem(TOUR_SEEN_KEY)).toBe('true');
  });

  it('allows skipping the tour from step 1', async () => {
    const user = userEvent.setup();
    render(<CoachmarkTour />);

    startAppTour();
    expect(await screen.findByRole('dialog', { name: 'App guided tour' })).toBeInTheDocument();

    const skipBtn = screen.getByTestId('tour-skip-button');
    await user.click(skipBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'App guided tour' })).not.toBeInTheDocument();
    });
    expect(localStorage.getItem(TOUR_SEEN_KEY)).toBe('true');
  });
});

