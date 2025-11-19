// Football Manager 2K26 - Scout Engine
// Player scouting, recommendations, and discovery system

class ScoutEngine {
    constructor() {
        this.scoutingReports = [];
        this.watchlist = [];
        this.scoutingAssignments = [];
        this.knownPlayers = []; // Players scouted before
    }

    // Assign scout to find players
    assignScout(scout, criteria) {
        const assignment = {
            id: Date.now(),
            scout: scout,
            criteria: criteria,
            startDate: new Date(),
            status: 'active',
            reportsGenerated: 0
        };

        this.scoutingAssignments.push(assignment);

        // Generate report after some time
        setTimeout(() => {
            this.generateScoutingReport(assignment);
        }, 100);

        return assignment;
    }

    generateScoutingReport(assignment) {
        const { criteria, scout } = assignment;

        // Scout quality affects number and quality of recommendations
        const scoutQuality = scout.attributes.judging / 198;
        const playersToFind = Math.floor(3 + Math.random() * 7 * scoutQuality);

        const recommendations = this.findPlayersMatchingCriteria(criteria, playersToFind);

        const report = {
            id: Date.now(),
            scoutName: scout.name,
            date: new Date(),
            criteria: criteria,
            recommendations: recommendations.map(player => this.createPlayerReport(player, scout)),
            summary: `Found ${recommendations.length} potential targets`
        };

        this.scoutingReports.push(report);
        assignment.status = 'completed';
        assignment.reportsGenerated++;

        return report;
    }

    findPlayersMatchingCriteria(criteria, count) {
        // This would filter from full player database
        // For now, using a simplified version

        const {
            position,
            minAge,
            maxAge,
            minOverall,
            maxOverall,
            maxValue,
            nationality,
            league
        } = criteria;

        // In real implementation, filter from PLAYER_DATABASE
        // For demo, return random selection
        const mockPlayers = [];

        for (let i = 0; i < count; i++) {
            mockPlayers.push(this.generateMockPlayer(criteria));
        }

        return mockPlayers;
    }

    generateMockPlayer(criteria) {
        const positions = {
            'GK': ['GK'],
            'DEF': ['CB', 'LB', 'RB'],
            'MID': ['CM', 'DM', 'AM'],
            'ATT': ['ST', 'LW', 'RW']
        };

        const names = [
            'João Silva', 'Marco Rossi', 'Pierre Dubois', 'Hans Mueller',
            'Carlos Garcia', 'Jan Kowalski', 'Anders Eriksson', 'Ivan Petrov',
            'Yuki Tanaka', 'Ahmed Hassan', 'David Smith', 'Lucas Santos'
        ];

        const clubs = [
            'Ajax', 'Benfica', 'Porto', 'Sporting', 'Lyon', 'Monaco',
            'Sevilla', 'Valencia', 'Dortmund', 'RB Leipzig', 'Atalanta', 'Roma'
        ];

        const age = criteria.minAge + Math.floor(Math.random() * (criteria.maxAge - criteria.minAge));
        const overall = criteria.minOverall + Math.floor(Math.random() * (criteria.maxOverall - criteria.minOverall));

        return {
            id: Math.floor(Math.random() * 100000),
            name: names[Math.floor(Math.random() * names.length)],
            age: age,
            nationality: criteria.nationality || 'Unknown',
            club: clubs[Math.floor(Math.random() * clubs.length)],
            position: positions[criteria.position] || ['CM'],
            overall: overall,
            potential: Math.min(198, overall + Math.floor(Math.random() * 20)),
            value: Math.floor((overall / 180) * criteria.maxValue * (Math.random() * 0.4 + 0.8)),
            attributes: this.generateRandomAttributes(overall)
        };
    }

    generateRandomAttributes(overall) {
        return {
            pace: Math.floor(overall + (Math.random() * 20 - 10)),
            dribbling: Math.floor(overall + (Math.random() * 20 - 10)),
            passing: Math.floor(overall + (Math.random() * 20 - 10)),
            finishing: Math.floor(overall + (Math.random() * 20 - 10)),
            technique: Math.floor(overall + (Math.random() * 20 - 10)),
            decisions: Math.floor(overall + (Math.random() * 20 - 10)),
            positioning: Math.floor(overall + (Math.random() * 20 - 10)),
            stamina: Math.floor(overall + (Math.random() * 20 - 10))
        };
    }

    createPlayerReport(player, scout) {
        const scoutAccuracy = scout.attributes.judging / 198;

        // Scout might slightly misrate players
        const ratingVariance = Math.floor((Math.random() - 0.5) * 10 * (1 - scoutAccuracy));

        return {
            player: player,
            scoutedOverall: Math.max(100, Math.min(198, player.overall + ratingVariance)),
            scoutedPotential: Math.max(100, Math.min(198, player.potential + ratingVariance)),
            estimatedValue: player.value,
            strengths: this.identifyStrengths(player),
            weaknesses: this.identifyWeaknesses(player),
            recommendation: this.generateRecommendation(player, scoutAccuracy),
            confidence: Math.floor(scoutAccuracy * 100),
            scoutComment: this.generateScoutComment(player, scoutAccuracy)
        };
    }

