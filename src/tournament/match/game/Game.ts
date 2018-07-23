import UTTT from '@socialgorithm/ultimate-ttt/dist/UTTT';
import {Coords, PlayerNumber, PlayerOrTie} from "@socialgorithm/ultimate-ttt/dist/model/constants";
import * as q from 'q';

import State from "../../model/State";
import * as funcs from '../../../lib/funcs';
import Player from '../../model/Player';
import GameOptions from './GameOptions';
import GameEvents from './GameEvents';

/*
 * A game between two players
 */
export default class Game {
    private game: UTTT;
    private currentPlayerIndex: PlayerNumber;
    private gameStart: [number, number];
    private winnerIndex: PlayerOrTie;
    private state: State;
    private deferred: q.Deferred<boolean>;

    /**
     * Create a game between two players
     * * @param options Options for gameplay
     */
    constructor(private players: Player[], private options: GameOptions, private events: GameEvents, private log: any) {
        this.game = new UTTT();
        this.state = new State();
        this.deferred = q.defer();
    }

    /**
     * Play an individual game between two players
     */
    public playGame(): q.Promise<boolean> {
        this.gameStart = process.hrtime();
        this.currentPlayerIndex = 0;

        this.playerZero().channel.registerHandler('game', this.handlePlayerMove(this.playerZero()));
        this.playerOne().channel.registerHandler('game', this.handlePlayerMove(this.playerOne()));

        this.playerZero().channel.send('init');
        this.playerOne().channel.send('init');
        this.players[this.currentPlayerIndex].channel.send('move');
        return this.deferred.promise;
    }

    /**
     * Handles a specific player move - this returns a function configured for the specified player, it's intended to be used
     * as the callback for the player socket.
     * @param player Player number (0-1)
     * @returns {Function} Move handler with the player number embedded for logging
     */
    public handlePlayerMove(player: Player) {
        return (data: string) => {
            if (this.currentPlayerIndex !== this.players.indexOf(player)) {
                this.log(`Game ${this.state.games}: Player ${player.token} played out of turn (it was ${this.players[this.currentPlayerIndex].token}'s turn)`);
                this.handleGameWon(this.currentPlayerIndex);
                return;
            }
            if (data === 'fail') {
                // this is weird and probably won't ever happen
                this.handleGameWon(this.switchPlayer(this.currentPlayerIndex));
                return;
            }
            try {
                const coords = this.parseMove(data);
                this.game = this.game.move(this.currentPlayerIndex, coords.board, coords.move);

                this.currentPlayerIndex = this.switchPlayer(this.currentPlayerIndex);
                this.players[this.currentPlayerIndex].channel.send(`opponent ${this.writeMove(coords)}`);

                if (this.game.isFinished()) {
                    if(this.game.winner === -1) {
                        this.handleGameTied()
                    } else {
                        this.handleGameWon(this.game.winner);
                    }
                    return;
                }
            } catch (e) {
                //this.log(`Game ${this.state.games}: Player ${this.currentPlayer.token} errored: ${e.message}`);
                this.handleGameWon(this.switchPlayer(this.currentPlayerIndex));
            }
        };
    }

    /**
     * Handle a game win
     * @param winnerIndex Game's winner, used to update the state
     * @param playerDisconnected Whether the game was stopped due to a player disconnecting. If true, the session will be finished
     */
    public handleGameWon(winnerIndex: PlayerNumber) {
        this.handleGameEnd();
        this.winnerIndex = winnerIndex;
    }

    public handleGameTied() {
        this.handleGameEnd()
        this.winnerIndex = -1;
    }

    private handleGameEnd() {
        const hrend = process.hrtime(this.gameStart);
        this.state.times.push(funcs.convertExecTime(hrend[1]));
        this.deferred.resolve(true);
    }

    /**
     * Receive a move from a player and convert it to an object
     * of board and move
     * @param data String received from the client
     * @returns {{board: Array, move: Array}}
     */
    private parseMove(data: string): Coords {
        const [board, move] = data.trim().split(';')
            .map(part => part.split(',').map(n => parseInt(n)) as [number, number]);
        return { board, move };
    }

    /**
     * Encode a move received from a player to be sent to the opponent
     * @param coords {{board: Array, move: Array}}
     * @returns {string}
     */
    private writeMove(coords: Coords) {
        const {board, move} = coords;
        return [board, move].map(p => p.join(',')).join(';');
    }

    /**
     * Type safe way of switching from one player to another
     */
    private switchPlayer(playerNumber: PlayerNumber): PlayerNumber {
        return playerNumber === 0 ? 1 : 0;
    }

    private playerZero(): Player {
        return this.players[0];
    }

    private playerOne(): Player {
        return this.players[1];
    }
}