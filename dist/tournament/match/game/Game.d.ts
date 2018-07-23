import { PlayerNumber } from "@socialgorithm/ultimate-ttt/dist/model/constants";
import * as q from 'q';
import Player from '../../model/Player';
import GameOptions from './GameOptions';
import GameEvents from './GameEvents';
export default class Game {
    private players;
    private options;
    private events;
    private log;
    private game;
    private currentPlayerIndex;
    private gameStart;
    private winnerIndex;
    private state;
    private deferred;
    constructor(players: Player[], options: GameOptions, events: GameEvents, log: any);
    playGame(): q.Promise<boolean>;
    handlePlayerMove(player: Player): (data: string) => void;
    handleGameWon(winnerIndex: PlayerNumber): void;
    handleGameTied(): void;
    private handleGameEnd;
    private parseMove;
    private writeMove;
    private switchPlayer;
    private playerZero;
    private playerOne;
}