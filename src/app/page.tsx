"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoaderIcon, Save, SaveIcon, Undo2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getSudoku } from "sudoku-gen";
import dayjs from "dayjs";

interface IGameState {
  id: string;
  boardState: string;
  initialBoard: string;
  solutionBoard: string;
  difficulty: string;
  createdAt: string;
  // createdAt
  actions: {
    id: number;
    gameStateId: string;
    position: number;
    value: string;
  }[];
}

export default function Home() {
  const emptyPuzzle = Array(81).fill("");

  const [generating, setGenerating] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // const [gameIds, setGameIds] = useState<string[]>();
  const [games, setGames] = useState<IGameState[]>();

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
        }),
      });
      setLoading(false);
      if (!data.ok) {
        toast.error("fetch remote data error");
        return;
      }
      const gameData: IGameState[] = await data.json();
      // const gameIds = gameData.map((item) => item.id);
      // setGameIds(gameIds);
      setGames(gameData);
    }
    fetchRemote();
  }, []);

  const generateSudoku = () => {
    // 获取特定难度的数独游戏
    const { puzzle, solution, difficulty } = getSudoku("easy");
    setGenerating(true);
    // 需要更新state到服务端
    toast.promise(
      fetch("/api/sudoku", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "add",
          difficulty: difficulty,
          initialBoard: puzzle,
          solutionBoard: solution,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            // 如果 HTTP 状态码表示错误，则抛出错误
            throw new Error("Failed to save");
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);
          // 跳转
          toast.success("即将跳转到棋盘路由上");
          setTimeout(() => {
            router.push(`/${data["gameData"]["id"]}`);
          }, 2000);
        })
        .finally(() => {
          setGenerating(false);
        }),
      {
        loading: "Generating...",
        success: "Successfully generate sudoku!",
        error: "Something went wrong",
      }
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center   p-24 ">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Sudoku
      </h2>
      <div className="flex flex-col items-center justify-center p-4 gap-8">
        <Button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={generateSudoku}
        >
          生成数独
        </Button>

        <h3 className="text-2xl font-semibold">数独列表</h3>
        {loading ? (
          <LoaderIcon className="animate-spin text-violet-300" />
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Link
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {games?.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {dayjs(item.createdAt).format("YYYY/MM/DD")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      className="text-violet-600 hover:text-violet-900"
                      href={`/${item.id}`}
                    >
                      {item.id}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          // <div className="flex flex-col gap-3">
          //   <div className="flex gap-2">
          //     <span>Time</span>
          //     <span>Link</span>
          //   </div>
          //   {games?.map((item) => (
          //     <div key={item.id} className="flex gap-2">
          //       <span>{item.createdAt}</span>
          //       <Link
          //         className="hover:text-violet-500 transition-colors duration-150"
          //         href={`/${item.id}`}
          //       >
          //         {item.id}
          //       </Link>
          //     </div>
          //   ))}
          // </div>
        )}
      </div>
      <Toaster />
    </main>
  );
}
