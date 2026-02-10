import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { createEmptyBoard, getWinner, isDraw } from './gameLogic';

/**
 * Stateless square for the Tic Tac Toe board.
 * UI only: click handler is passed in.
 */
function Square({ value, index, onClick, disabled }) {
  const row = Math.floor(index / 3) + 1;
  const col = (index % 3) + 1;
  const valueLabel = value ? value : 'empty';

  return (
    <button
      type="button"
      className="ttt-square"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Row ${row} Column ${col}: ${valueLabel}`}
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
            disabled={disabled || Boolean(value)}
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

  const statusRef = useRef(null);

  const winnerInfo = useMemo(() => getWinner(board), [board]);
  const draw = useMemo(() => isDraw(board), [board]);
  const gameEnded = Boolean(winnerInfo) || draw;

  const statusText = useMemo(() => {
    if (winnerInfo) return `Player ${winnerInfo.winner} wins!`;
    if (draw) return `It's a draw`;
    return `Player ${activePlayer}'s turn`;
  }, [winnerInfo, draw, activePlayer]);

  /**
   * When the game ends (win/draw), move focus to the status message so screen readers
   * announce the result change in a predictable way.
   */
  useEffect(() => {
    if (gameEnded) {
      statusRef.current?.focus?.();
    }
  }, [gameEnded]);

  // PUBLIC_INTERFACE
  const handleSquareClick = (index) => {
    // Block all interactions after game end.
    if (gameEnded) return;

    // If user clicks an already-filled square, do nothing.
    if (board[index]) return;

    // Apply the move and compute next player based on the move validity.
    const nextBoard = board.slice();
    nextBoard[index] = activePlayer;

    setBoard(nextBoard);

    // Toggle player (game-end state will be derived from next board on re-render).
    setActivePlayer((p) => (p === 'X' ? 'O' : 'X'));
  };

  // PUBLIC_INTERFACE
  const handleRestart = () => {
    // Deterministic reset: X always starts, empty board, no result.
    setBoard(createEmptyBoard());
    setActivePlayer('X');
    // Focus behavior: keep focus on the Restart button (default browser behavior).
    // Status remains a polite live region for the reset announcement.
  };

  return (
    <div className="App">
      <main className="ttt-page" aria-label="Tic Tac Toe">
        <section className="ttt-card" aria-label="Game area">
          <header className="ttt-header">
            <h1 className="ttt-title">Tic Tac Toe</h1>
            <p className="ttt-subtitle">A simple 3×3 game for two players</p>
          </header>

          <div className="ttt-status">
            <span
              ref={statusRef}
              className="ttt-statusLabel"
              role="status"
              aria-live="polite"
              tabIndex={-1}
            >
              {statusText}
            </span>
          </div>

          <div className="ttt-boardWrap" aria-label="Board container">
            <Board
              squares={board}
              onSquareClick={handleSquareClick}
              disabled={gameEnded}
            />
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
