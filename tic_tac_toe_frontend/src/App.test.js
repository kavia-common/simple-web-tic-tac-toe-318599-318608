import { fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('renders start screen Tic Tac Toe title', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /tic tac toe/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /human vs human/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /human vs computer/i })).toBeInTheDocument();

  // Theme selector is visible on the start screen.
  expect(screen.getByLabelText(/select theme/i)).toBeInTheDocument();
});

test('HvCOM: COM makes a move shortly after human move (no stuck thinking)', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /human versus computer/i }));

  const board = screen.getByRole('grid', { name: /tic tac toe board/i });
  const cells = within(board).getAllByRole('gridcell');
  expect(cells).toHaveLength(9);

  // Human plays first empty square (top-left). Squares are the button inside each gridcell.
  const firstSquareBtn = within(cells[0]).getByRole('button', { name: /row 1 column 1/i });
  fireEvent.click(firstSquareBtn);

  // COM should "think…" and then play within the delay window.
  expect(screen.getByLabelText(/computer status/i)).toHaveTextContent(/com thinking/i);

  // Fast-forward the COM delay (220ms in App.js) plus a tiny buffer.
  jest.advanceTimersByTime(250);

  // There should now be exactly two filled squares: X (human) and O (com).
  const squareButtons = cells.map((c) => within(c).getByRole('button'));
  const filled = squareButtons.filter((b) => {
    // The visible value is in a span inside the button.
    return b.textContent === 'X' || b.textContent === 'O';
  });

  expect(filled).toHaveLength(2);

  // And COM should no longer be "thinking…" (it should be the human's move).
  expect(screen.getByLabelText(/computer status/i)).toHaveTextContent(/your move/i);
});
