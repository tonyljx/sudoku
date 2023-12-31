"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { getSudoku } from "sudoku-gen";

export default function Home() {
  const emptyPuzzle = Array(81).fill("");
  const [puzzle, setPuzzle] = useState(emptyPuzzle);
  // 数组答案
  const [solution, setSolution] = useState("");

  const isValidSudoku = (board: string[], solution: string): boolean => {
    // 将用户的当前棋盘转换为字符串表示，空格用破折号表示
    const userSolution = board
      .map((value) => (value === "" ? "-" : value))
      .join("");

    console.log("user colution " + userSolution);

    // 直接比较用户的棋盘字符串和解决方案字符串
    return userSolution === solution;
  };

  const generateSudoku = () => {
    // 获取特定难度的数独游戏
    const { puzzle, solution, difficulty } = getSudoku("easy");

    // 将字符串转换为数组，其中'-'变为空字符串
    const newPuzzle = puzzle
      .split("")
      .map((char) => (char === "-" ? "" : char));

    // 更新 state
    setPuzzle(newPuzzle);

    // 如果你需要使用解决方案或难度，你可以将它们保存到状态中
    setSolution(solution);
    // setDifficulty(difficulty);
  };

  const handleInputChange = (index: number, value: string): void => {
    const newPuzzle: string[] = [...puzzle];
    newPuzzle[index] = value;
    setPuzzle(newPuzzle);
  };

  const checkSudoku = () => {
    if (isValidSudoku(puzzle, solution)) {
      alert("合法的数独");
    } else {
      alert("非法的数独");
    }
  };

  const handleShowAnswer = () => {
    const userSolution = solution.split("");
    setPuzzle(userSolution);
  };

  console.log(solution);

  return (
    <main className="flex min-h-screen flex-col items-center   p-24">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Sudoku
      </h2>
      <div className="flex flex-col items-center justify-center p-4">
        <div className="grid grid-cols-9 gap-1">
          {puzzle.map((value, index) => (
            <div
              key={index}
              className={`w-10 h-10 md:w-16 md:h-16 flex justify-center items-center border `}
            >
              <input
                type="text"
                inputMode="numeric"
                pattern="[1-9]*"
                className="w-full h-full text-center text-lg border-none focus:ring-0 focus:outline-none"
                value={value}
                onChange={(e) => handleInputChange(index, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 space-x-2">
          <Button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={generateSudoku}
          >
            生成数独
          </Button>
          <Button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={checkSudoku}
          >
            验证数独
          </Button>

          <Button onClick={handleShowAnswer}>显示答案</Button>
        </div>
      </div>
    </main>
  );
}
