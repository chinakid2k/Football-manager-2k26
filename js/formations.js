// Football Manager 2K26 - Formation System
// Supports multiple formations with position-specific coordinates and roles

const FORMATIONS = {
    "4-4-2": {
        name: "4-4-2",
        positions: [
            { id: "GK", x: 50, y: 90, role: "Goalkeeper" },
            { id: "LB", x: 20, y: 75, role: "Full-Back" },
            { id: "CB1", x: 40, y: 80, role: "Centre-Back" },
            { id: "CB2", x: 60, y: 80, role: "Centre-Back" },
            { id: "RB", x: 80, y: 75, role: "Full-Back" },
            { id: "LM", x: 20, y: 50, role: "Winger" },
            { id: "CM1", x: 40, y: 55, role: "Central Midfielder" },
            { id: "CM2", x: 60, y: 55, role: "Central Midfielder" },
            { id: "RM", x: 80, y: 50, role: "Winger" },
            { id: "ST1", x: 40, y: 20, role: "Striker" },
            { id: "ST2", x: 60, y: 20, role: "Striker" }
        ]
    },
    "4-3-3": {
        name: "4-3-3",
        positions: [
            { id: "GK", x: 50, y: 90, role: "Goalkeeper" },
            { id: "LB", x: 20, y: 75, role: "Full-Back" },
            { id: "CB1", x: 40, y: 80, role: "Centre-Back" },
            { id: "CB2", x: 60, y: 80, role: "Centre-Back" },
            { id: "RB", x: 80, y: 75, role: "Full-Back" },
            { id: "CM1", x: 35, y: 55, role: "Central Midfielder" },
            { id: "DM", x: 50, y: 65, role: "Defensive Midfielder" },
            { id: "CM2", x: 65, y: 55, role: "Central Midfielder" },
            { id: "LW", x: 20, y: 25, role: "Winger" },
            { id: "ST", x: 50, y: 15, role: "Striker" },
            { id: "RW", x: 80, y: 25, role: "Winger" }
        ]
    },
    "4-2-3-1": {
        name: "4-2-3-1",
        positions: [
            { id: "GK", x: 50, y: 90, role: "Goalkeeper" },
            { id: "LB", x: 20, y: 75, role: "Full-Back" },
            { id: "CB1", x: 40, y: 80, role: "Centre-Back" },
            { id: "CB2", x: 60, y: 80, role: "Centre-Back" },
            { id: "RB", x: 80, y: 75, role: "Full-Back" },
            { id: "DM1", x: 40, y: 62, role: "Defensive Midfielder" },
            { id: "DM2", x: 60, y: 62, role: "Defensive Midfielder" },
            { id: "LW", x: 20, y: 40, role: "Left Winger" },
            { id: "AM", x: 50, y: 38, role: "Attacking Midfielder" },
            { id: "RW", x: 80, y: 40, role: "Right Winger" },
            { id: "ST", x: 50, y: 15, role: "Striker" }
        ]
    },
    "3-5-2": {
        name: "3-5-2",
        positions: [
            { id: "GK", x: 50, y: 90, role: "Goalkeeper" },
            { id: "CB1", x: 30, y: 78, role: "Centre-Back" },
            { id: "CB2", x: 50, y: 80, role: "Centre-Back" },
            { id: "CB3", x: 70, y: 78, role: "Centre-Back" },
            { id: "LWB", x: 15, y: 60, role: "Wing-Back" },
            { id: "CM1", x: 35, y: 55, role: "Central Midfielder" },
            { id: "DM", x: 50, y: 62, role: "Defensive Midfielder" },
            { id: "CM2", x: 65, y: 55, role: "Central Midfielder" },
            { id: "RWB", x: 85, y: 60, role: "Wing-Back" },
            { id: "ST1", x: 40, y: 20, role: "Striker" },
            { id: "ST2", x: 60, y: 20, role: "Striker" }
        ]
    },
    "4-1-4-1": {
        name: "4-1-4-1",
        positions: [
            { id: "GK", x: 50, y: 90, role: "Goalkeeper" },
            { id: "LB", x: 20, y: 75, role: "Full-Back" },
            { id: "CB1", x: 40, y: 80, role: "Centre-Back" },
            { id: "CB2", x: 60, y: 80, role: "Centre-Back" },
            { id: "RB", x: 80, y: 75, role: "Full-Back" },
            { id: "DM", x: 50, y: 65, role: "Defensive Midfielder" },
            { id: "LM", x: 20, y: 45, role: "Left Midfielder" },
            { id: "CM1", x: 40, y: 50, role: "Central Midfielder" },
            { id: "CM2", x: 60, y: 50, role: "Central Midfielder" },
            { id: "RM", x: 80, y: 45, role: "Right Midfielder" },
            { id: "ST", x: 50, y: 15, role: "Striker" }
        ]
    },
    "3-4-3": {
        name: "3-4-3",
        positions: [
            { id: "GK", x: 50, y: 90, role: "Goalkeeper" },
            { id: "CB1", x: 30, y: 78, role: "Centre-Back" },
            { id: "CB2", x: 50, y: 80, role: "Centre-Back" },
            { id: "CB3", x: 70, y: 78, role: "Centre-Back" },
            { id: "LM", x: 20, y: 55, role: "Left Midfielder" },
            { id: "CM1", x: 40, y: 58, role: "Central Midfielder" },
            { id: "CM2", x: 60, y: 58, role: "Central Midfielder" },
            { id: "RM", x: 80, y: 55, role: "Right Midfielder" },
            { id: "LW", x: 25, y: 25, role: "Left Winger" },
            { id: "ST", x: 50, y: 15, role: "Striker" },
            { id: "RW", x: 75, y: 25, role: "Right Winger" }
        ]
    },
    "5-3-2": {
        name: "5-3-2",
        positions: [
            { id: "GK", x: 50, y: 90, role: "Goalkeeper" },
            { id: "LWB", x: 15, y: 72, role: "Wing-Back" },
            { id: "CB1", x: 30, y: 78, role: "Centre-Back" },
            { id: "CB2", x: 50, y: 80, role: "Centre-Back" },
            { id: "CB3", x: 70, y: 78, role: "Centre-Back" },
            { id: "RWB", x: 85, y: 72, role: "Wing-Back" },
            { id: "CM1", x: 35, y: 52, role: "Central Midfielder" },
            { id: "CM2", x: 50, y: 55, role: "Central Midfielder" },
            { id: "CM3", x: 65, y: 52, role: "Central Midfielder" },
            { id: "ST1", x: 40, y: 20, role: "Striker" },
            { id: "ST2", x: 60, y: 20, role: "Striker" }
        ]
    }
};

