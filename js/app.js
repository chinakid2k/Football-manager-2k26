// Football Manager 2K26 - Main Application Logic

class FootballManagerApp {
    constructor() {
        this.currentView = 'dashboard';
        this.currentTeam = 'Manchester United';
        this.currentDate = new Date('2026-08-15');
        this.budget = 150000000;
        this.currentFormation = '4-3-3';
        this.tactics = {
            passingDirectness: 50,
            tempo: 50,
            riskTaking: 50,
            attackingWidth: 50,
            pressing: 50,
            defensiveLine: 50
        };

        this.myPlayers = [];
        this.transferPlayers = [];
        this.staff = [];
        this.leagueTable = [];

        // Game Engines
        this.seasonEngine = new SeasonEngine();
        this.trainingEngine = new TrainingEngine();
        this.injuryEngine = new InjuryEngine();
        this.transferEngine = new TransferEngine();
        this.financeEngine = new FinanceEngine(this.budget);
        this.moraleEngine = new MoraleEngine();
        this.scoutEngine = new ScoutEngine();

        this.matchEngine = null;
        this.formationRenderer = null;

        this.newsItems = [];

        this.init();
    }

    init() {
        // Load players
        this.loadPlayers();

        // Initialize player morale and form
        this.myPlayers.forEach(p => this.moraleEngine.initializePlayer(p));

        // Initialize UI
        this.setupNavigation();
        this.setupDashboard();
        this.setupSquadView();
        this.setupTacticsView();
        this.setupMatchView();
        this.setupTransfersView();
        this.setupStaffView();
        this.setupLeagueView();

        // Load saved game if exists
        this.loadGame();

        // Initial render
        this.renderDashboard();
        this.updateHeader();

        // Add initial news
        this.addNews('Season 2026/27 begins! Good luck, manager.');
    }

