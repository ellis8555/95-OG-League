import fs from "node:fs/promises"
import readOgRomBinaryGameState from "./gameStateParsing/game-state/read-og-rom-game-state.js"

const buffer = await fs.readFile("./NHL_95.state30")

const gameFileBuffer = buffer.buffer.slice(
  buffer.byteOffset,
  buffer.byteOffset + buffer.byteLength
);

const gameData = await readOgRomBinaryGameState(gameFileBuffer)

console.log(gameData.data)