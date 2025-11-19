// Football Manager 2K26 - Morale & Form Engine
// Player morale, form, team chemistry

class MoraleEngine {
    constructor() {
        this.teamMorale = 7.0; // Out of 10
        this.teamChemistry = 75; // Out of 100

        this.moraleFactors = {
            results: 0.3,
            playingTime: 0.25,
            wages: 0.15,
            clubReputation: 0.1,
            managerRelationship: 0.1,
            facilities: 0.1
        };
    }

    // Initialize player morale and form
    initializePlayer(player) {
        if (!player.morale) player.morale = 7.0; // Default good morale
        if (!player.form) player.form = 7.0; // Default average form
        if (!player.fitness) player.fitness = 100;
        if (!player.minutesPlayed) player.minutesPlayed = 0;
        if (!player.matchesPlayed) player.matchesPlayed = 0;

        return player;
    }

    // Update morale after match
    updateMoraleAfterMatch(player, result, played, performance) {
        let moraleChange = 0;

        // Result impact
        if (result === 'win') {
            moraleChange += 0.5;
        } else if (result === 'draw') {
            moraleChange += 0.1;
        } else {
            moraleChange -= 0.3;
        }

        // Playing time impact
        if (played) {
            moraleChange += 0.3;

            // Performance impact
            if (performance >= 8) {
                moraleChange += 0.5;
            } else if (performance >= 7) {
                moraleChange += 0.2;
            } else if (performance < 5) {
                moraleChange -= 0.2;
            }
        } else {
            // Didn't play - morale drops slightly
            moraleChange -= 0.2;
        }

        player.morale = Math.max(1, Math.min(10, player.morale + moraleChange));

        return {
            player: player.name,
            oldMorale: player.morale - moraleChange,
            newMorale: player.morale,
            change: moraleChange
        };
    }

    // Update player form based on recent performances
    updateForm(player, recentPerformances) {
        // Form is average of last 5 performances
        if (recentPerformances.length === 0) return;

        const avgPerformance = recentPerformances.reduce((sum, p) => sum + p, 0) / recentPerformances.length;

        // Gradually shift form toward recent performance
        const formChange = (avgPerformance - player.form) * 0.3;
        player.form = Math.max(1, Math.min(10, player.form + formChange));

        // Form affects attributes temporarily
        const formModifier = (player.form - 7) / 10; // -0.6 to +0.3

        return {
            player: player.name,
            form: player.form,
            modifier: formModifier,
            trend: formChange > 0 ? 'improving' : formChange < 0 ? 'declining' : 'stable'
        };
    }

    // Get form-adjusted attributes
    getFormAdjustedAttributes(player) {
        const formModifier = (player.form - 7) / 10;
        const adjustedAttrs = {};

        Object.keys(player.attributes).forEach(attr => {
            const baseValue = player.attributes[attr];
            const adjustment = Math.floor(baseValue * formModifier * 0.1); // Max 10% swing
            adjustedAttrs[attr] = Math.max(50, Math.min(198, baseValue + adjustment));
        });

        return adjustedAttrs;
    }

    // Morale impact on performance
    getMoraleModifier(player) {
        const morale = player.morale || 7;

        if (morale >= 9) return 1.1; // Very happy - 10% boost
        if (morale >= 8) return 1.05; // Happy - 5% boost
        if (morale >= 6) return 1.0; // Content - no change
        if (morale >= 4) return 0.95; // Unhappy - 5% penalty
        return 0.9; // Very unhappy - 10% penalty
    }

    // Update team morale
    updateTeamMorale(players) {
        const totalMorale = players.reduce((sum, p) => sum + (p.morale || 7), 0);
        this.teamMorale = totalMorale / players.length;

        return this.teamMorale;
    }

    // Calculate team chemistry
    calculateTeamChemistry(players, formation) {
        let chemistry = 0;

        // Nationality links
        const nationalities = {};
        players.forEach(p => {
            nationalities[p.nationality] = (nationalities[p.nationality] || 0) + 1;
        });

        Object.values(nationalities).forEach(count => {
            if (count >= 3) chemistry += 5; // Multiple players from same nation
        });

        // Club links (players who've played together before)
        const clubs = {};
        players.forEach(p => {
            clubs[p.club] = (clubs[p.club] || 0) + 1;
        });

        Object.values(clubs).forEach(count => {
            if (count >= 5) chemistry += 10; // Core of team from same club
        });

        // Age diversity (good mix of experience and youth)
        const avgAge = players.reduce((sum, p) => sum + p.age, 0) / players.length;
        if (avgAge >= 24 && avgAge <= 28) chemistry += 10; // Ideal age range

        // Position compatibility (players in natural positions)
        // Simplified - assume 80% are in correct positions
        chemistry += 30;

        // Morale boost
        chemistry += Math.floor((this.teamMorale - 5) * 5);

        // Time together (simplified - increases over season)
        chemistry += 10;

        this.teamChemistry = Math.max(0, Math.min(100, chemistry));

        return this.teamChemistry;
    }

