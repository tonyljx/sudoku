"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Save, SaveIcon, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "react-hot-toast";
import { getSudoku } from "sudoku-gen";

type TUserStep = {
  index: number;
  value: string;
};

export default function Home() {
  const emptyPuzzle = Array(81).fill("");

  // 生成的数独
  const [puzzle, setPuzzle] = useState<string[]>(emptyPuzzle);
  // 数组答案
  const [solution, setSolution] = useState("");

  // 用户解题思路
  const [userSteps, setUserSteps] = useState<TUserStep[]>([]);

  // 创建dom应用, 这样可以撤回的时候更好的聚焦
  // 创建一个包含 81 个引用的数组，每个输入元素一个
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, puzzle.length);
  }, [puzzle]);

  const isValidSudoku = (board: string[], solution: string): boolean => {
    // 将用户的当前棋盘转换为字符串表示，空格用破折号表示
    const userSolution = board
      .map((value) => (value === "" ? "-" : value))
      .join("");

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
  };

  const handleClearSudoku = () => {
    setPuzzle(emptyPuzzle);
    setSolution("");
    setUserSteps([]);
  };

  const handleInputChange = (index: number, value: string): void => {
    const newPuzzle: string[] = [...puzzle];
    newPuzzle[index] = value;
    setPuzzle(newPuzzle);
    // 设置用户的step
    setUserSteps([...userSteps, { index: index, value: value }]);
  };

  const handleShowAnswer = () => {
    const userSolution = solution.split("");
    setPuzzle(userSolution);
  };

  const handleUndo = () => {
    if (userSteps.length > 0) {
      const lastStepIndex = userSteps[userSteps.length - 1].index;
      const lastStepValue = userSteps[userSteps.length - 1].value;
      // 相当于pop out
      setUserSteps((prev) => prev.slice(0, -1));
      // 具体的输入清除
      setPuzzle((prevArray) =>
        prevArray.map((item, idx) => (idx === lastStepIndex ? "" : item))
      );
      // 焦点到撤回之前的index
      inputRefs.current[lastStepIndex]?.focus();
    }
  };

  const checkSudoku = () => {
    if (isValidSudoku(puzzle, solution)) {
      alert("合法的数独");
    } else {
      alert("非法的数独");
    }
  };

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
                // ref={}
                ref={(el) => (inputRefs.current[index] = el)}
                className={cn(
                  "w-full h-full text-center text-lg border-none focus:ring-0 focus:outline-none focus:bg-slate-100"
                )}
                value={value}
                onChange={(e) => handleInputChange(index, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2 flex flex-col items-center">
          <div className="space-x-2">
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

          <div className="space-x-2 flex items-center">
            <Button variant="secondary">
              <SaveIcon />
            </Button>
            <Button
              variant="secondary"
              onClick={handleUndo}
              className={cn("disabled:cursor-not-allowed")}
              disabled={userSteps.length <= 0}
            >
              <Undo2 />
            </Button>
            <Button variant={"secondary"} onClick={handleClearSudoku}>
              Clear
            </Button>
          </div>
        </div>
        <div className="mt-6">
          {userSteps.map((item) => (
            <p key={item.index} className="flex gap-6">
              <span>Index: {item.index}</span>
              <span>Value: {item.value}</span>
            </p>
          ))}
        </div>
      </div>
      <Toaster />
    </main>
  );
}