// Player Roles and their attributes importance
const PLAYER_ROLES = {
    "Goalkeeper": {
        attributes: ["reflexes", "diving", "handling", "positioning", "communication"],
        description: "Shot-stopper and last line of defense"
    },
    "Full-Back": {
        attributes: ["pace", "stamina", "tackling", "crossing", "positioning"],
        description: "Defensive support with attacking runs"
    },
    "Wing-Back": {
        attributes: ["stamina", "pace", "crossing", "dribbling", "workRate"],
        description: "High energy, covers entire flank"
    },
    "Centre-Back": {
        attributes: ["tackling", "marking", "heading", "positioning", "strength"],
        description: "Central defensive anchor"
    },
    "Defensive Midfielder": {
        attributes: ["tackling", "positioning", "passing", "stamina", "decisions"],
        description: "Shield for defense, distributes play"
    },
    "Central Midfielder": {
        attributes: ["passing", "stamina", "decisions", "technique", "workRate"],
        description: "Box-to-box midfielder, all-round"
    },
    "Attacking Midfielder": {
        attributes: ["creativity", "passing", "vision", "dribbling", "technique"],
        description: "Creates chances, links midfield to attack"
    },
    "Winger": {
        attributes: ["pace", "dribbling", "crossing", "acceleration", "finishing"],
        description: "Wide attacker, takes on defenders"
    },
    "Striker": {
        attributes: ["finishing", "positioning", "pace", "heading", "composure"],
        description: "Main goal scorer"
    }
};

