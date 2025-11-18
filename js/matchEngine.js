// Football Manager 2K26 - Match Engine
// 2D Match Simulation with Attribute-Based Logic

class MatchEngine {
    constructor(canvas, homeTeam, awayTeam, homeFormation, awayFormation, tactics) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        this.homeTeam = homeTeam;
        this.awayTeam = awayTeam;
        this.homeFormation = homeFormation;
        this.awayFormation = awayFormation;
        this.tactics = tactics;

        this.matchTime = 0;
        this.matchRunning = false;
        this.speed = 1;
        this.possession = 'home';

        this.score = { home: 0, away: 0 };
        this.events = [];

        this.ball = {
            x: this.width / 2,
            y: this.height / 2,
            vx: 0,
            vy: 0,
            holder: null
        };

        this.homePlayers = [];
        this.awayPlayers = [];

        this.animationId = null;
        this.lastUpdate = Date.now();

        this.initializePlayers();
    }

    initializePlayers() {
        // Initialize home team players with positions
        this.homeFormation.positions.forEach((pos, index) => {
            const baseX = (pos.x / 100) * (this.width - 100) + 50;
            const baseY = (pos.y / 100) * (this.height - 80) + 40;

            this.homePlayers.push({
                id: `home_${index}`,
                positionId: pos.id,
                role: pos.role,
                baseX: baseX,
                baseY: baseY,
                x: baseX,
                y: baseY,
                vx: 0,
                vy: 0,
                team: 'home',
                stamina: 100,
                hasBall: false
            });
        });

        // Initialize away team players (mirrored positions)
        this.awayFormation.positions.forEach((pos, index) => {
            const baseX = (pos.x / 100) * (this.width - 100) + 50;
            const baseY = (100 - pos.y) / 100 * (this.height - 80) + 40; // Mirror Y position

            this.awayPlayers.push({
                id: `away_${index}`,
                positionId: pos.id,
                role: pos.role,
                baseX: baseX,
                baseY: baseY,
                x: baseX,
                y: baseY,
                vx: 0,
                vy: 0,
                team: 'away',
                stamina: 100,
                hasBall: false
            });
        });

        // Give ball to home team initially
        const centerMid = this.homePlayers.find(p => p.role.includes('Midfielder'));
        if (centerMid) {
            this.ball.holder = centerMid;
            centerMid.hasBall = true;
        }
    }

    start() {
        this.matchRunning = true;
        this.addEvent(0, 'Kick-off', 'Match started!', 'start');
        this.animate();
    }

    pause() {
        this.matchRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    animate() {
        if (!this.matchRunning) return;

        const now = Date.now();
        const deltaTime = (now - this.lastUpdate) / 1000;
        this.lastUpdate = now;

        // Update match time (90 minutes = 90 seconds in real time at 1x speed)
        this.matchTime += deltaTime * this.speed;

        if (this.matchTime >= 90) {
            this.endMatch();
            return;
        }

        // Update game state
        this.updatePositions(deltaTime);
        this.updateBall(deltaTime);
        this.checkForEvents();

        // Render
        this.render();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    updatePositions(deltaTime) {
        const allPlayers = [...this.homePlayers, ...this.awayPlayers];

        allPlayers.forEach(player => {
            // Reduce stamina over time
            player.stamina -= deltaTime * 0.05;
            player.stamina = Math.max(20, player.stamina);

            if (player.hasBall) {
                // Player with ball moves toward goal
                const targetY = player.team === 'home' ? 50 : this.height - 50;
                const dx = 0;
                const dy = targetY - player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 5) {
                    player.vx = (dx / distance) * 80 * (player.stamina / 100);
                    player.vy = (dy / distance) * 80 * (player.stamina / 100);
                }
            } else {
                // Players return to base position or track ball
                const toBallX = this.ball.x - player.x;
                const toBallY = this.ball.y - player.y;
                const ballDist = Math.sqrt(toBallX * toBallX + toBallY * toBallY);

                const toBaseX = player.baseX - player.x;
                const toBaseY = player.baseY - player.y;
                const baseDist = Math.sqrt(toBaseX * toBaseX + toBaseY * toBaseY);

                // If ball is close and it's their team's possession, move toward it
                if (ballDist < 150 && this.possession === player.team) {
                    player.vx = (toBallX / ballDist) * 60 * (player.stamina / 100);
                    player.vy = (toBallY / ballDist) * 60 * (player.stamina / 100);
                } else if (baseDist > 20) {
                    // Return to base position
                    player.vx = (toBaseX / baseDist) * 50;
                    player.vy = (toBaseY / baseDist) * 50;
                } else {
                    player.vx *= 0.9;
                    player.vy *= 0.9;
                }
            }

            // Update position
            player.x += player.vx * deltaTime;
            player.y += player.vy * deltaTime;

            // Keep players on pitch
            player.x = Math.max(40, Math.min(this.width - 40, player.x));
            player.y = Math.max(40, Math.min(this.height - 40, player.y));
        });
    }

    updateBall(deltaTime) {
        if (this.ball.holder) {
            // Ball follows holder
            this.ball.x = this.ball.holder.x;
            this.ball.y = this.ball.holder.y;
        } else {
            // Ball moves freely
            this.ball.x += this.ball.vx * deltaTime;
            this.ball.y += this.ball.vy * deltaTime;

            // Friction
            this.ball.vx *= 0.95;
            this.ball.vy *= 0.95;

            // Stop if too slow
            if (Math.abs(this.ball.vx) < 5 && Math.abs(this.ball.vy) < 5) {
                this.ball.vx = 0;
                this.ball.vy = 0;

                // Assign to nearest player
                const nearest = this.findNearestPlayer(this.ball.x, this.ball.y);
                if (nearest && this.distance(nearest, this.ball) < 30) {
                    this.ball.holder = nearest;
                    nearest.hasBall = true;
                    this.possession = nearest.team;
                }
            }
        }

        // Check boundaries
        if (this.ball.x < 30 || this.ball.x > this.width - 30) {
            this.handleThrowIn();
        }

        if (this.ball.y < 30 || this.ball.y > this.height - 30) {
            this.handleGoalOrGoalKick();
        }
    }

    checkForEvents() {
        // Random event generation based on match state
        const minute = Math.floor(this.matchTime);

        if (Math.random() < 0.001 * this.speed) { // Pass attempt
            this.attemptPass();
        }

        if (Math.random() < 0.0005 * this.speed) { // Shot attempt
            this.attemptShot();
        }

        if (Math.random() < 0.0002 * this.speed) { // Tackle
            this.attemptTackle();
        }

        if (Math.random() < 0.00005 * this.speed && minute > 10) { // Card
            this.issueCard();
        }
    }

    attemptPass() {
        if (!this.ball.holder) return;

        const passer = this.ball.holder;
        const teammates = passer.team === 'home' ? this.homePlayers : this.awayPlayers;

        // Find best pass target
        const possibleTargets = teammates
            .filter(p => p.id !== passer.id)
            .sort((a, b) => {
                // Prefer players closer to goal and not too far
                const distA = this.distance(passer, a);
                const distB = this.distance(passer, b);
                const goalDistA = passer.team === 'home' ? a.y : this.height - a.y;
                const goalDistB = passer.team === 'home' ? b.y : this.height - b.y;

                return (distA * 0.5 + goalDistA) - (distB * 0.5 + goalDistB);
            });

        if (possibleTargets.length === 0) return;

        const target = possibleTargets[0];
        const passDistance = this.distance(passer, target);

        // Pass success calculation (simplified)
        const passSuccess = Math.random() < (0.8 - passDistance / 500);

        if (passSuccess) {
            // Successful pass
            passer.hasBall = false;
            this.ball.holder = null;

            const dx = target.x - passer.x;
            const dy = target.y - passer.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            this.ball.vx = (dx / dist) * 300;
            this.ball.vy = (dy / dist) * 300;

            // Schedule ball arrival at target
            setTimeout(() => {
                if (!this.ball.holder && this.matchRunning) {
                    const currentDist = this.distance(target, this.ball);
                    if (currentDist < 50) {
                        this.ball.holder = target;
                        target.hasBall = true;
                    }
                }
            }, (passDistance / 300) * 1000);

        } else {
            // Failed pass - interception
            const opponents = passer.team === 'home' ? this.awayPlayers : this.homePlayers;
            const interceptor = this.findNearestPlayer(
                (passer.x + target.x) / 2,
                (passer.y + target.y) / 2,
                opponents
            );

            passer.hasBall = false;
            this.ball.holder = interceptor;
            interceptor.hasBall = true;
            this.possession = interceptor.team;

            this.addEvent(
                Math.floor(this.matchTime),
                'Interception',
                `Pass intercepted!`,
                'tackle'
            );
        }
    }

    attemptShot() {
        if (!this.ball.holder) return;

        const shooter = this.ball.holder;
        const goalY = shooter.team === 'home' ? 40 : this.height - 40;
        const goalCenterX = this.width / 2;

        const distToGoal = Math.sqrt(
            Math.pow(shooter.x - goalCenterX, 2) +
            Math.pow(shooter.y - goalY, 2)
        );

        // Only shoot if close enough
        if (distToGoal > 300) return;

        // Shot success based on distance and angle
        const shotPower = 0.6 - (distToGoal / 600);
        const goalScored = Math.random() < shotPower;

        shooter.hasBall = false;
        this.ball.holder = null;

        if (goalScored) {
            // GOAL!
            if (shooter.team === 'home') {
                this.score.home++;
            } else {
                this.score.away++;
            }

            this.addEvent(
                Math.floor(this.matchTime),
                'GOAL!',
                `${shooter.team === 'home' ? this.homeTeam.name : this.awayTeam.name} scores!`,
                'goal'
            );

            // Reset positions
            this.resetPositions();

        } else {
            // Missed shot
            this.addEvent(
                Math.floor(this.matchTime),
                'Shot',
                'Shot goes wide!',
                'shot'
            );

            // Ball goes to goalkeeper
            const gk = shooter.team === 'home' ?
                this.awayPlayers.find(p => p.positionId === 'GK') :
                this.homePlayers.find(p => p.positionId === 'GK');

            if (gk) {
                this.ball.holder = gk;
                gk.hasBall = true;
                this.possession = gk.team;
            }
        }
    }

    attemptTackle() {
        if (!this.ball.holder) return;

        const ballHolder = this.ball.holder;
        const opponents = ballHolder.team === 'home' ? this.awayPlayers : this.homePlayers;

        const nearestOpponent = this.findNearestPlayer(ballHolder.x, ballHolder.y, opponents);

        if (nearestOpponent && this.distance(ballHolder, nearestOpponent) < 40) {
            const tackleSuccess = Math.random() < 0.5;

            if (tackleSuccess) {
                // Successful tackle
                ballHolder.hasBall = false;
                this.ball.holder = nearestOpponent;
                nearestOpponent.hasBall = true;
                this.possession = nearestOpponent.team;

                this.addEvent(
                    Math.floor(this.matchTime),
                    'Tackle',
                    'Ball won!',
                    'tackle'
                );
            }
        }
    }

    issueCard() {
        const allPlayers = [...this.homePlayers, ...this.awayPlayers];
        const player = allPlayers[Math.floor(Math.random() * allPlayers.length)];

        const isRed = Math.random() < 0.1;
        const cardType = isRed ? 'Red Card' : 'Yellow Card';

        this.addEvent(
            Math.floor(this.matchTime),
            cardType,
            `${player.positionId} receives ${cardType.toLowerCase()}!`,
            isRed ? 'red-card' : 'card'
        );
    }

    handleThrowIn() {
        // Reset ball to nearest player
        const nearest = this.findNearestPlayer(this.ball.x, this.ball.y);
        if (nearest) {
            this.ball.x = Math.max(50, Math.min(this.width - 50, this.ball.x));
            this.ball.holder = nearest;
            nearest.hasBall = true;
            this.ball.vx = 0;
            this.ball.vy = 0;
        }
    }

    handleGoalOrGoalKick() {
        // Simplified - just reset
        const gk = this.ball.y < this.height / 2 ?
            this.homePlayers.find(p => p.positionId === 'GK') :
            this.awayPlayers.find(p => p.positionId === 'GK');

        if (gk) {
            this.ball.holder = gk;
            gk.hasBall = true;
            this.ball.vx = 0;
            this.ball.vy = 0;
        }
    }

    resetPositions() {
        // Reset all players to base positions
        [...this.homePlayers, ...this.awayPlayers].forEach(player => {
            player.x = player.baseX;
            player.y = player.baseY;
            player.vx = 0;
            player.vy = 0;
            player.hasBall = false;
        });

        // Ball to center
        this.ball.x = this.width / 2;
        this.ball.y = this.height / 2;
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.ball.holder = null;
    }

    distance(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    findNearestPlayer(x, y, playersList = null) {
        const players = playersList || [...this.homePlayers, ...this.awayPlayers];
        let nearest = null;
        let minDist = Infinity;

        players.forEach(player => {
            const dist = Math.sqrt(
                Math.pow(player.x - x, 2) +
                Math.pow(player.y - y, 2)
            );
            if (dist < minDist) {
                minDist = dist;
                nearest = player;
            }
        });

        return nearest;
    }

    addEvent(minute, type, description, className) {
        this.events.push({ minute, type, description, className });

        // Dispatch event for UI update
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('matchEvent', {
                detail: { minute, type, description, className }
            }));
        }
    }

    endMatch() {
        this.matchRunning = false;
        this.pause();

        this.addEvent(
            90,
            'Full Time',
            `Final Score: ${this.homeTeam.name} ${this.score.home} - ${this.score.away} ${this.awayTeam.name}`,
            'end'
        );
    }

    render() {
        const ctx = this.ctx;

        // Draw pitch
        this.drawPitch();

        // Draw players
        this.homePlayers.forEach(player => {
            this.drawPlayer(player, '#DA291C'); // Red
        });

        this.awayPlayers.forEach(player => {
            this.drawPlayer(player, '#6CABDD'); // Blue
        });

        // Draw ball
        this.drawBall();

        // Draw match info overlay
        this.drawMatchInfo();
    }

    drawPitch() {
        const ctx = this.ctx;

        // Gradient grass
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#0a8c0a');
        gradient.addColorStop(0.5, '#0f9b0f');
        gradient.addColorStop(1, '#0a8c0a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Pitch markings (simplified)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;

        // Border
        ctx.strokeRect(20, 20, this.width - 40, this.height - 40);

        // Center line
        ctx.beginPath();
        ctx.moveTo(20, this.height / 2);
        ctx.lineTo(this.width - 20, this.height / 2);
        ctx.stroke();

        // Center circle
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height / 2, 60, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawPlayer(player, color) {
        const ctx = this.ctx;

        // Shadow
        ctx.beginPath();
        ctx.arc(player.x + 2, player.y + 2, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();

        // Player circle
        ctx.beginPath();
        ctx.arc(player.x, player.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = player.hasBall ? '#FFD700' : color;
        ctx.fill();

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Position label
        ctx.fillStyle = 'white';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(player.positionId, player.x, player.y);

        // Stamina indicator
        const staminaWidth = 20;
        const staminaHeight = 3;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(player.x - staminaWidth / 2, player.y + 18, staminaWidth, staminaHeight);

        const staminaColor = player.stamina > 60 ? '#4CAF50' :
                             player.stamina > 30 ? '#FF9800' : '#F44336';
        ctx.fillStyle = staminaColor;
        ctx.fillRect(
            player.x - staminaWidth / 2,
            player.y + 18,
            staminaWidth * (player.stamina / 100),
            staminaHeight
        );
    }

    drawBall() {
        const ctx = this.ctx;

        // Shadow
        ctx.beginPath();
        ctx.arc(this.ball.x + 1, this.ball.y + 1, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fill();

        // Ball
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    drawMatchInfo() {
        const ctx = this.ctx;

        // Time display
        const minute = Math.floor(this.matchTime);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(this.width / 2 - 40, 10, 80, 30);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${minute}'`, this.width / 2, 30);

        // Possession indicator
        const possessionText = this.possession === 'home' ? this.homeTeam.name : this.awayTeam.name;
        ctx.font = '12px Arial';
        ctx.fillText(`Possession: ${possessionText}`, this.width / 2, this.height - 10);
    }

    getMatchState() {
        return {
            time: Math.floor(this.matchTime),
            score: { ...this.score },
            events: [...this.events],
            possession: this.possession,
            running: this.matchRunning
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MatchEngine };
}
