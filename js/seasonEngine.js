// Football Manager 2K26 - Season & Calendar Engine
// Manages fixtures, season progression, and game calendar

class SeasonEngine {
    constructor() {
        this.currentDate = new Date('2026-08-15');
        this.season = '2026/27';
        this.matchday = 1;
        this.fixtures = [];
        this.results = [];
        this.upcomingMatches = [];

        this.teams = [
            'Manchester United', 'Manchester City', 'Liverpool FC', 'Arsenal FC',
            'Chelsea FC', 'Tottenham Hotspur', 'Newcastle United', 'Aston Villa',
            'Brighton & Hove Albion', 'West Ham United', 'Everton FC', 'Leicester City',
            'Wolverhampton Wanderers', 'Fulham FC', 'Crystal Palace', 'Brentford FC',
            'Bournemouth', 'Nottingham Forest', 'Southampton FC', 'Ipswich Town'
        ];

        this.generateFixtures();
    }

    generateFixtures() {
        // Round-robin fixture generation
        const teams = [...this.teams];
        const totalTeams = teams.length;
        const rounds = (totalTeams - 1) * 2; // Home and away

        this.fixtures = [];

        for (let round = 0; round < rounds; round++) {
            const roundFixtures = [];
            const isSecondHalf = round >= (totalTeams - 1);

            for (let i = 0; i < totalTeams / 2; i++) {
                const home = teams[i];
                const away = teams[totalTeams - 1 - i];

                // Alternate home/away in second half
                const fixture = isSecondHalf ?
                    { home: away, away: home, round: round + 1, played: false } :
                    { home: home, away: away, round: round + 1, played: false };

                roundFixtures.push(fixture);
            }

            this.fixtures.push(...roundFixtures);

            // Rotate teams (keep first team fixed)
            const lastTeam = teams.pop();
            teams.splice(1, 0, lastTeam);
        }

        // Assign dates to fixtures (weekly, Saturdays)
        let currentDate = new Date('2026-08-15');
        let fixtureIndex = 0;

        while (fixtureIndex < this.fixtures.length) {
            // Assign 10 matches per matchday
            for (let i = 0; i < 10 && fixtureIndex < this.fixtures.length; i++) {
                this.fixtures[fixtureIndex].date = new Date(currentDate);
                this.fixtures[fixtureIndex].matchday = Math.floor(fixtureIndex / 10) + 1;
                fixtureIndex++;
            }

            // Next matchday is 7 days later
            currentDate.setDate(currentDate.getDate() + 7);
        }
    }

    getNextMatch(team) {
        return this.fixtures.find(f =>
            !f.played && (f.home === team || f.away === team)
        );
    }

    getUpcomingMatches(team, count = 5) {
        return this.fixtures
            .filter(f => !f.played && (f.home === team || f.away === team))
            .slice(0, count);
    }

    getRecentResults(team, count = 5) {
        return this.results
            .filter(r => r.home === team || r.away === team)
            .slice(-count)
            .reverse();
    }

    playMatch(fixture, homeScore, awayScore) {
        fixture.played = true;
        fixture.homeScore = homeScore;
        fixture.awayScore = awayScore;

        this.results.push({
            ...fixture,
            homeScore,
            awayScore
        });

        return {
            result: homeScore > awayScore ? 'win' : homeScore < awayScore ? 'loss' : 'draw',
            home: fixture.home,
            away: fixture.away,
            homeScore,
            awayScore
        };
    }

    advanceDay() {
        this.currentDate.setDate(this.currentDate.getDate() + 1);

        // Check if there are matches today
        const todaysMatches = this.fixtures.filter(f =>
            !f.played &&
            f.date.toDateString() === this.currentDate.toDateString()
        );

        return todaysMatches;
    }

    advanceToNextMatch(team) {
        const nextMatch = this.getNextMatch(team);
        if (nextMatch) {
            this.currentDate = new Date(nextMatch.date);
            return nextMatch;
        }
        return null;
    }

    getLeagueTable() {
        const table = {};

        // Initialize
        this.teams.forEach(team => {
            table[team] = {
                team,
                played: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                goalDifference: 0,
                points: 0
            };
        });

        // Calculate from results
        this.results.forEach(result => {
            const homeTeam = table[result.home];
            const awayTeam = table[result.away];

            homeTeam.played++;
            awayTeam.played++;

            homeTeam.goalsFor += result.homeScore;
            homeTeam.goalsAgainst += result.awayScore;
            awayTeam.goalsFor += result.awayScore;
            awayTeam.goalsAgainst += result.homeScore;

            if (result.homeScore > result.awayScore) {
                homeTeam.won++;
                homeTeam.points += 3;
                awayTeam.lost++;
            } else if (result.homeScore < result.awayScore) {
                awayTeam.won++;
                awayTeam.points += 3;
                homeTeam.lost++;
            } else {
                homeTeam.drawn++;
                awayTeam.drawn++;
                homeTeam.points += 1;
                awayTeam.points += 1;
            }

            homeTeam.goalDifference = homeTeam.goalsFor - homeTeam.goalsAgainst;
            awayTeam.goalDifference = awayTeam.goalsFor - awayTeam.goalsAgainst;
        });

        // Sort by points, then goal difference
        return Object.values(table).sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            return b.goalsFor - a.goalsFor;
        });
    }

    simulateOtherMatches() {
        // Simulate all other matches on current matchday
        const currentMatchday = this.matchday;
        const matchesToSimulate = this.fixtures.filter(f =>
            f.matchday === currentMatchday &&
            !f.played &&
            f.home !== 'Manchester United' &&
            f.away !== 'Manchester United'
        );

        matchesToSimulate.forEach(match => {
            // Simple simulation based on team strength
            const homeStrength = 1 + Math.random() * 0.5;
            const awayStrength = 0.8 + Math.random() * 0.5;

            const homeGoals = Math.floor(Math.random() * 4 * homeStrength);
            const awayGoals = Math.floor(Math.random() * 3 * awayStrength);

            this.playMatch(match, homeGoals, awayGoals);
        });
    }

    getSeasonProgress() {
        const totalMatches = this.teams.length * 2 - 2; // 38 matches per team
        const playedMatches = this.results.filter(r =>
            r.home === 'Manchester United' || r.away === 'Manchester United'
        ).length;

        return {
            matchesPlayed: playedMatches,
            totalMatches: totalMatches,
            percentage: (playedMatches / totalMatches * 100).toFixed(1)
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SeasonEngine };
}
