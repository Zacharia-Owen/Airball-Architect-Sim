import { Player } from "./Player";

export interface Team {
  id: number;
  name: string;
  players: Player[];
}