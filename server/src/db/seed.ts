import "dotenv/config";
import { pool } from "./db";

async function seed() {
    try {
        console.log("Seeding database...");

        const teamsResult = await pool.query(`
            INSERT INTO teams (name) VALUES
            ('Chicago Bulls'),
            ('Los Angeles Lakers')
            RETURNING id, name;
        `);

        const bulls = teamsResult.rows[0];
        const lakers = teamsResult.rows[1];

        console.log(`Created teams: ${bulls.name} (${bulls.id}), ${lakers.name} (${lakers.id})`);

        // players for the bulls
        await pool.query(`
            INSERT INTO players 
                 (team_id, first_name, last_name, position, shooting, finishing, defense, passing, rebounding, stamina, speed, dribbling, overall)
             VALUES
                ($1, 'Michael', 'Jordan', 'SG', 97, 92, 90, 85, 80, 95, 98, 95, 96),
                ($1, 'Scottie', 'Pippen', 'SF', 85, 88, 90, 80, 85, 90, 92, 88, 88),
                ($1, 'Dennis', 'Rodman', 'PF', 70, 75, 95, 60, 90, 80, 85, 70, 78),
                ($1, 'Toni', 'Kukoc', 'SF', 80, 82, 85, 75, 80, 85, 88, 80, 82),
                ($1, 'Ron', 'Harper', 'PG', 75, 78, 80, 70, 75, 80, 85, 75, 77),
                ($1, 'Luc', 'Longley', 'C', 65, 70, 80, 60, 75, 70, 80, 65, 70),
                ($1, 'Steve', 'Kerr', 'PG', 60, 65, 70, 80, 60, 75, 80, 70, 70),
                ($1, 'Dickey', 'Simpkins', 'PF', 55, 60, 75, 50, 70, 65, 75, 60, 64),
                ($1, 'Jason', 'Caffey', 'PF', 50, 55, 70, 45, 65, 60, 70, 55, 60),
                ($1, 'Randy', 'Brown', 'SG', 45, 50, 65, 40, 60, 55, 65, 50, 55)
        `, [bulls.id]);

        console.log("Bulls players seeded")

        // players for the lakers
        await pool.query(`
            INSERT INTO players
                (team_id, first_name, last_name, position, shooting, finishing, defense, passing, rebounding, stamina, speed, dribbling, overall)
            VALUES
                ($1, 'Kobe', 'Bryant', 'SG', 95, 90, 88, 82, 72, 93, 95, 93, 93),
                ($1, 'Shaquille', 'ONeal', 'C', 60, 98, 88, 70, 92, 85, 72, 55, 92),
                ($1, 'Derek', 'Fisher', 'PG', 78, 65, 78, 80, 55, 85, 78, 75, 75),
                ($1, 'Robert', 'Horry', 'PF', 78, 72, 78, 70, 75, 80, 72, 65, 75),
                ($1, 'Rick', 'Fox', 'SF', 72, 70, 78, 72, 65, 80, 75, 70, 73),
                ($1, 'Horace', 'Grant', 'PF', 58, 72, 78, 62, 80, 78, 65, 55, 70),
                ($1, 'Brian', 'Shaw', 'PG', 68, 62, 72, 75, 58, 78, 72, 68, 68),
                ($1, 'AC', 'Green', 'PF', 55, 65, 75, 52, 78, 82, 62, 48, 65),
                ($1, 'John', 'Salley', 'C', 52, 62, 70, 50, 70, 72, 58, 45, 62),
                ($1, 'Ron', 'Harper', 'SG', 65, 65, 80, 68, 58, 80, 75, 65, 68)
        `, [lakers.id])

        console.log("Lakers players seeded")

        await pool.query(`
            INSERT INTO games (home_team_id, away_team_id, scheduled_at, is_simulated) 
            VALUES ($1, $2, NOW(), false)
        `, [bulls.id, lakers.id]);

        console.log("Inserted game: Lakers vs Bulls")
        console.log("Database seeding completed!");
    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        await pool.end();
    }
}

seed();