    identifyStrengths(player) {
        const attrs = player.attributes;
        const strengths = [];

        Object.keys(attrs).forEach(attr => {
            if (attrs[attr] >= player.overall + 10) {
                strengths.push({
                    attribute: attr,
                    value: attrs[attr],
                    rating: 'excellent'
                });
            }
        });

        return strengths.slice(0, 3);
    }

    identifyWeaknesses(player) {
        const attrs = player.attributes;
        const weaknesses = [];

        Object.keys(attrs).forEach(attr => {
            if (attrs[attr] <= player.overall - 10) {
                weaknesses.push({
                    attribute: attr,
                    value: attrs[attr],
                    rating: 'poor'
                });
            }
        });

        return weaknesses.slice(0, 3);
    }

    generateRecommendation(player, scoutAccuracy) {
        const value = player.value;
        const potential = player.potential;
        const age = player.age;

        if (potential >= 190 && age <= 23) {
            return {
                rating: 'must-sign',
                description: 'World-class potential, sign immediately!',
                priority: 'urgent'
            };
        }

        if (potential >= player.overall + 15 && age <= 25) {
            return {
                rating: 'highly-recommended',
                description: 'High potential, great long-term investment',
                priority: 'high'
            };
        }

        if (player.overall >= 180 && age <= 28) {
            return {
                rating: 'recommended',
                description: 'Proven quality, would improve squad',
                priority: 'medium'
            };
        }

        if (value < 5000000) {
            return {
                rating: 'bargain',
                description: 'Good value for money, worth considering',
                priority: 'low'
            };
        }

        return {
            rating: 'monitor',
            description: 'Keep an eye on this player',
            priority: 'low'
        };
    }

    generateScoutComment(player, accuracy) {
        const comments = [
            `${player.name} has impressed in recent matches`,
            `Shows great potential and could develop into a top player`,
            `Technically gifted with room to improve physically`,
            `Consistent performer, rarely has a bad game`,
            `Has the mentality to succeed at the highest level`,
            `Would adapt well to our style of play`,
            `Excellent work rate and team player`
        ];

        return comments[Math.floor(Math.random() * comments.length)];
    }

    // Add player to watchlist
    addToWatchlist(player) {
        if (!this.watchlist.find(p => p.id === player.id)) {
            this.watchlist.push({
                player: player,
                addedDate: new Date(),
                notes: []
            });

            return {
                success: true,
                message: `${player.name} added to watchlist`
            };
        }

        return {
            success: false,
            message: `${player.name} is already on the watchlist`
        };
    }

    removeFromWatchlist(playerId) {
        const index = this.watchlist.findIndex(p => p.player.id === playerId);

        if (index !== -1) {
            const removed = this.watchlist.splice(index, 1)[0];
            return {
                success: true,
                message: `${removed.player.name} removed from watchlist`
            };
        }

        return {
            success: false,
            message: 'Player not found on watchlist'
        };
    }

    // Quick search for specific player
    quickScout(playerName, database) {
        const player = database.find(p =>
            p.name.toLowerCase().includes(playerName.toLowerCase())
        );

        if (player) {
            return {
                success: true,
                player: player,
                report: this.createQuickReport(player)
            };
        }

        return {
            success: false,
            message: 'Player not found'
        };
    }

    createQuickReport(player) {
        return {
            name: player.name,
            age: player.age,
            club: player.club,
            overall: player.overall,
            potential: player.potential,
            value: player.value,
            positions: player.position,
            keyStats: {
                pace: player.attributes.pace,
                shooting: player.attributes.finishing,
                passing: player.attributes.passing,
                defending: player.attributes.tackling
            }
        };
    }

    // Get recommendations based on team needs
    getRecommendations(squad, budget, needPosition) {
        // Analyze squad to find weaknesses
        const weakPositions = this.analyzeSquadWeaknesses(squad);

        const criteria = {
            position: needPosition || weakPositions[0],
            minAge: 18,
            maxAge: 28,
            minOverall: 170,
            maxOverall: 195,
            maxValue: budget,
            nationality: null,
            league: null
        };

        // Create a mock scout
        const mockScout = {
            name: 'Chief Scout',
            attributes: { judging: 180 }
        };

        const assignment = {
            scout: mockScout,
            criteria: criteria
        };

        return this.generateScoutingReport(assignment);
    }

    analyzeSquadWeaknesses(squad) {
        // Count players by position
        const positionCounts = {
            GK: 0,
            DEF: 0,
            MID: 0,
            ATT: 0
        };

        squad.forEach(player => {
            const pos = player.position[0];
            if (pos === 'GK') positionCounts.GK++;
            else if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) positionCounts.DEF++;
            else if (['CM', 'DM', 'AM', 'LM', 'RM'].includes(pos)) positionCounts.MID++;
            else positionCounts.ATT++;
        });

        // Find weakest position
        const sortedPositions = Object.entries(positionCounts)
            .sort((a, b) => a[1] - b[1])
            .map(entry => entry[0]);

        return sortedPositions;
    }

    getScoutingReports() {
        return this.scoutingReports.slice(-10).reverse();
    }

    getWatchlist() {
        return this.watchlist;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ScoutEngine };
}
