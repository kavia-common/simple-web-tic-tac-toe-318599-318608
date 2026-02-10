/**
 * Simple deterministic AI for Tic Tac Toe.
 * Strategy:
 * 1) Win if possible
 * 2) Block opponent win if needed
 * 3) Take center
 * 4) Otherwise take the first available empty cell
 */

/**
 * @typedef {'X'|'O'|''} SquareValue
 */

/**
 * @typedef {Object} WinnerInfo
 * @property {'X'|'O'} winner
 * @property {number[]} line
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
 * Try to find a move that completes a 3-in-a-row for a given player.
 *
 * @param {SquareValue[]} board
 * @param {'X'|'O'} player
 * @returns {number|null} index to play or null if none
 */
function findWinningMove(board, player) {
  for (const [a, b, c] of WIN_LINES) {
    const line = [a, b, c];
    const values = line.map((i) => board[i]);
    const playerCount = values.filter((v) => v === player).length;
    const emptyCount = values.filter((v) => v === '').length;

    if (playerCount === 2 && emptyCount === 1) {
      const emptyIndexInLine = line[values.findIndex((v) => v === '')];
      return emptyIndexInLine ?? null;
    }
  }
  return null;
}

/**
 * PUBLIC_INTERFACE
 * Compute a deterministic computer move for the current board.
 *
 * The AI does not mutate the board.
 *
 * @param {SquareValue[]} board Current board state (length 9).
 * @param {'X'|'O'} comSymbol Symbol used by the computer player.
 * @returns {number|null} Index (0-8) of the chosen move, or null if no legal move exists.
 */
export function pickComputerMove(board, comSymbol) {
  if (!Array.isArray(board) || board.length !== 9) return null;

  const humanSymbol = comSymbol === 'X' ? 'O' : 'X';

  // 1) Win
  const win = findWinningMove(board, comSymbol);
  if (win !== null && board[win] === '') return win;

  // 2) Block
  const block = findWinningMove(board, humanSymbol);
  if (block !== null && board[block] === '') return block;

  // 3) Center
  if (board[4] === '') return 4;

  // 4) First available
  const firstEmpty = board.findIndex((v) => v === '');
  return firstEmpty === -1 ? null : firstEmpty;
}
