import { NextRequest, NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const slug = params.id; // 'a', 'b', or 'c'
}

/**
 * type get/ add / update
 * 新增- 初始状态,答案
 * 更新-
 * @param request
 * @returns
 */

export const POST = async (request: NextRequest) => {
  const requestJson = await request.json();

  const type: string = requestJson["type"];
  const gameId = requestJson["gameId"];
  switch (type) {
    case "get":
      let gameData;
      if (gameId) {
        gameData = await prisma.gameState.findFirst({
          where: {
            id: gameId,
          },
          include: {
            actions: true,
          },
        });
      } else {
        gameData = await prisma.gameState.findMany();
        return NextResponse.json(gameData);
      }

      return NextResponse.json({ ...gameData });
    case "add":
      const initialBoard: string = requestJson["initialBoard"];
      const solutionBoard: string = requestJson["solutionBoard"];
      const difficulty: string = requestJson["difficulty"];
      const addData = await prisma.gameState.create({
        data: {
          difficulty: difficulty,
          initialBoard: initialBoard,
          solutionBoard: solutionBoard,
          boardState: initialBoard,
        },
      });
      return NextResponse.json({ gameData: addData });
    case "update":
      const boardState: string = requestJson["boardState"];
      const userActions: { position: number; value: string }[] =
        requestJson["userSteps"];
      await prisma.gameState.update({
        where: {
          id: gameId,
        },
        data: {
          boardState: boardState,
          updatedAt: new Date(),
        },
      });
      // 数组为空,那么直接清空
      if (userActions.length === 0) {
        // 如果为空，则删除所有相关的 UserAction 记录
        await prisma.userAction.deleteMany({
          where: {
            gameStateId: gameId,
          },
        });
      }

      // 更新现有的userActions
      for (const action of userActions) {
        const existingAction = await prisma.userAction.findFirst({
          where: {
            gameStateId: gameId,
            position: action.position,
          },
        });

        if (existingAction) {
          await prisma.userAction.update({
            where: {
              id: existingAction.id,
            },
            data: {
              value: action.value,
              timestamp: new Date(),
            },
          });
        } else {
          await prisma.userAction.create({
            data: {
              gameStateId: gameId,
              position: action.position,
              value: action.value,
              timestamp: new Date(),
            },
          });
        }
      }
      return NextResponse.json({ status: 0, desc: "success" });
    default:
      break;
  }

  const data = await prisma.gameState.findFirst({
    where: {
      id: type,
    },
  });

  return NextResponse.json({ item: data });
};
