import { GameState } from "../../domain/GameState";
import { OffensiveAction } from "../actions/chooseActions";
import { SeededRNG } from "../rng/SeedRNG";
import { SHOT_TYPES, RATING_SCALE, POINTS, REBOUND } from "../../config/constants";
import { Rating } from "../../domain/Ratings";

export interface PossessionResult {
    pointsScored: number;
    timeElapsed: number;
    shooterID?: string;
    assisted: boolean;
    rebounderID?: string;
    offensiveRebound: boolean;
    stolenBy?: string;
    blockedBy?: string;
}

// getting the average of one rating across active players
function getActiveRatingAverage(
    state: GameState,
    side: "home" | "away",
    rating: keyof Rating
): number {
    const active = state[side].players.filter(p =>
        state[side].activePlayers.includes(p.id.toString())
    );
    return active.reduce((sum, p) => sum + p.ratings[rating], 0) / active.length;
}

// resolving a rebound after a missed shot
function resolveRebound(
    state: GameState,
    offense: "home" | "away",
    defense: "home" | "away",
    rng: SeededRNG
): { offensiveRebound: boolean; rebounderID: string } {
    const offRebRating = getActiveRatingAverage(state, offense, "rebounding");
    const defRebRating = getActiveRatingAverage(state, defense, "rebounding");

    // better rebounding teams have a better chance at offensive rebounds
    const offRebProb = REBOUND.OFFENSIVE_REBOUND_PROB
        + (offRebRating - 50) * RATING_SCALE.REBOUNDING_WEIGHT
        - (defRebRating - 50) * RATING_SCALE.REBOUNDING_WEIGHT;

    const offensiveRebound = rng.next() < offRebProb;
    const reboundingTeam = offensiveRebound ? offense : defense;

    // picking a random player from the rebounding team
    const activePlayers = state[reboundingTeam].players.filter(p =>
        state[reboundingTeam].activePlayers.includes(p.id.toString())
    );
    const rebounder = activePlayers[Math.floor(rng.next() * activePlayers.length)];

    return {
        offensiveRebound,
        rebounderID: rebounder.id.toString()
    };
}

