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

export const POST = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const requestJson = await request.json();

  const type: string = requestJson["type"];
  const gameId = params.id;
  switch (type) {
    case "get":
      const gameData = await prisma.gameState.findFirst({
        where: {
          id: gameId,
        },
        include: {
          actions: true,
        },
      });
      return NextResponse.json({ gameData: gameData });
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
              value: parseInt(action.value),
              timestamp: new Date(),
            },
          });
        } else {
          await prisma.userAction.create({
            data: {
              gameStateId: gameId,
              position: action.position,
              value: parseInt(action.value),
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