    // Handle player complaints
    handleComplaint(player, type) {
        const complaints = {
            playingTime: {
                message: `${player.name} is unhappy with his playing time`,
                moraleImpact: -1.0,
                resolution: 'Promise more game time or consider transfer listing'
            },
            wage: {
                message: `${player.name} wants a better contract`,
                moraleImpact: -0.8,
                resolution: 'Offer new contract or risk losing player'
            },
            ambition: {
                message: `${player.name} is concerned about the club's ambition`,
                moraleImpact: -1.2,
                resolution: 'Make significant signings or improve league position'
            },
            relationship: {
                message: `${player.name} has fallen out with teammates`,
                moraleImpact: -1.5,
                resolution: 'Team talk or consider selling player'
            }
        };

        const complaint = complaints[type];

        if (complaint) {
            player.morale = Math.max(1, player.morale + complaint.moraleImpact);
            return complaint;
        }

        return null;
    }

    // Team talk before match
    teamTalk(approach, players) {
        let moraleBoost = 0;

        const approaches = {
            aggressive: {
                description: 'Fired up the team with an aggressive team talk',
                moraleChange: 0.3,
                risk: 0.2 // 20% chance of backfiring
            },
            calm: {
                description: 'Gave a calm, measured team talk',
                moraleChange: 0.2,
                risk: 0.0
            },
            passionate: {
                description: 'Delivered a passionate, inspirational speech',
                moraleChange: 0.5,
                risk: 0.3
            },
            none: {
                description: 'No team talk',
                moraleChange: 0,
                risk: 0
            }
        };

        const selectedApproach = approaches[approach];

        if (!selectedApproach) return { success: false };

        // Risk of backfiring
        if (Math.random() < selectedApproach.risk) {
            // Backfired!
            moraleBoost = -0.3;
            players.forEach(p => {
                p.morale = Math.max(1, p.morale + moraleBoost);
            });

            return {
                success: false,
                message: `Your team talk backfired! Players seem unmotivated.`,
                moraleChange: moraleBoost
            };
        }

        // Success
        moraleBoost = selectedApproach.moraleChange;
        players.forEach(p => {
            p.morale = Math.min(10, p.morale + moraleBoost);
        });

        return {
            success: true,
            message: selectedApproach.description,
            moraleChange: moraleBoost
        };
    }

    // Get morale report
    getMoraleReport(players) {
        const happy = players.filter(p => (p.morale || 7) >= 8).length;
        const content = players.filter(p => (p.morale || 7) >= 6 && (p.morale || 7) < 8).length;
        const unhappy = players.filter(p => (p.morale || 7) < 6).length;

        const inForm = players.filter(p => (p.form || 7) >= 8).length;
        const averageForm = players.filter(p => (p.form || 7) >= 6 && (p.form || 7) < 8).length;
        const poorForm = players.filter(p => (p.form || 7) < 6).length;

        return {
            teamMorale: this.teamMorale,
            teamChemistry: this.teamChemistry,
            moraleSummary: {
                happy,
                content,
                unhappy
            },
            formSummary: {
                inForm,
                averageForm,
                poorForm
            },
            concerns: this.identifyConcerns(players)
        };
    }

    identifyConcerns(players) {
        const concerns = [];

        // Low morale players
        const lowMorale = players.filter(p => (p.morale || 7) < 5);
        if (lowMorale.length > 0) {
            concerns.push({
                type: 'morale',
                severity: 'high',
                message: `${lowMorale.length} player(s) have very low morale`,
                players: lowMorale.map(p => p.name)
            });
        }

        // Poor form players
        const poorForm = players.filter(p => (p.form || 7) < 5);
        if (poorForm.length > 0) {
            concerns.push({
                type: 'form',
                severity: 'medium',
                message: `${poorForm.length} player(s) are in poor form`,
                players: poorForm.map(p => p.name)
            });
        }

        // Low team chemistry
        if (this.teamChemistry < 50) {
            concerns.push({
                type: 'chemistry',
                severity: 'high',
                message: `Team chemistry is very low (${this.teamChemistry}/100)`
            });
        }

        return concerns;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MoraleEngine };
}
