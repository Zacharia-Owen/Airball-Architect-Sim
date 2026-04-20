import { runGameSimulation } from "./simulation/runGameSim";
import { Team } from "./domain/Team";



const mockTeam = (id: number, name: string): Team => ({
    id,
    name,
    players: [
        {
            id: id * 10 + 1,
            firstName: "John",
            lastName: "Doe",
            position: "PG",
            ratings: {
                shooting: 80,
                finishing: 85,
                defense: 75,
                passing: 70,
                rebounding: 65,
                stamina: 90,
                speed: 85,
                dribbling: 80,
                overall: 80,
            },
        },
        {
            id: id * 10 + 2,
            firstName: "Jane",
            lastName: "Smith",
            position: "SG",
            ratings: {
                shooting: 75,
                finishing: 70,
                defense: 80,
                passing: 75,
                rebounding: 70,
                stamina: 85,
                speed: 80,
                dribbling: 75,
                overall: 75,
            },
        },
        {
            id: id * 10 + 3,
            firstName: "Mike",
            lastName: "Jones",
            position: "SF",
            ratings: {
                shooting: 70,
                finishing: 75,
                defense: 70,
                passing: 65,
                rebounding: 75,
                stamina: 80,
                speed: 75,
                dribbling: 70,
                overall: 72,
            },
        },
        {
            id: id * 10 + 4,
            firstName: "Chris",
            lastName: "Lee",
            position: "PF",
            ratings: {
                shooting: 65,
                finishing: 80,
                defense: 75,
                passing: 60,
                rebounding: 85,
                stamina: 85,
                speed: 70,
                dribbling: 65,
                overall: 73,
            },
        },
        {
            id: id * 10 + 5,
            firstName: "Alex",
            lastName: "Brown",
            position: "C",
            ratings: {
                shooting: 55,
                finishing: 85,
                defense: 80,
                passing: 55,
                rebounding: 90,
                stamina: 80,
                speed: 60,
                dribbling: 55,
                overall: 72,
            },
        },
    ],
});

const home = mockTeam(1, "Home Team");
const away = mockTeam(2, "Away Team");

const result = runGameSimulation(home, away);

console.log("Final Score:", result.score);
console.log("Quarter Scores:", result.quarterScores);
console.log("Box Score:", result.boxScore);
console.log("Quarters played:", result.quarter);

// checking shooting percentages
// console.log("BASE_TWO_POINT_PCT:", SHOT_TYPES.BASE_TWO_POINT_PCT);
// console.log("BASE_THREE_POINT_PCT:", SHOT_TYPES.BASE_THREE_POINT_PCT);
// console.log("Total possessions:", Object.values(result.boxScore)
//     .reduce((sum, p) => sum + p.fieldGoalsAttempted, 0));
// console.log("Total turnovers:", Object.values(result.boxScore)
//     .reduce((sum, p) => sum + p.turnovers, 0));

