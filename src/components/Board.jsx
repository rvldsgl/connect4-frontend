// src/components/Board.jsx
const Board = ({ board, onClick }) => {
  return (
    <div className="grid grid-rows-6 gap-1 bg-blue-200 p-4 rounded-lg shadow-lg">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-7 gap-1">
          {row.map((cell, colIndex) => (
            <div 
              key={colIndex} 
              className="w-12 h-12 bg-white flex items-center justify-center text-2xl rounded-full cursor-pointer"
              onClick={() => onClick(colIndex)}
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board;
