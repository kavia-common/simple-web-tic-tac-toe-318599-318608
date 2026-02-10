import React, { useMemo, useState } from 'react';
import './App.css';
import { createEmptyBoard, getWinner, isDraw } from './gameLogic';

/**
 * Stateless square for the Tic Tac Toe board.
 * UI only: click handler is passed in.
 */
function Square({ value, index, onClick, disabled }) {
  return (
    <button
      type="button"
      className="ttt-square"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Square ${index + 1}${value ? `: ${value}` : ': empty'}`}
    >
      <span className="ttt-squareValue" aria-hidden="true">
        {value}
      </span>
    </button>
  );
}

/**
 * 3x3 board layout.
 * Receives squares and onSquareClick via props.
 */
function Board({ squares, onSquareClick, disabled }) {
  return (
    <div className="ttt-board" role="grid" aria-label="Tic Tac Toe board">
      {squares.map((value, idx) => (
        <div key={idx} className="ttt-cell" role="gridcell">
          <Square
            value={value}
            index={idx}
            onClick={() => onSquareClick?.(idx)}
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  const [board, setBoard] = useState(() => createEmptyBoard());
  const [activePlayer, setActivePlayer] = useState('X'); // X always starts

  const winnerInfo = useMemo(() => getWinner(board), [board]);
  const draw = useMemo(() => isDraw(board), [board]);

  const gameEnded = Boolean(winnerInfo) || draw;

  const statusText = winnerInfo
    ? `Winner: ${winnerInfo.winner}`
    : draw
      ? 'Draw'
      : `Turn: ${activePlayer}`;

  const resultText = winnerInfo
    ? `${winnerInfo.winner} wins!`
    : draw
      ? `It's a draw.`
      : 'Result: —';

  // PUBLIC_INTERFACE
  const handleSquareClick = (index) => {
    // Block all interactions after game end.
    if (gameEnded) return;

    setBoard((prev) => {
      // If user clicks an already-filled square, do nothing.
      if (prev[index]) return prev;

      const next = prev.slice();
      next[index] = activePlayer;

      return next;
    });

    // Only toggle player if the move is valid (square was empty and game not ended).
    // We must check the current board square synchronously (not from state update result),
    // so we use the latest `board` value here.
    if (!board[index]) {
      setActivePlayer((p) => (p === 'X' ? 'O' : 'X'));
    }
  };

  // PUBLIC_INTERFACE
  const handleRestart = () => {
    // Deterministic reset: X always starts, empty board, no result.
    setBoard(createEmptyBoard());
    setActivePlayer('X');
  };

  return (
    <div className="App">
      <main className="ttt-page" aria-label="Tic Tac Toe">
        <section className="ttt-card" aria-label="Game area">
          <header className="ttt-header">
            <h1 className="ttt-title">Tic Tac Toe</h1>
            <p className="ttt-subtitle">A simple 3×3 game for two players</p>
          </header>

          <div className="ttt-status" aria-live="polite">
            <span className="ttt-statusLabel">{statusText}</span>
          </div>

          <div className="ttt-boardWrap" aria-label="Board container">
            <Board
              squares={board}
              onSquareClick={handleSquareClick}
              disabled={gameEnded}
            />
          </div>

          <div className="ttt-result" aria-live="polite" aria-label="Result">
            {resultText}
          </div>

          <div className="ttt-actions">
            <button
              type="button"
              className="ttt-restartBtn"
              onClick={handleRestart}
            >
              Restart
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
