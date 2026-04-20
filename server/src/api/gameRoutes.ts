import { Router } from 'express';
import { simulateGameController, getGameResultController, getAllTeamsController, getPlayerController, getTeamRosterController,} from './gameControllers';

const router = Router();

// simulate game route
router.post('/simulate', simulateGameController);

// get all teams route
router.get("/teams", getAllTeamsController);

// get team roster route
router.get("/teams/:id/roster", getTeamRosterController);

// get player details route
router.get("/players/:id", getPlayerController);

// game result route
router.get("/:id", getGameResultController);

export default router;