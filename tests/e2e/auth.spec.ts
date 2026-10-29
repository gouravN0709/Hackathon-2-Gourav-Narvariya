import { test, expect } from './fixtures';

test.describe('Auth: Login / Sign up (AUTH)', () => {
  test('AUTH-01 (P0) Load / signed out redirects to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });

  test('AUTH-02 (P0) Log in with valid email + 8+ char password', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('alex.morgan@email.com');
    await page.getByLabel('Password').fill('password123');

    const submitBtn = page.getByTestId('auth-submit');
    await submitBtn.click();

    await expect(page.getByText('Logging in…')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Welcome back, Alex!/i })).toBeVisible({ timeout: 5000 });

    const dashLink = page.getByRole('link', { name: 'Go to dashboard' });
    await expect(dashLink).toBeVisible();
    await dashLink.click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('AUTH-03 (P0) Sign up with name, email, password, terms checked', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('group', { name: 'Log in or sign up' }).getByRole('button', { name: 'Sign up' }).click();

    await page.getByLabel('Full name').fill('Taylor Swift');
    await page.getByLabel('Email').fill('taylor@example.com');
    await page.getByLabel('Password').fill('supersecret');
    await page.getByRole('checkbox').check();

    await page.getByTestId('auth-submit').click();

    await expect(page.getByRole('heading', { name: 'Account created' })).toBeVisible({ timeout: 5000 });
    const profileLink = page.getByRole('link', { name: 'Set up my profile' });
    await expect(profileLink).toBeVisible();
    await profileLink.click();
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test('AUTH-04 (P1) Validation messages exactly as spec', async ({ page }) => {
    await page.goto('/login');

    // Invalid email on login
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Password').fill('password123');
    await page.getByTestId('auth-submit').click();
    await expect(page.getByText('Enter a valid email address.')).toBeVisible();

    // Short password on login
    await page.getByLabel('Email').fill('valid@example.com');
    await page.getByLabel('Password').fill('short');
    await page.getByTestId('auth-submit').click();
    await expect(page.getByText('Enter your password (8 or more characters).')).toBeVisible();

    // Switch to Sign up
    await page.getByRole('group', { name: 'Log in or sign up' }).getByRole('button', { name: 'Sign up' }).click();

    // Empty name on signup
    await page.getByLabel('Full name').fill('');
    await page.getByLabel('Email').fill('valid@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('checkbox').check();
    await page.getByTestId('auth-submit').click();
    await expect(page.getByText('Enter your name.')).toBeVisible();

    // Short password text on signup
    await page.getByLabel('Full name').fill('Taylor');
    await page.getByLabel('Password').fill('short');
    await page.getByTestId('auth-submit').click();
    await expect(page.getByText('Use at least 8 characters for your password.')).toBeVisible();

    // Terms unchecked on signup
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('checkbox').uncheck();
    await page.getByTestId('auth-submit').click();
    await expect(page.getByText('Please accept the terms to continue.')).toBeVisible();
  });

  test('AUTH-05 (P1) Show/Hide password toggles; Enter submits', async ({ page }) => {
    await page.goto('/login');
    const pwInput = page.getByLabel('Password');
    await expect(pwInput).toHaveAttribute('type', 'password');

    await page.getByRole('button', { name: 'Show' }).click();
    await expect(pwInput).toHaveAttribute('type', 'text');

    await page.getByRole('button', { name: 'Hide' }).click();
    await expect(pwInput).toHaveAttribute('type', 'password');

    // Enter submits
    await page.getByLabel('Email').fill('alex.morgan@email.com');
    await pwInput.fill('password123');
    await pwInput.press('Enter');
    await expect(page.getByRole('heading', { name: /Welcome back, Alex!/i })).toBeVisible({ timeout: 5000 });
  });

  test('AUTH-06 (P1) Forgot password prompt text and success', async ({ page }) => {
    await page.goto('/login');

    // Invalid email first
    await page.getByLabel('Email').fill('invalid');
    await page.getByRole('button', { name: 'Forgot password?' }).click();
    await expect(page.getByText('Enter your email above first, then tap Forgot password.')).toBeVisible();

    // Valid email
    await page.getByLabel('Email').fill('alex.morgan@email.com');
    await page.getByRole('button', { name: 'Forgot password?' }).click();
    await expect(page.getByText('Reset link sent to alex.morgan@email.com. Check your inbox.')).toBeVisible();
  });

  test('AUTH-07 (P1) Tab switch Log in/Sign up keeps email, clears errors, shows/hides name + terms', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByTestId('auth-submit').click(); // trigger error
    await expect(page.getByText(/Enter your password/)).toBeVisible();

    // Switch to Sign up
    await page.getByRole('group', { name: 'Log in or sign up' }).getByRole('button', { name: 'Sign up' }).click();
    await expect(page.getByLabel('Email')).toHaveValue('test@example.com');
    await expect(page.getByText(/Enter your password/)).not.toBeVisible();
    await expect(page.getByLabel('Full name')).toBeVisible();
    await expect(page.getByRole('checkbox')).toBeVisible();

    // Switch back to Log in
    await page.getByRole('group', { name: 'Log in or sign up' }).getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByLabel('Email')).toHaveValue('test@example.com');
    await expect(page.getByLabel('Full name')).not.toBeVisible();
    await expect(page.getByRole('checkbox')).not.toBeVisible();
  });

  test('AUTH-08 (P1) Route guard protects dashboard and redirects', async ({ page }) => {
    // Signed out opening dashboard redirects to /login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);

    // Opening progress redirects to /login
    await page.goto('/progress');
    await expect(page).toHaveURL(/\/login/);

    // Sign in and open /login -> redirects to /dashboard
    await page.getByLabel('Email').fill('alex.morgan@email.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByTestId('auth-submit').click();
    await page.getByRole('link', { name: 'Go to dashboard' }).click();
    await page.waitForURL('/dashboard');

    await page.goto('/login');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('AUTH-09 (P2) Mobile (390): brand panel stacks, no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/login');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

    await expect(page.getByTestId('auth-submit')).toBeVisible();
  });
});
