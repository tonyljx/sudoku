"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ArrowLeftFromLine,
  Loader2,
  Save,
  SaveIcon,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

type TUserStep = {
  position: number;
  value: string;
};

interface IGameState {
  id: string;
  boardState: string;
  initialBoard: string;
  solutionBoard: string;
  difficulty: string;
  // createdAt
  actions: {
    id: number;
    gameStateId: string;
    position: number;
    value: string;
  }[];
}

// 服务端获取数独
export default function Home({ params }: { params: { gameid: string } }) {
  // 从路由获取远端id
  const gameId = params.gameid;

  const emptyPuzzle = Array(81).fill("");

  const [puzzle, setPuzzle] = useState<string[]>(emptyPuzzle);

  const [solution, setSolution] = useState("");

  const [userSteps, setUserSteps] = useState<TUserStep[]>([]);

  // 创建dom应用, 这样可以撤回的时候更好的聚焦，创建一个包含 81 个引用的数组，每个输入元素一个
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, puzzle.length);
  }, [puzzle]);

  useEffect(() => {
    async function fetchRemote() {
      setLoading(true);
      const data = await fetch("/api/sudoku", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "get",
          gameId: gameId,
        }),
      });
      setLoading(false);
      if (!data.ok) {
        toast.error("fetch remote data error");
        return;
      }
      const gameData: IGameState = await data.json();

      // 将字符串转换为数组，其中'-'变为空字符串
      const newPuzzle = gameData?.boardState
        .split("")
        .map((char) => (char === "-" ? "" : char));
      // 更新 state
      setPuzzle(newPuzzle);
      setSolution(gameData.solutionBoard);

      const userSteps = gameData.actions.map((step) => ({
        position: step.position,
        value: step.value,
      }));
      setUserSteps(userSteps);
    }
    fetchRemote();
  }, []);

  const isValidSudoku = (board: string[], solution: string): boolean => {
    // 将用户的当前棋盘转换为字符串表示，空格用破折号表示
    const userSolution = board
      .map((value) => (value === "" ? "-" : value))
      .join("");

    // 直接比较用户的棋盘字符串和解决方案字符串
    return userSolution === solution;
  };

  const handleInputChange = (index: number, value: string): void => {
    const newPuzzle: string[] = [...puzzle];
    newPuzzle[index] = value;
    setPuzzle(newPuzzle);
    // 设置用户的step
    setUserSteps([...userSteps, { position: index, value: value }]);
  };

  const handleShowAnswer = () => {
    const userSolution = solution.split("");
    setPuzzle(userSolution);
  };

  const handleUndo = () => {
    if (userSteps.length > 0) {
      const lastStepIndex = userSteps[userSteps.length - 1].position;
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
      toast.success("合法的数独");
    } else {
      toast.error("非法的数独");
    }
  };

  const handleClearSudoku = () => {
    setPuzzle(emptyPuzzle);
    setSolution("");
    setUserSteps([]);
  };

  const handleSave = async () => {
    const userSolution = puzzle
      .map((value) => (value === "" ? "-" : value))
      .join("");
    toast.promise(
      fetch("/api/sudoku", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "update",
          gameId: gameId,
          boardState: userSolution,
          userSteps: userSteps,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            // 如果 HTTP 状态码表示错误，则抛出错误
            throw new Error("Failed to save");
          }
          return response.json();
        })
        .then((data) => {}),
      {
        loading: "Save User Move...",
        success: "Successfully save the move!",
        error: "Something went wrong",
      }
    );
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full flex justify-center items-center space-x-4 ">
        <Loader2 className="  text-violet-500 animate-spin absolute top-1/2" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center   p-24">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Sudoku
      </h2>
      <Link href="/" className="mt-2 flex gap-2">
        <ArrowLeftFromLine /> Back to Home Page
      </Link>
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
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={checkSudoku}
            >
              验证数独
            </Button>
            <Button onClick={handleShowAnswer}>显示答案</Button>
          </div>

          <div className="space-x-2 flex items-center">
            <Button variant="secondary" onClick={handleSave}>
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
          <h2 className="text-3xl font-semibold">User Step</h2>
          {userSteps.map((item) => (
            <p key={item.position} className="flex gap-6">
              <span>Index: {item.position}</span>
              <span>Value: {item.value}</span>
            </p>
          ))}
        </div>
      </div>
      <Toaster />
    </main>
  );
}
