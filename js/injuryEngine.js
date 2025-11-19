// Football Manager 2K26 - Injury Engine
// Realistic injury system with recovery management

class InjuryEngine {
    constructor() {
        this.injuryTypes = [
            { name: 'Hamstring Strain', minDays: 14, maxDays: 28, severity: 'moderate' },
            { name: 'Ankle Sprain', minDays: 7, maxDays: 21, severity: 'minor' },
            { name: 'Knee Injury', minDays: 21, maxDays: 90, severity: 'serious' },
            { name: 'Muscle Tear', minDays: 14, maxDays: 42, severity: 'moderate' },
            { name: 'Groin Strain', minDays: 10, maxDays: 28, severity: 'moderate' },
            { name: 'Back Problem', minDays: 7, maxDays: 21, severity: 'minor' },
            { name: 'Broken Bone', minDays: 60, maxDays: 120, severity: 'severe' },
            { name: 'Concussion', minDays: 7, maxDays: 14, severity: 'serious' },
            { name: 'ACL Tear', minDays: 180, maxDays: 270, severity: 'severe' },
            { name: 'Fatigue', minDays: 3, maxDays: 7, severity: 'minor' },
            { name: 'Bruised Ribs', minDays: 7, maxDays: 14, severity: 'minor' },
            { name: 'Shoulder Dislocation', minDays: 21, maxDays: 42, severity: 'moderate' }
        ];

        this.injuredPlayers = [];
    }

    checkForInjury(player, situation = 'match') {
        // Injury probability factors
        const baseRisk = situation === 'match' ? 0.02 : 0.005; // 2% in match, 0.5% in training
        const injuryProneness = (player.injuryProneness || 5) / 10;
        const fitnessLevel = (player.fitness || 100) / 100;
        const ageModifier = player.age > 30 ? 1.3 : player.age < 23 ? 0.8 : 1.0;

        const injuryChance = baseRisk * injuryProneness * (2 - fitnessLevel) * ageModifier;

        if (Math.random() < injuryChance) {
            return this.inflictInjury(player, situation);
        }

        return null;
    }

    inflictInjury(player, situation) {
        // Select injury type based on situation
        let possibleInjuries = [...this.injuryTypes];

        if (situation === 'training') {
            // Training injuries are usually less severe
            possibleInjuries = possibleInjuries.filter(i =>
                i.severity === 'minor' || i.severity === 'moderate'
            );
        }

        const injuryType = possibleInjuries[Math.floor(Math.random() * possibleInjuries.length)];
        const daysOut = Math.floor(
            injuryType.minDays + Math.random() * (injuryType.maxDays - injuryType.minDays)
        );

        const injury = {
            playerId: player.id,
            playerName: player.name,
            type: injuryType.name,
            severity: injuryType.severity,
            daysOut: daysOut,
            daysRemaining: daysOut,
            recoveryDate: this.calculateRecoveryDate(daysOut),
            occurredOn: new Date()
        };

        this.injuredPlayers.push(injury);
        player.injured = true;
        player.injury = injury;

        return injury;
    }

    calculateRecoveryDate(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date;
    }

    updateInjuries(currentDate) {
        const recovered = [];

        this.injuredPlayers = this.injuredPlayers.filter(injury => {
            injury.daysRemaining--;

            if (injury.daysRemaining <= 0) {
                recovered.push(injury);
                return false; // Remove from injured list
            }

            return true;
        });

        return recovered;
    }

    treatInjury(playerId, medicalStaffQuality = 1.0) {
        const injury = this.injuredPlayers.find(i => i.playerId === playerId);

        if (!injury) return null;

        // Better medical staff reduces recovery time
        const reductionDays = Math.floor(1 + Math.random() * 3 * medicalStaffQuality);
        injury.daysRemaining = Math.max(1, injury.daysRemaining - reductionDays);
        injury.recoveryDate = this.calculateRecoveryDate(injury.daysRemaining);

        return {
            player: injury.playerName,
            daysReduced: reductionDays,
            newRecoveryDate: injury.recoveryDate
        };
    }

    getInjuryReport() {
        return {
            total: this.injuredPlayers.length,
            minor: this.injuredPlayers.filter(i => i.severity === 'minor').length,
            moderate: this.injuredPlayers.filter(i => i.severity === 'moderate').length,
            serious: this.injuredPlayers.filter(i => i.severity === 'serious').length,
            severe: this.injuredPlayers.filter(i => i.severity === 'severe').length,
            injuries: this.injuredPlayers.map(i => ({
                player: i.playerName,
                type: i.type,
                severity: i.severity,
                daysRemaining: i.daysRemaining,
                recoveryDate: i.recoveryDate
            }))
        };
    }

    rushRecovery(playerId, riskLevel = 0.5) {
        const injury = this.injuredPlayers.find(i => i.playerId === playerId);

        if (!injury) return null;

        // Rushing recovery has a risk of re-injury
        const reinjuryRisk = riskLevel * 0.3;

        if (Math.random() < reinjuryRisk) {
            // Re-injured! Extend recovery time
            const extension = Math.floor(injury.daysOut * 0.5);
            injury.daysRemaining += extension;

            return {
                success: false,
                message: `${injury.playerName} has suffered a setback and will be out for ${extension} more days!`,
                player: injury.playerName
            };
        }

        // Successfully rushed
        const reduction = Math.floor(injury.daysRemaining * 0.3);
        injury.daysRemaining = Math.max(1, injury.daysRemaining - reduction);

        return {
            success: true,
            message: `${injury.playerName} has responded well to treatment. Recovery time reduced by ${reduction} days.`,
            player: injury.playerName,
            daysReduced: reduction
        };
    }

    clearPlayerInjury(player) {
        this.injuredPlayers = this.injuredPlayers.filter(i => i.playerId !== player.id);
        player.injured = false;
        player.injury = null;
    }

    getReturnDate(playerId) {
        const injury = this.injuredPlayers.find(i => i.playerId === playerId);
        return injury ? injury.recoveryDate : null;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InjuryEngine };
}
