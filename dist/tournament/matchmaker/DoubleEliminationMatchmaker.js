"use strict";
exports.__esModule = true;
var Match_1 = require("../match/Match");
var DoubleEliminationMatchmaker = (function () {
    function DoubleEliminationMatchmaker(players, options, sendStats) {
        var _this = this;
        this.players = players;
        this.options = options;
        this.sendStats = sendStats;
        this.processedMatches = [];
        this.playerStats = {};
        this.players.forEach(function (player) {
            _this.playerStats[player.token] = { player: player, wins: 0, losses: 0 };
        });
        this.waitingForFinal = [];
    }
    DoubleEliminationMatchmaker.prototype.isFinished = function () {
        return this.finished;
    };
    DoubleEliminationMatchmaker.prototype.getRemainingMatches = function (tournamentStats) {
        var _this = this;
        this.tournamentStats = tournamentStats;
        var matches;
        if (tournamentStats.matches.length === 0) {
            var matchResult = this.matchPlayers(this.players);
            this.zeroLossOddPlayer = matchResult.oddPlayer;
            return matchResult.matches;
        }
        var justPlayedMatches = this.tournamentStats.matches.filter(function (match) {
            return _this.processedMatches.indexOf(match.uuid) === -1;
        });
        justPlayedMatches.forEach(function (match) {
            _this.processedMatches.push(match.uuid);
            var winnerToken = match.players[match.stats.winner].token;
            var loserToken = match.players[match.stats.winner === 1 ? 0 : 1].token;
            _this.playerStats[winnerToken].wins++;
            _this.playerStats[loserToken].losses++;
        });
        if (justPlayedMatches.length === 1 && this.waitingForFinal.length < 1) {
            this.finished = true;
            return [];
        }
        var zeroLossPlayers = [];
        var oneLossPlayers = [];
        for (var playerToken in this.playerStats) {
            var stats = this.playerStats[playerToken];
            if (stats.losses === 0 && this.waitingForFinal.indexOf(stats.player) === -1) {
                zeroLossPlayers.push(stats.player);
            }
            else if (stats.losses === 1 && this.waitingForFinal.indexOf(stats.player) === -1) {
                oneLossPlayers.push(stats.player);
            }
        }
        if (this.zeroLossOddPlayer != null) {
            zeroLossPlayers.unshift(this.zeroLossOddPlayer);
            delete this.zeroLossOddPlayer;
        }
        if (this.oneLossOddPlayer != null) {
            oneLossPlayers.unshift(this.oneLossOddPlayer);
            delete this.oneLossOddPlayer;
        }
        if (zeroLossPlayers.length > 1) {
            var matchResult = this.matchPlayers(zeroLossPlayers);
            matches.push.apply(matches, matchResult.matches);
            this.zeroLossOddPlayer = matchResult.oddPlayer;
        }
        else if (zeroLossPlayers.length === 1) {
            this.waitingForFinal.push(zeroLossPlayers[0]);
        }
        if (oneLossPlayers.length > 1) {
            var matchResult = this.matchPlayers(oneLossPlayers);
            matches.push.apply(matches, matchResult.matches);
            this.oneLossOddPlayer = matchResult.oddPlayer;
        }
        else if (oneLossPlayers.length === 1) {
            this.waitingForFinal.push(oneLossPlayers[0]);
        }
        if (this.waitingForFinal.length > 1) {
            var matchResult = this.matchPlayers(this.waitingForFinal);
            matches.push.apply(matches, matchResult.matches);
            this.waitingForFinal = [];
        }
        return matches;
    };
    DoubleEliminationMatchmaker.prototype.matchPlayers = function (players) {
        var matches = [];
        var oddPlayer;
        if (players.length < 2) {
            return {};
        }
        if (players.length % 2 !== 0) {
            oddPlayer = players[players.length - 1];
            players = players.slice(0, -1);
        }
        for (var i = 0; i < players.length; i += 2) {
            var playerA = players[i];
            var playerB = players[i + 1];
            matches.push(new Match_1["default"]([playerA, playerB], this.options, this.sendStats));
        }
        return { matches: matches, oddPlayer: oddPlayer };
    };
    DoubleEliminationMatchmaker.prototype.getRanking = function () {
        var _this = this;
        return this.players
            .sort(function (a, b) { return _this.playerStats[b.token].wins - _this.playerStats[a.token].wins; })
            .map(function (player) { return player.token; });
    };
    return DoubleEliminationMatchmaker;
}());
exports["default"] = DoubleEliminationMatchmaker;
//# sourceMappingURL=DoubleEliminationMatchmaker.js.map