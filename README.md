# EduQ Games Platform

A collection of educational games for Hong Kong students.

## Games

- **MathChampion** (`/MathChampion`) - Math quiz game for practicing arithmetic

## Development

Each game is in the `games/` folder as a standalone Vite + React app.

### Adding a new game

1. Create a new folder in `games/`
2. Set up Vite + React + TypeScript
3. Set `base` in `vite.config.ts` to the game path (e.g., `/newgame/`)
4. Configure Amplify to build from the new app root

## Deployment

Deployed on AWS Amplify with monorepo support.

| Game | Path | App Root |
|------|------|----------|
| MathChampion | /MathChampion | games/mathchampion |
