/**
 * Pure game logic helpers for Tic Tac Toe.
 * These functions are intentionally stateless and deterministic.
 */

/**
 * @typedef {'X'|'O'|''} SquareValue
 */

/**
 * @typedef {Object} WinnerInfo
 * @property {'X'|'O'} winner The winning player symbol.
 * @property {number[]} line Indices (0-8) of the winning 3-in-a-row.
 */

/**
 * All possible winning lines on a 3x3 board (indices 0-8).
 * @type {number[][]}
 */
const WIN_LINES = [
  // rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // cols
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // diagonals
  [0, 4, 8],
  [2, 4, 6],
];

/**
 * PUBLIC_INTERFACE
 * Determine if there is a winner on the board.
 *
 * @param {SquareValue[]} board Array of 9 entries: 'X', 'O', or ''.
 * @returns {WinnerInfo|null} Winner info (winner + winning line) or null if no winner.
 */
export function getWinner(board) {
  if (!Array.isArray(board) || board.length !== 9) return null;

  for (const [a, b, c] of WIN_LINES) {
    const v = board[a];
    if (v && v === board[b] && v === board[c]) {
      return { winner: v, line: [a, b, c] };
    }
  }
  return null;
}

/**
 * PUBLIC_INTERFACE
 * Determine if the board is a draw (full board and no winner).
 *
 * @param {SquareValue[]} board Array of 9 entries: 'X', 'O', or ''.
 * @returns {boolean} True if draw, else false.
 */
export function isDraw(board) {
  if (!Array.isArray(board) || board.length !== 9) return false;
  if (getWinner(board)) return false;
  return board.every((sq) => sq === 'X' || sq === 'O');
}

/**
 * PUBLIC_INTERFACE
 * Create a new empty board (9 empty strings).
 *
 * @returns {SquareValue[]} Fresh empty board array.
 */
export function createEmptyBoard() {
  return Array.from({ length: 9 }, () => '');
}
