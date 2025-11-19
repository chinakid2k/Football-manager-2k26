// Football Manager 2K26 - Finance Engine
// Budget management, wage bills, revenue streams

class FinanceEngine {
    constructor(initialBudget = 150000000) {
        this.transferBudget = initialBudget;
        this.wageBudget = initialBudget * 0.5; // 50% of transfer budget as annual wages

        this.finances = {
            balance: initialBudget,
            transferBudget: initialBudget,
            wageBudget: this.wageBudget
        };

        this.income = {
            matchday: 0,
            broadcasting: 0,
            commercial: 0,
            transfers: 0,
            total: 0
        };

        this.expenses = {
            wages: 0,
            transfers: 0,
            facilities: 0,
            other: 0,
            total: 0
        };

        this.transactions = [];
    }

    // Calculate weekly wage bill
    calculateWageBill(players) {
        const weeklyWages = players.reduce((total, player) => {
            return total + (player.wage || 0);
        }, 0);

        const annualWages = weeklyWages * 52;
        this.expenses.wages = annualWages;

        return {
            weekly: weeklyWages,
            monthly: weeklyWages * 4.33,
            annual: annualWages,
            percentageOfBudget: (annualWages / this.wageBudget) * 100
        };
    }

    // Process transfer purchase
    buyPlayer(player, transferFee, wage) {
        if (transferFee > this.finances.transferBudget) {
            return {
                success: false,
                message: `Insufficient transfer budget. Available: $${(this.finances.transferBudget / 1000000).toFixed(1)}M`,
                available: this.finances.transferBudget
            };
        }

        // Check wage budget
        const annualWage = wage * 52;
        const newWageBill = this.expenses.wages + annualWage;

        if (newWageBill > this.wageBudget) {
            return {
                success: false,
                message: `Signing would exceed wage budget. Weekly: $${(wage / 1000).toFixed(0)}K, Annual: $${(annualWage / 1000000).toFixed(1)}M`,
                currentWages: this.expenses.wages,
                wageBudget: this.wageBudget
            };
        }

        // Process payment
        this.finances.transferBudget -= transferFee;
        this.finances.balance -= transferFee;
        this.expenses.transfers += transferFee;

        this.recordTransaction({
            type: 'transfer_purchase',
            player: player.name,
            amount: -transferFee,
            description: `Signed ${player.name}`,
            date: new Date()
        });

        return {
            success: true,
            message: `Transfer completed! Remaining budget: $${(this.finances.transferBudget / 1000000).toFixed(1)}M`,
            remainingBudget: this.finances.transferBudget
        };
    }

    // Process player sale
    sellPlayer(player, transferFee) {
        this.finances.transferBudget += transferFee;
        this.finances.balance += transferFee;
        this.income.transfers += transferFee;

        this.recordTransaction({
            type: 'transfer_sale',
            player: player.name,
            amount: transferFee,
            description: `Sold ${player.name}`,
            date: new Date()
        });

        return {
            success: true,
            message: `Player sold! New budget: $${(this.finances.transferBudget / 1000000).toFixed(1)}M`,
            newBudget: this.finances.transferBudget
        };
    }

    // Monthly income from various sources
    processMonthlyIncome(leaguePosition, attendance) {
        // Matchday revenue
        const avgAttendance = attendance || 73000;
        const matchdayRevenue = (avgAttendance * 80 * 4); // $80 per ticket, 4 home games/month
        this.income.matchday += matchdayRevenue;

        // Broadcasting revenue (based on league position)
        const broadcastingBase = 10000000; // $10M per month base
        const positionBonus = Math.max(0, (21 - leaguePosition) * 500000);
        const broadcastingRevenue = broadcastingBase + positionBonus;
        this.income.broadcasting += broadcastingRevenue;

        // Commercial revenue
        const commercialRevenue = 8000000; // $8M per month
        this.income.commercial += commercialRevenue;

        const totalMonthlyIncome = matchdayRevenue + broadcastingRevenue + commercialRevenue;
        this.income.total += totalMonthlyIncome;
        this.finances.balance += totalMonthlyIncome;

        this.recordTransaction({
            type: 'monthly_income',
            amount: totalMonthlyIncome,
            description: `Monthly revenue (Matchday: $${(matchdayRevenue / 1000000).toFixed(1)}M, Broadcasting: $${(broadcastingRevenue / 1000000).toFixed(1)}M, Commercial: $${(commercialRevenue / 1000000).toFixed(1)}M)`,
            date: new Date()
        });

        return {
            matchday: matchdayRevenue,
            broadcasting: broadcastingRevenue,
            commercial: commercialRevenue,
            total: totalMonthlyIncome
        };
    }

