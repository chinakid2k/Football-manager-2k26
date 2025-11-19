// Football Manager 2K26 - Training Engine
// Manages player development, fitness, and training schedules

class TrainingEngine {
    constructor() {
        this.trainingSchedule = {
            monday: { focus: 'fitness', intensity: 'medium' },
            tuesday: { focus: 'technical', intensity: 'high' },
            wednesday: { focus: 'tactical', intensity: 'medium' },
            thursday: { focus: 'recovery', intensity: 'low' },
            friday: { focus: 'match-prep', intensity: 'medium' },
            saturday: { focus: 'match-day', intensity: 'none' },
            sunday: { focus: 'rest', intensity: 'none' }
        };

        this.developmentRates = {
            young: 1.5,    // 16-21 years
            prime: 0.5,    // 22-28 years
            declining: -0.3 // 29+ years
        };
    }

    trainPlayers(players, staff) {
        const day = new Date().getDay();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const todaysTraining = this.trainingSchedule[days[day]];

        if (!todaysTraining || todaysTraining.intensity === 'none') {
            return { message: 'Rest day - no training', players: [] };
        }

        const updatedPlayers = [];

        players.forEach(player => {
            const updates = this.processPlayerTraining(player, todaysTraining, staff);
            if (updates.improved.length > 0 || updates.fitness !== player.fitness) {
                updatedPlayers.push({
                    player: player.name,
                    updates
                });
            }
        });

        return {
            message: `${todaysTraining.focus} training completed (${todaysTraining.intensity} intensity)`,
            players: updatedPlayers
        };
    }

    processPlayerTraining(player, training, staff) {
        const updates = { improved: [], fitness: player.fitness || 100 };

        // Calculate training effectiveness based on staff
        const coachQuality = this.getCoachQuality(staff, training.focus);
        const baseImprovement = this.getBaseImprovement(player.age);

        // Fitness management
        if (training.intensity === 'high') {
            updates.fitness = Math.max(75, (player.fitness || 100) - 5);
        } else if (training.intensity === 'medium') {
            updates.fitness = Math.max(80, (player.fitness || 100) - 2);
        } else if (training.intensity === 'low' || training.focus === 'recovery') {
            updates.fitness = Math.min(100, (player.fitness || 100) + 10);
        }

        // Attribute improvements (chance-based)
        const improvementChance = 0.05 * coachQuality * baseImprovement;

        const attributesToTrain = this.getTrainingAttributes(training.focus);

        attributesToTrain.forEach(attr => {
            if (Math.random() < improvementChance) {
                const currentValue = player.attributes[attr] || 100;

                // Can't exceed 198
                if (currentValue < 198) {
                    const improvement = Math.floor(Math.random() * 3) + 1;
                    player.attributes[attr] = Math.min(198, currentValue + improvement);

                    updates.improved.push({
                        attribute: attr,
                        from: currentValue,
                        to: player.attributes[attr]
                    });

                    // Update overall rating
                    this.recalculateOverall(player);
                }
            }
        });

        // Update player's fitness
        player.fitness = updates.fitness;

        return updates;
    }

    getCoachQuality(staff, focus) {
        // Find relevant coach
        let quality = 1.0;

        staff.forEach(member => {
            if (focus === 'fitness' && member.role.includes('Fitness')) {
                quality = member.attributes.fitness / 150;
            } else if (focus === 'tactical' && member.role.includes('Tactical')) {
                quality = member.attributes.tactical / 150;
            } else if (focus === 'technical' && member.role.includes('Technical')) {
                quality = member.attributes.technical / 150;
            }
        });

        return Math.max(0.8, Math.min(1.5, quality));
    }

    getBaseImprovement(age) {
        if (age <= 21) return this.developmentRates.young;
        if (age <= 28) return this.developmentRates.prime;
        return this.developmentRates.declining;
    }

    getTrainingAttributes(focus) {
        const attributeMap = {
            fitness: ['stamina', 'naturalFitness', 'strength', 'pace', 'acceleration'],
            technical: ['dribbling', 'passing', 'firstTouch', 'technique', 'finishing'],
            tactical: ['decisions', 'positioning', 'anticipation', 'vision', 'teamwork'],
            'match-prep': ['concentration', 'workRate', 'decisions'],
            recovery: [] // No attribute improvements on recovery
        };

        return attributeMap[focus] || [];
    }

    recalculateOverall(player) {
        // Recalculate overall rating based on key attributes
        const attrs = player.attributes;
        const keyAttributes = [
            attrs.pace, attrs.dribbling, attrs.passing, attrs.finishing,
            attrs.technique, attrs.decisions, attrs.positioning, attrs.stamina
        ];

        const average = keyAttributes.reduce((sum, val) => sum + (val || 100), 0) / keyAttributes.length;
        player.overall = Math.floor(average);
    }

    developYouthPlayer(player, months = 1) {
        // Accelerated development for youth players
        if (player.age > 21) return;

        const developmentPoints = months * 2 * this.developmentRates.young;
        const attributesToImprove = Math.floor(developmentPoints);

        for (let i = 0; i < attributesToImprove; i++) {
            const attributes = Object.keys(player.attributes);
            const randomAttr = attributes[Math.floor(Math.random() * attributes.length)];

            if (player.attributes[randomAttr] < 198) {
                player.attributes[randomAttr] = Math.min(198, player.attributes[randomAttr] + 1);
            }
        }

        this.recalculateOverall(player);
    }

    setTrainingFocus(day, focus, intensity) {
        if (this.trainingSchedule[day]) {
            this.trainingSchedule[day] = { focus, intensity };
            return true;
        }
        return false;
    }

    getTrainingReport(players) {
        // Generate training report
        const report = {
            improving: [],
            declining: [],
            injured: [],
            tired: []
        };

        players.forEach(player => {
            const age = player.age;
            const fitness = player.fitness || 100;

            if (age <= 23) {
                report.improving.push(player.name);
            } else if (age >= 30) {
                report.declining.push(player.name);
            }

            if (fitness < 70) {
                report.tired.push(player.name);
            }
        });

        return report;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TrainingEngine };
}
