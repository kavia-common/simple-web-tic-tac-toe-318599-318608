import { render, screen } from '@testing-library/react';
import App from './App';

test('renders start screen Tic Tac Toe title', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /tic tac toe/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /human vs human/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /human vs computer/i })).toBeInTheDocument();
});
