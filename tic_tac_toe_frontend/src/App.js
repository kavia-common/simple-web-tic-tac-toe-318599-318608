import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { createEmptyBoard, getWinner, isDraw } from './gameLogic';

/**
 * Stateless square for the Tic Tac Toe board.
 * UI only: click handler is passed in.
 */
function Square({ value, index, onClick, disabled, variantClassName }) {
  const row = Math.floor(index / 3) + 1;
  const col = (index % 3) + 1;
  const valueLabel = value ? value : 'empty';

  return (
    <button
      type="button"
      className={`ttt-square ${variantClassName || ''}`.trim()}
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
function Board({ squares, onSquareClick, disabled, winnerLine }) {
  const winningSet = useMemo(() => new Set(winnerLine || []), [winnerLine]);

  return (
    <div className="ttt-board" role="grid" aria-label="Tic Tac Toe board">
      {squares.map((value, idx) => {
        const isWinningSquare = winningSet.has(idx);
        const showWinStyling = disabled && (winnerLine?.length ?? 0) === 3;

        // After a win, highlight only the winning 3 squares and dim the rest.
        const variantClassName = showWinStyling
          ? isWinningSquare
            ? 'square--winning'
            : 'square--dimmed'
          : '';

        return (
          <div key={idx} className="ttt-cell" role="gridcell">
            <Square
              value={value}
              index={idx}
              onClick={() => onSquareClick?.(idx)}
              disabled={disabled || Boolean(value)}
              variantClassName={variantClassName}
            />
          </div>
        );
      })}
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  const [board, setBoard] = useState(() => createEmptyBoard());
  const [activePlayer, setActivePlayer] = useState('X'); // X always starts

  const restartBtnRef = useRef(null);
  const bannerRef = useRef(null);

  const winnerInfo = useMemo(() => getWinner(board), [board]);
  const draw = useMemo(() => isDraw(board), [board]);
  const gameEnded = Boolean(winnerInfo) || draw;

  // Keep the turn indicator unambiguous: it becomes winner/draw messaging when ended.
  const statusText = useMemo(() => {
    if (winnerInfo) return `Player ${winnerInfo.winner}'s turn`; // not used when ended, kept for safety
    if (draw) return `Player ${activePlayer}'s turn`; // not used when ended, kept for safety
    return `Player ${activePlayer}'s turn`;
  }, [winnerInfo, draw, activePlayer]);

  const bannerText = useMemo(() => {
    if (winnerInfo) return `Player ${winnerInfo.winner} wins!`;
    if (draw) return `It's a draw`;
    return '';
  }, [winnerInfo, draw]);

  /**
   * When the game ends (win/draw), ensure result is clearly announced and focus is placed
   * on a meaningful target for keyboard + screen readers:
   * - Prefer focusing the banner (so it's announced and visible contextually)
   * - If banner isn't available, fallback to Restart button
   *
   * This also handles the case where focus was on a (now disabled/dimmed) square.
   */
  useEffect(() => {
    if (!gameEnded) return;

    // If the active element is inside the board, move focus away to avoid trapping
    // focus on a now-disabled control.
    const active = document.activeElement;
    const isSquareFocused =
      active instanceof HTMLElement && active.classList.contains('ttt-square');

    const focusTarget = bannerRef.current || restartBtnRef.current;
    if (isSquareFocused || focusTarget) {
      focusTarget?.focus?.();
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
  };

  const bannerKindClass = winnerInfo
    ? 'winner-banner--win'
    : draw
      ? 'winner-banner--draw'
      : '';

  const restartEmphasisClass = gameEnded ? 'ttt-restartBtn--emphasis' : '';

  return (
    <div className="App">
      <main className="ttt-page" aria-label="Tic Tac Toe">
        <section className="ttt-card" aria-label="Game area">
          <header className="ttt-header">
            <h1 className="ttt-title">Tic Tac Toe</h1>
            <p className="ttt-subtitle">A simple 3×3 game for two players</p>
          </header>

          {/* Existing status indicator stays for in-game turn indication only */}
          {!gameEnded && (
            <div className="ttt-status">
              <span className="ttt-statusLabel" role="status" aria-live="polite">
                {statusText}
              </span>
            </div>
          )}

          <div className="ttt-boardWrap" aria-label="Board container">
            <Board
              squares={board}
              onSquareClick={handleSquareClick}
              disabled={gameEnded}
              winnerLine={winnerInfo?.line || null}
            />
          </div>

          {/* Prominent result banner (win/draw) below board */}
          {gameEnded && (
            <div
              ref={bannerRef}
              className={`winner-banner ${bannerKindClass}`.trim()}
              role="status"
              aria-live="polite"
              tabIndex={-1}
              aria-label={winnerInfo ? 'Winner announcement' : 'Draw announcement'}
            >
              {bannerText}
            </div>
          )}

          <div className="ttt-actions">
            <button
              ref={restartBtnRef}
              type="button"
              className={`ttt-restartBtn ${restartEmphasisClass}`.trim()}
              onClick={handleRestart}
              aria-label={gameEnded ? 'Restart game (recommended)' : 'Restart game'}
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
