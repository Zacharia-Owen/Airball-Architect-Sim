import { Rating } from "./Ratings";

export type Position = "PG" | "SG" | "SF" | "PF" | "C";

export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  position: Position;
  ratings: Rating;
}