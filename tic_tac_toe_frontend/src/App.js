import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { createEmptyBoard, getWinner, isDraw } from './gameLogic';
import { pickComputerMove } from './ai';
import { applyTheme, resolveInitialTheme, storeTheme } from './theme';

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

/**
 * Small theme switcher control.
 */
function ThemeSelector({ theme, onChange }) {
  return (
    <div className="ttt-themeSelector" role="group" aria-label="Theme selection">
      <label className="ttt-themeLabel" htmlFor="theme-select">
        Theme
      </label>
      <select
        id="theme-select"
        className="ttt-themeSelect"
        value={theme}
        onChange={(e) => onChange?.(e.target.value)}
        aria-label="Select theme"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}

/**
 * Landing screen for selecting game mode.
 */
function StartScreen({ onSelectMode, theme, onThemeChange }) {
  return (
    <div className="ttt-startPage" aria-label="Start screen">
      <div className="ttt-startCard ttt-enter" role="region" aria-label="Mode selection">
        <div className="ttt-startDecor" aria-hidden="true">
          <div className="ttt-orb ttt-orb--primary" />
          <div className="ttt-orb ttt-orb--accent" />
        </div>

        <header className="ttt-header ttt-startHeader">
          <div className="ttt-startTopRow">
            <div className="ttt-startIcon" aria-hidden="true">
              ⭕❌
            </div>
            <ThemeSelector theme={theme} onChange={onThemeChange} />
          </div>

          <h1 className="ttt-title">Tic Tac Toe</h1>
          <p className="ttt-subtitle">
            Pick a mode to start a quick match. Keyboard-friendly and responsive.
          </p>
        </header>

        <div className="ttt-startActions" role="group" aria-label="Choose game mode">
          <button
            type="button"
            className="ttt-modeBtn ttt-modeBtn--primary"
            onClick={() => onSelectMode('hvh')}
            aria-label="Start Human versus Human"
          >
            Human vs Human
          </button>
          <button
            type="button"
            className="ttt-modeBtn ttt-modeBtn--accent"
            onClick={() => onSelectMode('hvc')}
            aria-label="Start Human versus Computer"
          >
            Human vs Computer <span className="ttt-modeBtnHint">(COM)</span>
          </button>
        </div>

        <p className="ttt-startFootnote">
          Tip: In COM mode, you play as <strong>X</strong> and the computer plays as <strong>O</strong>.
        </p>
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Main application component.
 *
 * Adds an app-wide theme system (light/dark) driven by CSS variables on the document root.
 * Theme preference is persisted to localStorage; when none is stored, system preference
 * (prefers-color-scheme) is used as a fallback.
 */
function App() {
  const [theme, setTheme] = useState(() => resolveInitialTheme());

  const [screen, setScreen] = useState('start'); // 'start' | 'game'
  const [mode, setMode] = useState(null); // 'hvh' | 'hvc' | null

  const [board, setBoard] = useState(() => createEmptyBoard());
  const [activePlayer, setActivePlayer] = useState('X'); // X always starts

  // Used to show the "COM thinking…" badge and to disable inputs during COM turn.
  const [isComThinking, setIsComThinking] = useState(false);

  const restartBtnRef = useRef(null);
  const bannerRef = useRef(null);

  // Refs to make COM scheduling robust against React 18 StrictMode effect double-invocation
  // and against stale timeouts firing after a restart/mode change.
  const comTimeoutRef = useRef(null);
  const comTurnTokenRef = useRef(0);

  // Apply theme on mount + whenever it changes.
  useEffect(() => {
    applyTheme(theme);
    storeTheme(theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const handleThemeChange = (nextTheme) => {
    const normalized = nextTheme === 'dark' ? 'dark' : 'light';
    setTheme(normalized);
  };

  const winnerInfo = useMemo(() => getWinner(board), [board]);
  const draw = useMemo(() => isDraw(board), [board]);
  const gameEnded = Boolean(winnerInfo) || draw;

  const isComMode = mode === 'hvc';
  const comSymbol = 'O';
  const isComTurn = isComMode && activePlayer === comSymbol;

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

  /**
   * COM mode: automatically make a legal move after the human's turn.
   *
   * Robustness goals:
   * - Ensure only one COM timeout exists at a time (prevents double-move).
   * - Ensure "thinking" ALWAYS clears (even on cleanup/reset/unmount).
   * - Ensure a legal move is always chosen (fallback to first empty).
   * - Apply COM move atomically based on the latest board snapshot.
   *
   * Note: In React 18 StrictMode, effects can run twice in dev which can expose
   * race conditions if scheduling isn't explicitly cancelled/tokened.
   */
  useEffect(() => {
    // Always clear any pending timeout when dependencies change.
    if (comTimeoutRef.current) {
      window.clearTimeout(comTimeoutRef.current);
      comTimeoutRef.current = null;
    }

    if (screen !== 'game' || !isComTurn || gameEnded) {
      // If we are not in a state where COM should move, ensure thinking is false.
      setIsComThinking(false);
      return;
    }

    // New COM turn token: invalidates any previously scheduled callback.
    const myToken = ++comTurnTokenRef.current;

    setIsComThinking(true);

    comTimeoutRef.current = window.setTimeout(() => {
      // If this callback is stale (because a new turn started / restart happened), do nothing.
      if (comTurnTokenRef.current !== myToken) return;

      setBoard((prevBoard) => {
        // If this callback is stale inside the state update, do nothing.
        if (comTurnTokenRef.current !== myToken) return prevBoard;

        if (!Array.isArray(prevBoard) || prevBoard.length !== 9) {
          setIsComThinking(false);
          return prevBoard;
        }

        if (getWinner(prevBoard) || isDraw(prevBoard)) {
          setIsComThinking(false);
          return prevBoard;
        }

        let move = pickComputerMove(prevBoard, comSymbol);

        // Defensive fallback: if AI returns an illegal move, pick the first empty cell.
        if (move === null || move < 0 || move > 8 || prevBoard[move] !== '') {
          move = prevBoard.findIndex((v) => v === '');
        }

        if (move === -1) {
          // No legal moves (draw) — just clear thinking.
          setIsComThinking(false);
          return prevBoard;
        }

        const next = prevBoard.slice();
        next[move] = comSymbol;

        // Advance turn back to human and clear thinking.
        setActivePlayer('X');
        setIsComThinking(false);

        return next;
      });
    }, 220);

    return () => {
      // Invalidate any in-flight timeout for this effect run.
      if (comTurnTokenRef.current === myToken) {
        comTurnTokenRef.current++;
      }

      if (comTimeoutRef.current) {
        window.clearTimeout(comTimeoutRef.current);
        comTimeoutRef.current = null;
      }

      // Ensure UI never remains stuck in "thinking…" due to cleanup.
      setIsComThinking(false);
    };
  }, [screen, isComTurn, gameEnded, comSymbol]);

  // PUBLIC_INTERFACE
  const startGame = (selectedMode) => {
    // Cancel any pending COM move from a previous session/mode.
    comTurnTokenRef.current++;
    if (comTimeoutRef.current) {
      window.clearTimeout(comTimeoutRef.current);
      comTimeoutRef.current = null;
    }

    setMode(selectedMode);
    setScreen('game');
    // Start fresh each time a mode is chosen.
    setBoard(createEmptyBoard());
    setActivePlayer('X');
    setIsComThinking(false);
  };

  // PUBLIC_INTERFACE
  const handleSquareClick = (index) => {
    // Block all interactions after game end.
    if (gameEnded) return;

    // In COM mode, prevent the human from moving during COM's turn.
    if (isComMode && isComTurn) return;

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
    // Cancel any pending COM move from the previous turn.
    comTurnTokenRef.current++;
    if (comTimeoutRef.current) {
      window.clearTimeout(comTimeoutRef.current);
      comTimeoutRef.current = null;
    }

    // Deterministic reset: X always starts, empty board, no result.
    setBoard(createEmptyBoard());
    setActivePlayer('X');
    setIsComThinking(false);
    // Focus behavior: keep focus on the Restart button (default browser behavior).
  };

  // PUBLIC_INTERFACE
  const handleBackToStart = () => {
    // Cancel any pending COM move when leaving the game screen.
    comTurnTokenRef.current++;
    if (comTimeoutRef.current) {
      window.clearTimeout(comTimeoutRef.current);
      comTimeoutRef.current = null;
    }

    setScreen('start');
    setMode(null);
    setBoard(createEmptyBoard());
    setActivePlayer('X');
    setIsComThinking(false);
  };

  if (screen === 'start') {
    return (
      <div className="App">
        <main className="ttt-page" aria-label="Tic Tac Toe">
          <StartScreen onSelectMode={startGame} theme={theme} onThemeChange={handleThemeChange} />
        </main>
      </div>
    );
  }

  const bannerKindClass = winnerInfo
    ? 'winner-banner--win'
    : draw
      ? 'winner-banner--draw'
      : '';

  const restartEmphasisClass = gameEnded ? 'ttt-restartBtn--emphasis' : '';

  const modeLabel = mode === 'hvh' ? 'Human vs Human' : 'Human vs Computer';
  const modeBadgeClass = mode === 'hvh' ? 'ttt-modeBadge--hvh' : 'ttt-modeBadge--hvc';

  const inputDisabled = gameEnded || (isComMode && isComTurn);

  return (
    <div className="App">
      <main className="ttt-page" aria-label="Tic Tac Toe">
        <section className="ttt-card ttt-enter" aria-label="Game area">
          <header className="ttt-header">
            <div className="ttt-topRow">
              <div className="ttt-badges" aria-label="Game metadata">
                <span className={`ttt-modeBadge ${modeBadgeClass}`.trim()} aria-label={`Mode: ${modeLabel}`}>
                  {modeLabel}
                </span>
                {isComMode && (
                  <span className="ttt-miniBadge" aria-live="polite" aria-label="Computer status">
                    {isComThinking || isComTurn ? 'COM thinking…' : 'Your move'}
                  </span>
                )}
              </div>

              <div className="ttt-topRowRight" aria-label="Top right controls">
                <ThemeSelector theme={theme} onChange={handleThemeChange} />
                <button
                  type="button"
                  className="ttt-backBtn"
                  onClick={handleBackToStart}
                  aria-label="Back to start screen"
                >
                  Back to Start
                </button>
              </div>
            </div>

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
              disabled={inputDisabled}
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