    // Pay monthly wages
    processMonthlyWages(players) {
        const weeklyWages = this.calculateWageBill(players).weekly;
        const monthlyWages = weeklyWages * 4.33;

        this.finances.balance -= monthlyWages;

        this.recordTransaction({
            type: 'wages',
            amount: -monthlyWages,
            description: `Monthly wage bill`,
            date: new Date()
        });

        return {
            amount: monthlyWages,
            remainingBalance: this.finances.balance
        };
    }

    // End of season bonuses and settlements
    processSeasonEnd(leaguePosition, cupPerformances = []) {
        let totalBonus = 0;

        // League prize money
        const leaguePrizes = {
            1: 50000000,  // Champion
            2: 40000000,  // Runner-up
            3: 35000000,  // 3rd
            4: 30000000,  // 4th (Champions League)
            5: 20000000,  // 5th
            6: 15000000   // 6th
        };

        const leaguePrize = leaguePrizes[leaguePosition] || 10000000;
        totalBonus += leaguePrize;

        // Cup bonuses
        cupPerformances.forEach(cup => {
            if (cup.winner) totalBonus += 25000000;
            else if (cup.finalist) totalBonus += 15000000;
            else if (cup.semifinalist) totalBonus += 8000000;
        });

        this.finances.balance += totalBonus;
        this.income.total += totalBonus;

        this.recordTransaction({
            type: 'season_bonus',
            amount: totalBonus,
            description: `Season end bonuses (League: ${leaguePosition}${leaguePosition === 1 ? 'st' : leaguePosition === 2 ? 'nd' : leaguePosition === 3 ? 'rd' : 'th'})`,
            date: new Date()
        });

        // New season budget allocation
        const newSeasonBudget = Math.floor(this.finances.balance * 0.4);
        this.finances.transferBudget = newSeasonBudget;
        this.wageBudget = Math.floor(this.finances.balance * 0.3);

        return {
            totalBonus: totalBonus,
            newTransferBudget: newSeasonBudget,
            newWageBudget: this.wageBudget
        };
    }

    recordTransaction(transaction) {
        this.transactions.push(transaction);

        // Keep only last 50 transactions
        if (this.transactions.length > 50) {
            this.transactions.shift();
        }
    }

    getFinancialReport() {
        const netSpend = this.expenses.total - this.income.total;

        return {
            balance: this.finances.balance,
            transferBudget: this.finances.transferBudget,
            wageBudget: this.wageBudget,
            income: { ...this.income },
            expenses: { ...this.expenses },
            netSpend: netSpend,
            financialHealth: this.getFinancialHealth()
        };
    }

    getFinancialHealth() {
        const ratio = this.finances.balance / 100000000; // $100M baseline

        if (ratio >= 2) return 'Excellent';
        if (ratio >= 1.5) return 'Very Good';
        if (ratio >= 1) return 'Good';
        if (ratio >= 0.5) return 'Fair';
        return 'Poor';
    }

    getRecentTransactions(count = 10) {
        return this.transactions.slice(-count).reverse();
    }

    adjustBudget(transferBudgetChange, wageBudgetChange) {
        this.finances.transferBudget += transferBudgetChange;
        this.wageBudget += wageBudgetChange;

        return {
            newTransferBudget: this.finances.transferBudget,
            newWageBudget: this.wageBudget
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FinanceEngine };
}
