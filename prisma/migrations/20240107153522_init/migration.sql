-- CreateTable
CREATE TABLE "GameState" (
    "id" TEXT NOT NULL,
    "boardState" TEXT NOT NULL,
    "initialBoard" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAction" (
    "id" SERIAL NOT NULL,
    "gameStateId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserAction" ADD CONSTRAINT "UserAction_gameStateId_fkey" FOREIGN KEY ("gameStateId") REFERENCES "GameState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
