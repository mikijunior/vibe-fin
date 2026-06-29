import { render, screen } from '@testing-library/react';
import { Header } from '@/components/Header';
import type { Portfolio } from '@/lib/types';

const samplePortfolio: Portfolio = {
  cash_balance: 4521.5,
  total_value: 12345.67,
  unrealized_pnl: 2345.67,
  positions: [],
};

describe('<Header />', () => {
  it('renders placeholders when portfolio is null', () => {
    render(<Header portfolio={null} connectionState="connecting" />);
    expect(screen.getByTestId('header-total').textContent).toBe('—');
    expect(screen.getByTestId('header-cash').textContent).toBe('—');
    expect(screen.getByTestId('header-pnl').textContent).toBe('—');
  });

  it('renders live portfolio totals', () => {
    render(<Header portfolio={samplePortfolio} connectionState="open" />);
    expect(screen.getByTestId('header-total').textContent).toContain('$12,346');
    expect(screen.getByTestId('header-cash').textContent).toContain('$4,522');
    expect(screen.getByTestId('header-pnl').textContent).toContain('+$2,346');
  });

  it('uses the up color when P&L is positive', () => {
    render(<Header portfolio={samplePortfolio} connectionState="open" />);
    const pnl = screen.getByTestId('header-pnl');
    expect(pnl.className).toMatch(/text-tick-up/);
  });

  it('uses the down color when P&L is negative', () => {
    render(
      <Header
        portfolio={{ ...samplePortfolio, unrealized_pnl: -123.4 }}
        connectionState="open"
      />,
    );
    const pnl = screen.getByTestId('header-pnl');
    expect(pnl.className).toMatch(/text-tick-down/);
  });

  it('reflects the connection state on the dot', () => {
    const { rerender } = render(
      <Header portfolio={null} connectionState="open" />,
    );
    expect(
      screen.getByTestId('header-connection').getAttribute('aria-label'),
    ).toBe('connection-open');

    rerender(<Header portfolio={null} connectionState="connecting" />);
    expect(screen.getByTestId('header-connection-dot').className).toMatch(
      /bg-accent-yellow/,
    );

    rerender(<Header portfolio={null} connectionState="closed" />);
    expect(screen.getByTestId('header-connection-dot').className).toMatch(
      /bg-tick-down/,
    );
  });
});