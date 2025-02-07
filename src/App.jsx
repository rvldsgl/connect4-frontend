import { useState, useEffect } from "react";
import Board from "./components/Board";
import "./index.css";

function App() {
  const [board, setBoard] = useState(Array(6).fill(null).map(() => Array(7).fill(null)));
  const [turn, setTurn] = useState("user");
  const [winner, setWinner] = useState(null);
  const [chatLog, setChatLog] = useState([]);
  const [lastMove, setLastMove] = useState(null);

  const dropToken = (col) => {
    if (winner || turn !== "user") return;

    setBoard((prevBoard) => {
      const newBoard = prevBoard.map((row) => [...row]);
      for (let row = 5; row >= 0; row--) {
        if (!newBoard[row][col]) {
          newBoard[row][col] = "🔴";
          setLastMove(col);

          if (checkWinner(newBoard, "🔴")) {
            setWinner("user");
          } else {
            setTurn("llama-3.1-8b-instant");
          }

          return newBoard;
        }
      }
      return prevBoard;
    });
  };

  useEffect(() => {
    if (turn === "llama-3.1-8b-instant" && lastMove !== null && !winner) {
      const requestPayload = { move: lastMove, board };

      fetch("https://connect4-backend-production-e0d0.up.railway.app/api/llm-move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      })
        .then((response) => response.json())
        .then((data) => {
          const llmMove = parseInt(data.move);
          const llmExplanation = data.explanation;

          setBoard((prevBoard) => {
            const newBoard = prevBoard.map((row) => [...row]);
            for (let row = 5; row >= 0; row--) {
              if (!newBoard[row][llmMove]) {
                newBoard[row][llmMove] = "🟡";

                if (checkWinner(newBoard, "🟡")) {
                  setWinner("llama-3.1-8b-instant");
                } else {
                  setTurn("user");
                }

                return newBoard;
              }
            }
            return prevBoard;
          });

          setChatLog((prevLog) => [
            ...prevLog,
            { player: "llama-3.1-8b-instant", message: llmExplanation },
          ]);
        })
        .catch((error) => {
          console.error("Error while getting llama-3.1-8b-instant move:", error);
        });

      setLastMove(null);
    }
  }, [board, turn, lastMove, winner]);

  const checkWinner = (newBoard, token) => {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 7; c++) {
        if (newBoard[r][c] !== token) continue;
        for (let [dr, dc] of directions) {
          let count = 1;
          for (let i = 1; i < 4; i++) {
            const nr = r + dr * i, nc = c + dc * i;
            if (nr < 0 || nr >= 6 || nc >= 7 || newBoard[nr][nc] !== token) break;
            count++;
          }
          if (count === 4) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const resetGame = () => {
    setBoard(Array(6).fill(null).map(() => Array(7).fill(null)));
    setWinner(null);
    setTurn("user");
    setChatLog([]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white px-8 py-10">
      {/* Header */}
      <h1 className="text-5xl font-bold text-center text-blue-400 mb-20">Can You Connect Better Than AI?</h1>

      {}
      {winner && (
        <div className="flex items-center justify-center text-3xl font-bold text-purple-400 mb-5">
          {winner === "user" ? "🔴 User Wins!" : "🟡 llama-3.1-8b-instant Wins!"}
        </div>
      )}

      {}
      <div className="flex flex-row max-w-7xl mx-auto w-full h-[calc(100vh-200px)] min-h-0">
        {}
        <div className="flex flex-col items-center justify-center flex-1">
          <Board board={board} onClick={dropToken} />
          <button
            onClick={resetGame}
            className="mt-6 bg-purple-800 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-red-600 transition"
          >
            Reset Game
          </button>
        </div>

        {/* Kolom 2 (Kanan) - Chat Log */}
        <div className="flex-1 min-w-[300px] h-full p-4 border-l border-gray-700 overflow-auto">
          {chatLog.map((log, index) => (
            <div
              key={index}
              className="p-3 bg-gray-900 rounded-lg shadow-md mb-2 text-left flex flex-col items-start max-w-[500px] break-words"
            >
              <span className="font-semibold text-blue-400">{log.player}:</span>
              <p className="text-sm text-gray-300">{log.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

}

export default App;