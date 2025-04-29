"use client";

import { useState, useEffect } from 'react';

type SquareValue = 'X' | 'O' | null;
type GameMode = 'two-players' | 'normal' | 'god-mode';

const Board = () => {
  const [squares, setSquares] = useState<SquareValue[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);
  const [winner, setWinner] = useState<SquareValue>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('two-players');
  const [isPlayerX, setIsPlayerX] = useState<boolean>(true);
  const [isComputerThinking, setIsComputerThinking] = useState<boolean>(false);

  const calculateWinner = (squares: SquareValue[]): [SquareValue, number[] | null] => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (const line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return [squares[a], line];
      }
    }
    
    return [null, null];
  };

  const getEmptySquares = (board: SquareValue[]): number[] => {
    return board.map((square, index) => square === null ? index : -1).filter(index => index !== -1);
  };

  // Minimax algorithm for unbeatable AI
  const minimax = (board: SquareValue[], depth: number, isMaximizing: boolean): number => {
    const [winner] = calculateWinner(board);
    
    // Terminal states
    if (winner === (isPlayerX ? 'O' : 'X')) return 10 - depth;
    if (winner === (isPlayerX ? 'X' : 'O')) return depth - 10;
    if (!board.includes(null)) return 0;
    
    const emptySquares = getEmptySquares(board);
    
    if (isMaximizing) {
      let bestScore = -Infinity;
      for (const index of emptySquares) {
        const newBoard = [...board];
        newBoard[index] = isPlayerX ? 'O' : 'X'; // Computer's mark
        const score = minimax(newBoard, depth + 1, false);
        bestScore = Math.max(bestScore, score);
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (const index of emptySquares) {
        const newBoard = [...board];
        newBoard[index] = isPlayerX ? 'X' : 'O'; // Player's mark
        const score = minimax(newBoard, depth + 1, true);
        bestScore = Math.min(bestScore, score);
      }
      return bestScore;
    }
  };

  // Normal AI that can make mistakes
  const findNormalMove = (board: SquareValue[]): number => {
    const emptySquares = getEmptySquares(board);
    
    // 70% chance to make the best move, 30% chance to make a random move
    if (Math.random() < 0.7) {
      return findBestMove(board);
    } else {
      return emptySquares[Math.floor(Math.random() * emptySquares.length)];
    }
  };

  // Find the best move for the AI
  const findBestMove = (board: SquareValue[]): number => {
    const emptySquares = getEmptySquares(board);
    let bestScore = -Infinity;
    let bestMove = -1;
    
    for (const index of emptySquares) {
      const newBoard = [...board];
      newBoard[index] = isPlayerX ? 'O' : 'X'; // Computer's mark
      const score = minimax(newBoard, 0, false);
      if (score > bestScore) {
        bestScore = score;
        bestMove = index;
      }
    }
    
    return bestMove;
  };

  // Computer makes a move
  const computerMove = () => {
    if (winner || gameOver) return;
    
    setIsComputerThinking(true);
    
    // Use setTimeout to give a visual indication that the computer is "thinking"
    setTimeout(() => {
      const moveIndex = gameMode === 'god-mode' 
        ? findBestMove(squares) 
        : findNormalMove(squares);
      
      if (moveIndex >= 0) {
        const newSquares = squares.slice();
        newSquares[moveIndex] = isXNext ? 'X' : 'O';
        setSquares(newSquares);
        setIsXNext(!isXNext);
      }
      setIsComputerThinking(false);
    }, 500);
  };

  const handleClick = (i: number) => {
    // If square is already filled or game is over
    if (squares[i] || winner || gameOver || isComputerThinking) return;
    
    // If it's not the player's turn in computer mode
    if ((gameMode !== 'two-players') && 
        ((isPlayerX && !isXNext) || (!isPlayerX && isXNext))) {
      return;
    }
    
    const newSquares = squares.slice();
    newSquares[i] = isXNext ? 'X' : 'O';
    setSquares(newSquares);
    setIsXNext(!isXNext);
  };

  const renderSquare = (i: number) => {
    const isWinningSquare = winningLine && winningLine.includes(i);
    
    return (
      <button 
        className={`square ${squares[i] === 'X' ? 'x-square' : squares[i] === 'O' ? 'o-square' : ''} 
                  ${isWinningSquare ? 'winning-square' : ''}`}
        onClick={() => handleClick(i)}
        aria-label={`Square ${i}`}
        disabled={isComputerThinking}
      >
        {squares[i]}
      </button>
    );
  };

  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setGameOver(false);
    setWinningLine(null);
    setIsComputerThinking(false);
  };

  const changeGameMode = (mode: GameMode) => {
    setGameMode(mode);
    resetGame();
  };

  const switchToPlayerX = () => {
    if (isPlayerX) return;
    setIsPlayerX(true);
    resetGame();
  };

  const switchToPlayerO = () => {
    if (!isPlayerX) return;
    setIsPlayerX(false);
    resetGame();
    
    // If player chooses O, computer (X) should go first
    setIsComputerThinking(true);
    setTimeout(() => {
      computerMove();
    }, 300);
  };

  useEffect(() => {
    const [winnerValue, line] = calculateWinner(squares);
    if (winnerValue) {
      setWinner(winnerValue);
      setWinningLine(line);
      setGameOver(true);
    } else if (!squares.includes(null)) {
      setGameOver(true);
    } else if (gameMode !== 'two-players' && 
              ((isPlayerX && !isXNext) || (!isPlayerX && isXNext)) && 
              !isComputerThinking) {
      // Computer's turn
      computerMove();
    }
  }, [squares, isXNext, gameMode, computerMove, isComputerThinking, isPlayerX]);

  let status;
  if (winner) {
    status = `${winner} wins!`;
  } else if (gameOver) {
    status = 'Game ended in a draw!';
  } else if (isComputerThinking) {
    status = 'Computer is thinking...';
  } else {
    status = `Next player: ${isXNext ? 'X' : 'O'}`;
  }

  return (
    <div className="game-container" style={{ marginTop: "-0.5rem" }}>
      <div className="game-modes">
        <button 
          className={`mode-button ${gameMode === 'two-players' ? 'active' : ''}`} 
          onClick={() => changeGameMode('two-players')}
          disabled={isComputerThinking}
        >
          Two Players
        </button>
        <button 
          className={`mode-button ${gameMode === 'normal' ? 'active' : ''}`} 
          onClick={() => changeGameMode('normal')}
          disabled={isComputerThinking}
        >
          Normal AI
        </button>
        <button 
          className={`mode-button ${gameMode === 'god-mode' ? 'active' : ''}`} 
          onClick={() => changeGameMode('god-mode')}
          disabled={isComputerThinking}
        >
          God Mode
        </button>
      </div>
      
      {gameMode !== 'two-players' && (
        <div className="player-choice">
          <span>Play as: </span>
          <button 
            className={`player-button ${isPlayerX ? 'active' : ''} x-button`} 
            onClick={switchToPlayerX}
            disabled={isComputerThinking}
          >
            X
          </button>
          <button 
            className={`player-button ${!isPlayerX ? 'active' : ''} o-button`} 
            onClick={switchToPlayerO}
            disabled={isComputerThinking}
          >
            O
          </button>
        </div>
      )}
      
      <div className={`status ${isComputerThinking ? 'thinking-status' : ''}`}>{status}</div>
      <div className="board-wrapper">
        <div className="board">
          <div className="board-row">
            {renderSquare(0)}
            {renderSquare(1)}
            {renderSquare(2)}
          </div>
          <div className="board-row">
            {renderSquare(3)}
            {renderSquare(4)}
            {renderSquare(5)}
          </div>
          <div className="board-row">
            {renderSquare(6)}
            {renderSquare(7)}
            {renderSquare(8)}
          </div>
        </div>
      </div>
      <button 
        className="reset-button" 
        onClick={resetGame}
        aria-label="Reset Game"
        disabled={isComputerThinking}
      >
        Reset Game
      </button>
      
      <div className="retro-scanlines"></div>
    </div>
  );
};

export default Board;