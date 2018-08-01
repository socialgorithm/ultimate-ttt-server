import { expect } from 'chai';
import { mock, instance, when } from 'ts-mockito';
import Player from '../../../src/tournament/model/Player';
import DoubleEliminationMatchmaker from '../../../src/tournament/matchmaker/DoubleEliminationMatchmaker';
import Channel from '../../../src/tournament/model/Channel';

describe('Double Elimination Matchmaker', () => {
    const channelMock = mock(Channel)
    const channelStub = instance(channelMock);
    const p1 = new Player('P1', channelStub);
    const p2 = new Player('P2', channelStub);
    const p3 = new Player('P3', channelStub);
    const p4 = new Player('P4', channelStub);
    const p5 = new Player('P5', channelStub);
    const matchOptions = { maxGames: 100, timeout: 100 }
    const sendStats = () => { };

    it('matches players correctly', (done) => {
        const matchmaker = new DoubleEliminationMatchmaker([p1, p2, p3, p4], matchOptions, sendStats);

        //Round 1
        let matches = matchmaker.getRemainingMatches({ started: true, finished: false, matches: [] });
        expect(matches).to.have.lengthOf(2);
        expect(matches[0].players).to.deep.equal([p1, p2]);
        expect(matches[1].players).to.deep.equal([p3, p4]);

        //Round 2
        matches[0].stats.winner = 0; //p1
        matches[1].stats.winner = 1; //p4
        matches = matchmaker.getRemainingMatches({ started: true, finished: false, matches: matches });
        matches.forEach(match => console.log(match.players.map(player => player.token), match.parentMatches))
        expect(matches).to.have.lengthOf(2);
        expect(matches[0].players).to.deep.equal([p1, p4]); //winning bracket
        expect(matches[1].players).to.deep.equals([p2, p3]); //losing bracket

        //Round 3
        matches[0].stats.winner = 1; //p4
        matches[1].stats.winner = 0; //p2
        matches = matchmaker.getRemainingMatches({ started: true, finished: false, matches: matches });
        matches.forEach(match => console.log(match.players.map(player => player.token), match.parentMatches))
        expect(matches).to.have.lengthOf(1);
        expect(matches[0].players).to.deep.equal([p1, p2]);

        //Round 4
        matches[0].stats.winner = 0; //p1
        matches = matchmaker.getRemainingMatches({ started: true, finished: false, matches: matches });
        matches.forEach(match => console.log(match.players.map(player => player.token), match.parentMatches))
        expect(matches).to.have.lengthOf(1);
        expect(matches[0].players).to.deep.equal([p4, p1]);

        done();
    });

    it('matches odd number of players correctly', (done) => {
        const matchmaker = new DoubleEliminationMatchmaker([p1, p2, p3, p4, p5], matchOptions, sendStats);

        //Round 1
        let matches = matchmaker.getRemainingMatches({ started: true, finished: false, matches: [] });
        console.log("round1")
        expect(matches).to.have.lengthOf(2);
        expect(matches[0].players).to.deep.equal([p1, p2]);
        expect(matches[1].players).to.deep.equal([p3, p4]);

        //Round 2
        matches[0].stats.winner = 0; //p1
        matches[1].stats.winner = 0; //p3
        matches = matchmaker.getRemainingMatches({ started: true, finished: false, matches: matches });
        matches.forEach(match => console.log(match.players.map(player => player.token), match.parentMatches))
        console.log("round2")
        expect(matches).to.have.lengthOf(2);
        expect(matches[0].players).to.deep.equal([p5, p1]); //winning bracket
        expect(matches[1].players).to.deep.equals([p2, p4]); //losing bracket

        //Round 3
        matches[0].stats.winner = 0; //p5
        matches[1].stats.winner = 0; //p2
        matches = matchmaker.getRemainingMatches({ started: true, finished: false, matches: matches });
        console.log("round3")
        expect(matches).to.have.lengthOf(2);
        expect(matches[0].players).to.deep.equal([p5, p3]);
        expect(matches[1].players).to.deep.equal([p2, p1]);

        //Round 4
        matches[0].stats.winner = 0; //p5
        matches[1].stats.winner = 0; //p2
        matches = matchmaker.getRemainingMatches({ started: true, finished: false, matches: matches });
        console.log("round4")
        expect(matches).to.have.lengthOf(1);
        expect(matches[0].players).to.deep.equal([p5, p2]);

        //Round 5
        matches[0].stats.winner = 1; //p2
        matches = matchmaker.getRemainingMatches({ started: true, finished: false, matches: matches });
        console.log("round5")
        expect(matches).to.be.empty;

        done();
    });
})