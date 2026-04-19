import { Rating } from "./Rating";

export type Position = "PG" | "SG" | "SF" | "PF" | "C";

export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  position: Position;
  ratings: Rating;
}