    loadPlayers() {
        // Load my squad (Manchester United players)
        this.myPlayers = PLAYER_DATABASE.filter(p => p.club === this.currentTeam);

        // Load transfer market (other players)
        this.transferPlayers = PLAYER_DATABASE.filter(p =>
            p.club !== this.currentTeam || p.transferStatus === 'available'
        );

        // Load staff
        this.staff = STAFF_DATABASE;

        // Initialize league table
        this.leagueTable = [...LEAGUE_TABLE];
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');

        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.switchView(view);

                // Update active state
                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    switchView(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

        // Show selected view
        const view = document.getElementById(`${viewName}-view`);
        if (view) {
            view.classList.add('active');
            this.currentView = viewName;

            // Render view-specific content
            switch (viewName) {
                case 'dashboard':
                    this.renderDashboard();
                    break;
                case 'squad':
                    this.renderSquadView();
                    break;
                case 'tactics':
                    this.renderTacticsView();
                    break;
                case 'match':
                    this.renderMatchView();
                    break;
                case 'transfers':
                    this.renderTransfersView();
                    break;
                case 'staff':
                    this.renderStaffView();
                    break;
                case 'league':
                    this.renderLeagueView();
                    break;
            }
        }
    }

    // DASHBOARD VIEW
    setupDashboard() {
        const continueBtn = document.getElementById('continue-to-match');
        continueBtn?.addEventListener('click', () => {
            this.switchView('match');
        });
    }

    renderDashboard() {
        // Update next match info
        const nextMatch = this.seasonEngine.getNextMatch(this.currentTeam);
        if (nextMatch) {
            document.getElementById('next-home-team').textContent = nextMatch.home;
            document.getElementById('next-away-team').textContent = nextMatch.away;
            document.getElementById('next-match-date').textContent = nextMatch.date.toDateString();
        }

        // Update league position
        const table = this.seasonEngine.getLeagueTable();
        const position = table.findIndex(t => t.team === this.currentTeam) + 1;
        document.getElementById('league-position').textContent = `${position}${this.getOrdinalSuffix(position)}`;
        document.getElementById('team-points').textContent = table[position - 1]?.points || 0;

        // Update team morale
        const teamMorale = this.moraleEngine.updateTeamMorale(this.myPlayers);
        document.getElementById('team-morale').textContent = `${teamMorale.toFixed(1)}/10`;

        // Update finances
        const finances = this.financeEngine.getFinancialReport();
        document.getElementById('transfer-budget-dash').textContent = `$${(finances.transferBudget / 1000000).toFixed(0)}M`;
        const wageBill = this.financeEngine.calculateWageBill(this.myPlayers);
        document.getElementById('weekly-wages').textContent = `$${(wageBill.weekly / 1000000).toFixed(1)}M`;
        const summary = this.transferEngine.getTransferSummary();
        document.getElementById('net-spend').textContent = `$${(summary.netSpend / 1000000).toFixed(0)}M`;
        document.getElementById('net-spend').className = summary.netSpend > 0 ? 'negative' : 'positive';

        // Update injuries
        const injuryReport = this.injuryEngine.getInjuryReport();
        const injuryList = document.getElementById('injury-list');
        if (injuryReport.total === 0) {
            injuryList.innerHTML = '<p class="no-injuries">No injuries 🎉</p>';
        } else {
            injuryList.innerHTML = injuryReport.injuries.map(inj => `
                <div class="injury-item">
                    <strong>${inj.player}</strong> - ${inj.type} (${inj.daysRemaining} days)
                </div>
            `).join('');
        }

        // Update news feed
        this.renderNewsFeed();

        // Update squad overview
        const avgAge = (this.myPlayers.reduce((sum, p) => sum + p.age, 0) / this.myPlayers.length).toFixed(1);
        const avgRating = Math.floor(this.myPlayers.reduce((sum, p) => sum + p.overall, 0) / this.myPlayers.length);
        document.getElementById('squad-size').textContent = this.myPlayers.length;
        document.getElementById('avg-age').textContent = avgAge;
        document.getElementById('avg-rating').textContent = avgRating;

        // Update training info
        const day = new Date().getDay();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const todaysTraining = this.trainingEngine.trainingSchedule[days[day]];
        document.getElementById('training-focus').textContent = todaysTraining.focus;
        document.getElementById('training-intensity').textContent = todaysTraining.intensity;
    }

    getOrdinalSuffix(num) {
        const j = num % 10;
        const k = num % 100;
        if (j === 1 && k !== 11) return 'st';
        if (j === 2 && k !== 12) return 'nd';
        if (j === 3 && k !== 13) return 'rd';
        return 'th';
    }

    addNews(message) {
        this.newsItems.unshift({
            date: new Date(),
            message: message
        });

        // Keep only last 20 items
        if (this.newsItems.length > 20) {
            this.newsItems = this.newsItems.slice(0, 20);
        }
    }

    renderNewsFeed() {
        const newsFeed = document.getElementById('news-feed');
        if (!newsFeed || this.newsItems.length === 0) return;

        newsFeed.innerHTML = this.newsItems.map(item => {
            const dateStr = this.isToday(item.date) ? 'Today' : item.date.toLocaleDateString();
            return `
                <div class="news-item">
                    <span class="news-date">${dateStr}</span>
                    <p>${item.message}</p>
                </div>
            `;
        }).join('');
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    // SQUAD VIEW
    setupSquadView() {
        const searchInput = document.getElementById('player-search');
        const positionFilter = document.getElementById('position-filter');
        const sortBy = document.getElementById('sort-by');
        const closeDetail = document.getElementById('close-detail');

        searchInput?.addEventListener('input', () => this.renderSquadView());
        positionFilter?.addEventListener('change', () => this.renderSquadView());
        sortBy?.addEventListener('change', () => this.renderSquadView());
        closeDetail?.addEventListener('click', () => this.closePlayerDetail());
    }

    renderSquadView() {
        const container = document.getElementById('squad-list');
        if (!container) return;

        const searchTerm = document.getElementById('player-search')?.value.toLowerCase() || '';
        const posFilter = document.getElementById('position-filter')?.value || 'all';
        const sortBy = document.getElementById('sort-by')?.value || 'overall';

        // Filter players
        let filteredPlayers = this.myPlayers.filter(player => {
            const matchesSearch = player.name.toLowerCase().includes(searchTerm);
            const matchesPosition = posFilter === 'all' ||
                getPositionCategory(player.position) === posFilter;

            return matchesSearch && matchesPosition;
        });

        // Sort players
        filteredPlayers.sort((a, b) => {
            switch (sortBy) {
                case 'age':
                    return a.age - b.age;
                case 'value':
                    return b.value - a.value;
                case 'wage':
                    return b.wage - a.wage;
                default: // overall
                    return b.overall - a.overall;
            }
        });

        // Render player cards
        container.innerHTML = filteredPlayers.map(player => this.createPlayerCard(player)).join('');

        // Add click handlers
        container.querySelectorAll('.player-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                this.showPlayerDetail(filteredPlayers[index]);
            });
        });
    }

    createPlayerCard(player) {
        const positions = player.position.slice(0, 3).map(pos =>
            `<span class="position-badge">${pos}</span>`
        ).join('');

        const topAttributes = [
            { name: 'PAC', value: player.attributes.pace },
            { name: 'DRI', value: player.attributes.dribbling },
            { name: 'PAS', value: player.attributes.passing },
            { name: 'DEF', value: player.attributes.tackling },
            { name: 'PHY', value: player.attributes.strength },
            { name: 'FIN', value: player.attributes.finishing }
        ].sort((a, b) => b.value - a.value).slice(0, 6);

        return `
            <div class="player-card" data-player-id="${player.id}">
                <div class="player-card-header">
                    <div>
                        <div class="player-name">${player.name}</div>
                        <div class="player-positions">${positions}</div>
                    </div>
                    <div class="player-overall">${player.overall}</div>
                </div>
                <div class="player-info">
                    <div>Age: ${player.age}</div>
                    <div>Nationality: ${player.nationality}</div>
                    <div>Value: $${(player.value / 1000000).toFixed(1)}M</div>
                    <div>Wage: $${(player.wage / 1000).toFixed(0)}K/wk</div>
                </div>
                <div class="player-attributes">
                    ${topAttributes.map(attr => `
                        <div class="attribute">
                            <span class="attribute-name">${attr.name}</span>
                            <span class="attribute-value">${attr.value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    showPlayerDetail(player) {
        const detailPanel = document.getElementById('player-detail');
        const content = document.querySelector('.player-detail-content');

        if (!detailPanel || !content) return;

        const positions = player.position.map(pos =>
            `<span class="position-badge">${pos}</span>`
        ).join('');

        const attributeSections = [
            {
                title: 'Physical',
                attrs: ['pace', 'acceleration', 'stamina', 'strength', 'jumping', 'naturalFitness']
            },
            {
                title: 'Technical',
                attrs: ['dribbling', 'passing', 'firstTouch', 'technique', 'finishing', 'heading']
            },
            {
                title: 'Mental',
                attrs: ['decisions', 'positioning', 'anticipation', 'teamwork', 'workRate', 'concentration']
            },
            {
                title: 'Defensive',
                attrs: ['tackling', 'marking', 'aggression']
            }
        ];

        content.innerHTML = `
            <div class="detail-header">
                <div class="detail-name">${player.name}</div>
                <div class="detail-overall">${player.overall}</div>
                <div class="player-positions">${positions}</div>
                <div>${player.age} years old | ${player.nationality}</div>
                <div>Value: $${(player.value / 1000000).toFixed(1)}M | Wage: $${(player.wage / 1000).toFixed(0)}K/week</div>
            </div>

            ${attributeSections.map(section => `
                <div class="attribute-section">
                    <h3>${section.title}</h3>
                    <div class="attribute-grid">
                        ${section.attrs.map(attr => {
                            const value = player.attributes[attr] || 0;
                            const percentage = (value / 198) * 100;
                            const displayName = attr.replace(/([A-Z])/g, ' $1').trim();

                            return `
                                <div class="attribute-row">
                                    <span>${displayName}</span>
                                    <span>${value}</span>
                                </div>
                                <div class="attribute-bar">
                                    <div class="attribute-fill" style="width: ${percentage}%"></div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `).join('')}
        `;

        detailPanel.classList.remove('hidden');
    }

    closePlayerDetail() {
        const detailPanel = document.getElementById('player-detail');
        if (detailPanel) {
            detailPanel.classList.add('hidden');
        }
    }

    // TACTICS VIEW
    setupTacticsView() {
        const formationSelect = document.getElementById('formation-select');
        formationSelect?.addEventListener('change', (e) => {
            this.currentFormation = e.target.value;
            this.renderTacticsView();
        });

        // Setup sliders
        const sliders = ['passing-directness', 'tempo', 'risk-taking', 'attacking-width', 'pressing', 'defensive-line'];
        sliders.forEach(sliderId => {
            const slider = document.getElementById(sliderId);
            const valueSpan = document.getElementById(sliderId.replace(/-/g, '-').replace('directness', 'value').replace('taking', 'value').replace('width', 'value').replace('pressing', 'value').replace('line', 'value'));

            slider?.addEventListener('input', (e) => {
                const tacticsKey = sliderId.replace(/-/g, '').replace('directness', 'Directness').replace('taking', 'Taking').replace('width', 'Width').replace('line', 'Line');
                this.tactics[tacticsKey] = parseInt(e.target.value);

                if (valueSpan) valueSpan.textContent = e.target.value;
            });
        });

        // Update value displays
        const updates = [
            { slider: 'passing-directness', display: 'passing-value', key: 'passingDirectness' },
            { slider: 'tempo', display: 'tempo-value', key: 'tempo' },
            { slider: 'risk-taking', display: 'risk-value', key: 'riskTaking' },
            { slider: 'attacking-width', display: 'width-value', key: 'attackingWidth' },
            { slider: 'pressing', display: 'pressing-value', key: 'pressing' },
            { slider: 'defensive-line', display: 'defense-value', key: 'defensiveLine' }
        ];

        updates.forEach(({ slider, display, key }) => {
            const sliderEl = document.getElementById(slider);
            const displayEl = document.getElementById(display);
            sliderEl?.addEventListener('input', (e) => {
                this.tactics[key] = parseInt(e.target.value);
                if (displayEl) displayEl.textContent = e.target.value;
            });
        });
    }

    renderTacticsView() {
        const canvas = document.getElementById('formation-canvas');
        if (!canvas) return;

        const formation = FORMATIONS[this.currentFormation];
        if (!formation) return;

        if (!this.formationRenderer) {
            this.formationRenderer = new FormationRenderer(canvas);
        }

        this.formationRenderer.clear();
        this.formationRenderer.drawPitch();
        this.formationRenderer.drawFormation(formation);
    }

    // MATCH VIEW
    setupMatchView() {
        const startBtn = document.getElementById('start-match');
        const playPauseBtn = document.getElementById('play-pause');
        const speedBtn = document.getElementById('match-speed');

        startBtn?.addEventListener('click', () => this.startMatch());
        playPauseBtn?.addEventListener('click', () => this.toggleMatch());
        speedBtn?.addEventListener('click', () => this.cycleSpeed());

        // Listen for match events
        window.addEventListener('matchEvent', (e) => {
            this.addMatchEvent(e.detail);
            this.updateMatchScore();
        });
    }

    renderMatchView() {
        // Just ensure canvas is ready
        const canvas = document.getElementById('match-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#0f9b0f';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    startMatch() {
        const canvas = document.getElementById('match-canvas');
        if (!canvas) return;

        const homeTeam = { name: this.currentTeam };
        const awayTeam = { name: 'Liverpool FC' };
        const homeFormation = FORMATIONS[this.currentFormation];
        const awayFormation = FORMATIONS['4-3-3'];

        this.matchEngine = new MatchEngine(
            canvas,
            homeTeam,
            awayTeam,
            homeFormation,
            awayFormation,
            this.tactics
        );

        // Clear events
        document.getElementById('events-list').innerHTML = '';

        // Update UI
        document.getElementById('home-team').textContent = homeTeam.name;
        document.getElementById('away-team').textContent = awayTeam.name;
        document.getElementById('home-score').textContent = '0';
        document.getElementById('away-score').textContent = '0';
        document.getElementById('match-status').textContent = 'In Progress';

        // Enable controls
        document.getElementById('play-pause').disabled = false;
        document.getElementById('start-match').disabled = true;

        this.matchEngine.start();
    }

    toggleMatch() {
        if (!this.matchEngine) return;

        const btn = document.getElementById('play-pause');

        if (this.matchEngine.matchRunning) {
            this.matchEngine.pause();
            btn.textContent = '▶ Play';
        } else {
            this.matchEngine.matchRunning = true;
            this.matchEngine.lastUpdate = Date.now();
            this.matchEngine.animate();
            btn.textContent = '⏸ Pause';
        }
    }

    cycleSpeed() {
        if (!this.matchEngine) return;

        const speeds = [1, 2, 4, 8];
        const currentIndex = speeds.indexOf(this.matchEngine.speed);
        const nextIndex = (currentIndex + 1) % speeds.length;
        const newSpeed = speeds[nextIndex];

        this.matchEngine.setSpeed(newSpeed);

        const btn = document.getElementById('match-speed');
        btn.textContent = `Speed: ${newSpeed}x`;
    }

    addMatchEvent(event) {
        const eventsList = document.getElementById('events-list');
        if (!eventsList) return;

        const eventDiv = document.createElement('div');
        eventDiv.className = `event ${event.className}`;
        eventDiv.innerHTML = `
            <strong>${event.minute}'</strong> ${event.type}: ${event.description}
        `;

        eventsList.insertBefore(eventDiv, eventsList.firstChild);
    }

    updateMatchScore() {
        if (!this.matchEngine) return;

        const state = this.matchEngine.getMatchState();

        document.getElementById('home-score').textContent = state.score.home;
        document.getElementById('away-score').textContent = state.score.away;
        document.getElementById('match-clock').textContent = `${state.time}'`;
    }

    // TRANSFERS VIEW
    setupTransfersView() {
        const searchInput = document.getElementById('transfer-search');
        const positionFilter = document.getElementById('transfer-position-filter');
        const budgetFilter = document.getElementById('transfer-budget-filter');

        searchInput?.addEventListener('input', () => this.renderTransfersView());
        positionFilter?.addEventListener('change', () => this.renderTransfersView());
        budgetFilter?.addEventListener('change', () => this.renderTransfersView());
    }

    renderTransfersView() {
        const container = document.getElementById('transfer-list');
        if (!container) return;

        const searchTerm = document.getElementById('transfer-search')?.value.toLowerCase() || '';
        const posFilter = document.getElementById('transfer-position-filter')?.value || 'all';
        const budgetFilter = document.getElementById('transfer-budget-filter')?.value || 'all';

        let filteredPlayers = this.transferPlayers.filter(player => {
            const matchesSearch = player.name.toLowerCase().includes(searchTerm);
            const matchesPosition = posFilter === 'all' || getPositionCategory(player.position) === posFilter;

            let matchesBudget = true;
            if (budgetFilter !== 'all') {
                const [min, max] = budgetFilter.split('-').map(v => parseInt(v) * 1000000);
                matchesBudget = player.value >= min && player.value <= (max || Infinity);
            }

            return matchesSearch && matchesPosition && matchesBudget;
        });

        // Sort by overall rating
        filteredPlayers.sort((a, b) => b.overall - a.overall);

        // Show top 50 to avoid performance issues
        filteredPlayers = filteredPlayers.slice(0, 50);

        container.innerHTML = filteredPlayers.map(player => this.createPlayerCard(player)).join('');

        // Add click handlers
        container.querySelectorAll('.player-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                this.showPlayerDetail(filteredPlayers[index]);
            });
        });
    }

    // STAFF VIEW
    setupStaffView() {
        const hireBtn = document.getElementById('hire-staff');
        hireBtn?.addEventListener('click', () => {
            alert('Staff hiring feature coming soon!');
        });
    }

    renderStaffView() {
        const container = document.getElementById('staff-list');
        if (!container) return;

        container.innerHTML = this.staff.map(staff => `
            <div class="staff-card">
                <h3>${staff.name}</h3>
                <div class="staff-role">${staff.role} | ${staff.nationality} | Age ${staff.age}</div>
                <div class="staff-attributes">
                    <div><strong>Fitness:</strong> ${staff.attributes.fitness}</div>
                    <div><strong>Tactical:</strong> ${staff.attributes.tactical}</div>
                    <div><strong>Technical:</strong> ${staff.attributes.technical}</div>
                    <div><strong>Mental:</strong> ${staff.attributes.mental}</div>
                    <div><strong>Motivation:</strong> ${staff.attributes.motivation}</div>
                    <div><strong>Judging:</strong> ${staff.attributes.judging}</div>
                </div>
                <div style="margin-top: 1rem;">
                    <strong>Wage:</strong> $${(staff.wage / 1000).toFixed(0)}K/week |
                    <strong>Reputation:</strong> ${staff.reputation}/100
                </div>
            </div>
        `).join('');
    }

    // LEAGUE VIEW
    setupLeagueView() {
        // Initialize with random data for demo
        this.generateRandomLeagueTable();
    }

    renderLeagueView() {
        const tbody = document.getElementById('league-table-body');
        if (!tbody) return;

        tbody.innerHTML = this.leagueTable.map((team, index) => `
            <tr class="${team.team === this.currentTeam ? 'user-team' : ''}">
                <td>${index + 1}</td>
                <td>${team.team}</td>
                <td>${team.played}</td>
                <td>${team.won}</td>
                <td>${team.drawn}</td>
                <td>${team.lost}</td>
                <td>${team.goalsFor}</td>
                <td>${team.goalsAgainst}</td>
                <td>${team.goalDifference}</td>
                <td><strong>${team.points}</strong></td>
            </tr>
        `).join('');
    }

    generateRandomLeagueTable() {
        this.leagueTable = this.leagueTable.map(team => {
            const played = Math.floor(Math.random() * 10);
            const won = Math.floor(Math.random() * played);
            const lost = Math.floor(Math.random() * (played - won));
            const drawn = played - won - lost;
            const goalsFor = Math.floor(Math.random() * 30);
            const goalsAgainst = Math.floor(Math.random() * 25);

            return {
                ...team,
                played,
                won,
                drawn,
                lost,
                goalsFor,
                goalsAgainst,
                goalDifference: goalsFor - goalsAgainst,
                points: won * 3 + drawn
            };
        });

        this.leagueTable.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
    }

    // HEADER
    updateHeader() {
        document.getElementById('current-team').textContent = this.currentTeam;
        document.getElementById('current-date').textContent = this.formatDate(this.currentDate);
        document.getElementById('budget').textContent = `Budget: $${(this.budget / 1000000).toFixed(0)}M`;
    }

    formatDate(date) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }

    // SAVE/LOAD
    saveGame() {
        const saveData = {
            currentTeam: this.currentTeam,
            currentDate: this.currentDate.toISOString(),
            budget: this.budget,
            currentFormation: this.currentFormation,
            tactics: this.tactics,
            myPlayers: this.myPlayers,
            staff: this.staff,
            leagueTable: this.leagueTable
        };

        localStorage.setItem('fm2k26_save', JSON.stringify(saveData));
        console.log('Game saved!');
    }

    loadGame() {
        const saveData = localStorage.getItem('fm2k26_save');

        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                this.currentTeam = data.currentTeam;
                this.currentDate = new Date(data.currentDate);
                this.budget = data.budget;
                this.currentFormation = data.currentFormation;
                this.tactics = data.tactics;
                this.myPlayers = data.myPlayers;
                this.staff = data.staff;
                this.leagueTable = data.leagueTable;

                console.log('Game loaded!');
            } catch (error) {
                console.error('Failed to load game:', error);
            }
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.fmApp = new FootballManagerApp();

    // Auto-save every 30 seconds
    setInterval(() => {
        window.fmApp.saveGame();
    }, 30000);
});
