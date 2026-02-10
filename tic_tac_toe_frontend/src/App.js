import React from 'react';
import './App.css';

/**
 * Stateless square for the Tic Tac Toe board.
 * UI only: click handler is passed in but gameplay is not implemented in this step.
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
 * UI only: receives squares and onSquareClick via props.
 */
function Board({ squares, onSquareClick, disabled }) {
  return (
    <div
      className="ttt-board"
      role="grid"
      aria-label="Tic Tac Toe board"
    >
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
  // UI skeleton state placeholders (no gameplay yet)
  const currentPlayer = 'X';
  const statusText = `Turn: ${currentPlayer}`;
  const resultText = 'Result: —';

  const squares = Array.from({ length: 9 }, () => '');

  // PUBLIC_INTERFACE
  const handleSquareClick = (_index) => {
    // Intentionally empty for this step (gameplay implemented later).
  };

  // PUBLIC_INTERFACE
  const handleRestart = () => {
    // Intentionally empty for this step (game reset implemented later).
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
            <Board squares={squares} onSquareClick={handleSquareClick} disabled={false} />
          </div>

          <div className="ttt-result" aria-live="polite" aria-label="Result">
            {resultText}
          </div>

          <div className="ttt-actions">
            <button type="button" className="ttt-restartBtn" onClick={handleRestart}>
              Restart
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