// Tactical Instructions
const TACTICAL_INSTRUCTIONS = {
    passingDirectness: {
        low: "Short passing, build-up play",
        medium: "Balanced passing approach",
        high: "Direct, long balls to attackers"
    },
    tempo: {
        low: "Slow, patient build-up",
        medium: "Moderate pace",
        high: "Fast, counter-attacking style"
    },
    riskTaking: {
        low: "Safe, conservative play",
        medium: "Calculated risk",
        high: "Adventurous, high-risk passes"
    },
    attackingWidth: {
        low: "Narrow, central play",
        medium: "Balanced width",
        high: "Wide, stretching defense"
    },
    pressing: {
        low: "Low block, sit deep",
        medium: "Mid-block press",
        high: "High press, aggressive"
    },
    defensiveLine: {
        low: "Deep defensive line",
        medium: "Standard line",
        high: "High line, offside trap"
    }
};

// Formation renderer
class FormationRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
    }

    drawPitch() {
        const ctx = this.ctx;

        // Draw grass pattern
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#0a8c0a');
        gradient.addColorStop(0.5, '#0f9b0f');
        gradient.addColorStop(1, '#0a8c0a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;

        // Outer border
        ctx.strokeRect(20, 20, this.width - 40, this.height - 40);

        // Center line
        ctx.beginPath();
        ctx.moveTo(20, this.height / 2);
        ctx.lineTo(this.width - 20, this.height / 2);
        ctx.stroke();

        // Center circle
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height / 2, 70, 0, Math.PI * 2);
        ctx.stroke();

        // Center spot
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height / 2, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();

        // Penalty boxes
        const boxWidth = 300;
        const boxHeight = 120;

        // Top box
        ctx.strokeRect((this.width - boxWidth) / 2, 20, boxWidth, boxHeight);
        // Bottom box
        ctx.strokeRect((this.width - boxWidth) / 2, this.height - 20 - boxHeight, boxWidth, boxHeight);

        // Goal areas
        const goalWidth = 150;
        const goalHeight = 50;

        // Top goal area
        ctx.strokeRect((this.width - goalWidth) / 2, 20, goalWidth, goalHeight);
        // Bottom goal area
        ctx.strokeRect((this.width - goalWidth) / 2, this.height - 20 - goalHeight, goalWidth, goalHeight);

        // Penalty spots
        ctx.beginPath();
        ctx.arc(this.width / 2, 20 + 90, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.width / 2, this.height - 20 - 90, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawFormation(formation, assignedPlayers = {}) {
        const ctx = this.ctx;
        const positions = formation.positions;

        positions.forEach(pos => {
            const x = (pos.x / 100) * (this.width - 100) + 50;
            const y = (pos.y / 100) * (this.height - 80) + 40;

            // Draw position circle
            ctx.beginPath();
            ctx.arc(x, y, 25, 0, Math.PI * 2);

            // Color based on position
            if (pos.id === 'GK') {
                ctx.fillStyle = '#FFC107';
            } else if (pos.role.includes('Back') || pos.role.includes('Centre-Back')) {
                ctx.fillStyle = '#2196F3';
            } else if (pos.role.includes('Midfielder') || pos.role.includes('Mid')) {
                ctx.fillStyle = '#4CAF50';
            } else {
                ctx.fillStyle = '#F44336';
            }
            ctx.fill();

            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Draw position label
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(pos.id, x, y - 5);

            // Draw player name if assigned
            if (assignedPlayers[pos.id]) {
                ctx.font = '10px Arial';
                const nameParts = assignedPlayers[pos.id].name.split(' ');
                const lastName = nameParts[nameParts.length - 1];
                ctx.fillText(lastName.substring(0, 10), x, y + 8);
            }

            // Draw role label below
            ctx.font = '9px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillText(pos.role, x, y + 40);
        });
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FORMATIONS, PLAYER_ROLES, TACTICAL_INSTRUCTIONS, FormationRenderer };
}