// main resolve function
export function resolvePossession(
    state: GameState,
    action: OffensiveAction,
    offense: "home" | "away",
    defense: "home" | "away",
    rng: SeededRNG
): PossessionResult {

    // turnover
    if (action === "turnover") {

        const defenseActive = state[defense].players.filter(p =>
            state[defense].activePlayers.includes(p.id.toString())
        );

        const avgSpeed = defenseActive.reduce((sum, p) => sum + p.ratings.speed, 0) / defenseActive.length;
        const avgDefense = defenseActive.reduce((sum, p) => sum + p.ratings.defense, 0) / defenseActive.length;

        const stealProb = 0.35
            + (avgSpeed - 50) * RATING_SCALE.SPEED_WEIGHT
            + (avgDefense - 50) * RATING_SCALE.DEFENSE_WEIGHT;

        let stolenBy: string | undefined;
        if (rng.next() < stealProb) {
            // will pick a defender weighted by speed
            const totalWeight = defenseActive.reduce((sum, p) => sum + p.ratings.speed, 0);
            let roll = rng.next() * totalWeight;
            const stealer = defenseActive.find(p => {
                roll -= p.ratings.speed;
                return roll <= 0;
            }) ?? defenseActive[0];

            stolenBy = stealer.id.toString();
        }
        return {
            pointsScored: 0,
            timeElapsed: 8 + Math.floor(rng.next() * 8),
            assisted: false,
            offensiveRebound: false,
            stolenBy,
        }
    };

    // free throw trip
    if (action === "free_throw_trip") {
        const ftRating = getActiveRatingAverage(state, offense, "shooting");
        const ftProb = SHOT_TYPES.BASE_FREE_THROW_PCT
            + (ftRating - 50) * RATING_SCALE.SHOOTING_TWO_WEIGHT;

        // assuming 2 free throws for simplicity
        const ft1 = rng.next() < ftProb ? 1 : 0;
        const ft2 = rng.next() < ftProb ? 1 : 0;
        const pointsScored = (ft1 + ft2) * POINTS.FREE_THROW_MADE;

        return {
            pointsScored,
            timeElapsed: 10 + Math.floor(rng.next() * 10),
            assisted: false,
            offensiveRebound: false
        };
    }


    // two point shot attempt
    if (action === "two_point_attempt") {
        const offensiveFinishing = getActiveRatingAverage(state, offense, "finishing");
        const offShooting = getActiveRatingAverage(state, offense, "shooting");
        const defDefense = getActiveRatingAverage(state, defense, "defense");

        // checking if the shot is blocked
        const defenseActive = state[defense].players.filter(p =>
            state[defense].activePlayers.includes(p.id.toString())
        );

        const blockProb = 0.05
            + (defDefense - 50) * RATING_SCALE.DEFENSE_WEIGHT
            - (offensiveFinishing - 50) * RATING_SCALE.FINISHING_WEIGHT;

        let blockedBy: string | undefined;
        if (rng.next() < blockProb) {
            // will pick a defender weighted by defense rating
            const totalWeight = defenseActive.reduce((sum, p) => sum + p.ratings.defense, 0);
            let roll = rng.next() * totalWeight;
            const blocker = defenseActive.find(p => {
                roll -= p.ratings.defense;
                return roll <= 0;
            }) ?? defenseActive[0];

            blockedBy = blocker.id.toString();
            return {
                pointsScored: 0,
                timeElapsed: 12 + Math.floor(rng.next() * 8),
                assisted: false,
                offensiveRebound: false,
                blockedBy
            };
        }

        // finishing influences the rate at making near the rim
        // defense reduces the chance of making the shot
        const makePct = SHOT_TYPES.BASE_TWO_POINT_PCT
            + (offensiveFinishing - 50) * RATING_SCALE.FINISHING_WEIGHT
            + (offShooting - 50) * RATING_SCALE.SHOOTING_TWO_WEIGHT
            - (defDefense - 50) * RATING_SCALE.DEFENSE_WEIGHT;

        const madeShot = rng.next() < makePct;

        if (madeShot) {
            // checking to see if assited - if the offense has good passing and the shooter has good shooting, there's a better chance of an assist
            const passing = getActiveRatingAverage(state, offense, "passing");
            const assistProb = 0.25 + (passing - 50) * 0.002;
            const assisted = rng.next() < assistProb;

            return {
                pointsScored: POINTS.TWO_POINT_MADE,
                timeElapsed: 12 + Math.floor(rng.next() * 8),
                assisted,
                offensiveRebound: false
            };
        }

        // if missed, resolve rebound
        const { offensiveRebound, rebounderID } = resolveRebound(
            state, offense, defense, rng
        );
        return {
            pointsScored: 0,
            timeElapsed: 12 + Math.floor(rng.next() * 8),
            assisted: false,
            offensiveRebound,
            rebounderID
        };
    }

    // three point shot attempt
    if (action === "three_point_attempt") {
        const offShooting = getActiveRatingAverage(state, offense, "shooting");
        const defDefense = getActiveRatingAverage(state, defense, "defense");

        // checking if the shot is blocked
        const defenseActive = state[defense].players.filter(p =>
            state[defense].activePlayers.includes(p.id.toString())
        );

        const blockProb = 0.02
            + (defDefense - 50) * RATING_SCALE.DEFENSE_WEIGHT;

        let blockedBy: string | undefined;
        if (rng.next() < blockProb) {
            // will pick a defender weighted by defense rating
            const totalWeight = defenseActive.reduce((sum, p) => sum + p.ratings.defense, 0);
            let roll = rng.next() * totalWeight;
            const blocker = defenseActive.find(p => {
                roll -= p.ratings.defense;
                return roll <= 0;
            }) ?? defenseActive[0];

            blockedBy = blocker.id.toString();
            return {
                pointsScored: 0,
                timeElapsed: 12 + Math.floor(rng.next() * 8),
                assisted: false,
                offensiveRebound: false,
                blockedBy
            };
        }

        const makePct = SHOT_TYPES.BASE_THREE_POINT_PCT
            + (offShooting - 50) * RATING_SCALE.SHOOTING_THREE_WEIGHT
            - (defDefense - 50) * RATING_SCALE.DEFENSE_WEIGHT;

        const madeShot = rng.next() < makePct;

        if (madeShot) {
            const passing = getActiveRatingAverage(state, offense, "passing");
            const assistProb = 0.35 + (passing - 50) * 0.004;
            const assisted = rng.next() < assistProb;

            return {
                pointsScored: POINTS.THREE_POINT_MADE,
                timeElapsed: 12 + Math.floor(rng.next() * 8),
                assisted,
                offensiveRebound: false
            };
        }

        // if missed, resolve rebound
        const { offensiveRebound, rebounderID } = resolveRebound(
            state, offense, defense, rng
        );
        return {
            pointsScored: 0,
            timeElapsed: 12 + Math.floor(rng.next() * 8),
            assisted: false,
            offensiveRebound,
            rebounderID
        };
    }

    // default case (shouldn't happen)
    return {
        pointsScored: 0,
        timeElapsed: 10,
        assisted: false,
        offensiveRebound: false
    };
}