// Football Manager 2K26 - Transfer & Negotiation Engine
// Handles transfers, contracts, negotiations with AI logic

class TransferEngine {
    constructor() {
        this.activeNegotiations = [];
        this.transferHistory = [];
        this.contractOffers = [];
        this.aiOffers = [];
    }

    // Calculate player's asking price based on attributes
    calculateTransferValue(player) {
        const baseValue = player.value || 1000000;
        const ageModifier = this.getAgeModifier(player.age);
        const formModifier = (player.form || 7) / 7;
        const contractModifier = this.getContractModifier(player.contract);

        return Math.floor(baseValue * ageModifier * formModifier * contractModifier);
    }

    getAgeModifier(age) {
        if (age <= 23) return 1.2; // Young players premium
        if (age <= 26) return 1.1; // Peak years
        if (age <= 28) return 1.0; // Prime
        if (age <= 30) return 0.8; // Declining
        return 0.5; // Veteran
    }

    getContractModifier(contractEnd) {
        if (!contractEnd) return 1.0;

        const endDate = new Date(contractEnd);
        const now = new Date();
        const monthsRemaining = (endDate - now) / (1000 * 60 * 60 * 24 * 30);

        if (monthsRemaining <= 6) return 0.5; // Last 6 months
        if (monthsRemaining <= 12) return 0.7; // Last year
        if (monthsRemaining <= 24) return 0.9; // 2 years
        return 1.0;
    }

    makeTransferOffer(player, offerAmount, wageOffer, contractLength = 4) {
        const sellingClub = player.club;
        const askingPrice = this.calculateTransferValue(player);

        const offer = {
            id: Date.now(),
            player: player,
            offerAmount: offerAmount,
            askingPrice: askingPrice,
            wageOffer: wageOffer,
            contractLength: contractLength,
            sellingClub: sellingClub,
            status: 'pending',
            submittedDate: new Date(),
            responses: []
        };

        this.activeNegotiations.push(offer);

        // Simulate club response
        setTimeout(() => {
            this.processClubResponse(offer);
        }, 100);

        return offer;
    }

    processClubResponse(offer) {
        const player = offer.player;
        const offerRatio = offer.offerAmount / offer.askingPrice;

        let clubResponse = {
            accepted: false,
            message: '',
            counterOffer: null
        };

        if (offerRatio >= 1.1) {
            // Offer exceeds asking price - immediate accept
            clubResponse.accepted = true;
            clubResponse.message = `${offer.sellingClub} has accepted your offer of $${(offer.offerAmount / 1000000).toFixed(1)}M for ${player.name}!`;

            // Now negotiate with player
            this.initiatePlayerNegotiation(offer);

        } else if (offerRatio >= 0.9) {
            // Close to asking price - might accept or counter
            if (Math.random() < 0.6) {
                clubResponse.accepted = true;
                clubResponse.message = `${offer.sellingClub} has accepted your offer!`;
                this.initiatePlayerNegotiation(offer);
            } else {
                clubResponse.counterOffer = Math.floor(offer.askingPrice * 0.95);
                clubResponse.message = `${offer.sellingClub} has countered with $${(clubResponse.counterOffer / 1000000).toFixed(1)}M`;
            }

        } else if (offerRatio >= 0.7) {
            // Low offer - counter
            clubResponse.counterOffer = Math.floor(offer.askingPrice * 0.9);
            clubResponse.message = `${offer.sellingClub} has rejected your offer and countered with $${(clubResponse.counterOffer / 1000000).toFixed(1)}M`;

        } else {
            // Very low offer - rejected
            clubResponse.message = `${offer.sellingClub} has rejected your offer as it's too low. They want at least $${(offer.askingPrice / 1000000).toFixed(1)}M`;
            offer.status = 'rejected';
        }

        offer.responses.push(clubResponse);

        // Dispatch event for UI update
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('transferUpdate', {
                detail: { offer, response: clubResponse }
            }));
        }

        return clubResponse;
    }

    initiatePlayerNegotiation(offer) {
        const player = offer.player;
        const wageRatio = offer.wageOffer / player.wage;

        let playerResponse = {
            accepted: false,
            message: '',
            demands: null
        };

        // Player considerations
        const teamReputation = 85; // Your club reputation (simplified)
        const playingTime = Math.random() < 0.7; // Will they get playing time?

        if (wageRatio >= 1.5 && teamReputation >= 80) {
            // Great offer, high reputation club
            playerResponse.accepted = true;
            playerResponse.message = `${player.name} is excited to join and has accepted your contract offer!`;
            this.completeTransfer(offer);

        } else if (wageRatio >= 1.2) {
            // Decent offer
            if (Math.random() < 0.7) {
                playerResponse.accepted = true;
                playerResponse.message = `${player.name} has accepted your contract offer!`;
                this.completeTransfer(offer);
            } else {
                playerResponse.demands = {
                    wage: Math.floor(offer.wageOffer * 1.15),
                    bonuses: 50000,
                    releaseClause: offer.offerAmount * 2
                };
                playerResponse.message = `${player.name} wants better terms: $${(playerResponse.demands.wage / 1000).toFixed(0)}K/week`;
            }

        } else {
            // Low wage offer
            playerResponse.demands = {
                wage: Math.floor(player.wage * 1.5),
                bonuses: 100000
            };
            playerResponse.message = `${player.name} has rejected the contract. He wants at least $${(playerResponse.demands.wage / 1000).toFixed(0)}K/week`;
        }

        offer.playerResponse = playerResponse;
        offer.status = playerResponse.accepted ? 'player-agreed' : 'player-negotiating';

        // Dispatch event
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('playerNegotiation', {
                detail: { offer, response: playerResponse }
            }));
        }

        return playerResponse;
    }

    completeTransfer(offer) {
        const player = offer.player;

        // Update player's club and contract
        player.club = 'Manchester United';
        player.wage = offer.wageOffer;
        player.contract = this.calculateContractEnd(offer.contractLength);

        // Record transfer
        this.transferHistory.push({
            player: player.name,
            from: offer.sellingClub,
            to: 'Manchester United',
            fee: offer.offerAmount,
            wage: offer.wageOffer,
            date: new Date()
        });

        offer.status = 'completed';

        // Dispatch completion event
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('transferCompleted', {
                detail: { player, offer }
            }));
        }

        return {
            success: true,
            message: `Transfer complete! ${player.name} has joined Manchester United for $${(offer.offerAmount / 1000000).toFixed(1)}M`,
            player: player
        };
    }

    calculateContractEnd(years) {
        const date = new Date();
        date.setFullYear(date.getFullYear() + years);
        return date.toISOString().split('T')[0];
    }

    // Sell player
    receiveOffer(player, biddingClub, offerAmount) {
        const aiOffer = {
            id: Date.now(),
            player: player,
            club: biddingClub,
            amount: offerAmount,
            status: 'pending',
            receivedDate: new Date()
        };

        this.aiOffers.push(aiOffer);

        return aiOffer;
    }

    acceptOffer(offerId) {
        const offer = this.aiOffers.find(o => o.id === offerId);

        if (!offer) return null;

        offer.status = 'accepted';

        // Record sale
        this.transferHistory.push({
            player: offer.player.name,
            from: 'Manchester United',
            to: offer.club,
            fee: offer.amount,
            date: new Date(),
            type: 'sale'
        });

        return {
            success: true,
            message: `${offer.player.name} has been sold to ${offer.club} for $${(offer.amount / 1000000).toFixed(1)}M`,
            amount: offer.amount
        };
    }

    rejectOffer(offerId) {
        const offer = this.aiOffers.find(o => o.id === offerId);

        if (!offer) return null;

        offer.status = 'rejected';

        return {
            success: true,
            message: `You have rejected ${offer.club}'s offer for ${offer.player.name}`
        };
    }

    // Contract renewal
    renewContract(player, newWage, contractLength = 3) {
        const currentWage = player.wage;
        const wageIncrease = ((newWage - currentWage) / currentWage) * 100;

        if (wageIncrease >= 20) {
            // Player happy with increase
            player.wage = newWage;
            player.contract = this.calculateContractEnd(contractLength);
            player.morale = Math.min(10, (player.morale || 7) + 2);

            return {
                success: true,
                message: `${player.name} has signed a new ${contractLength}-year contract!`
            };
        } else {
            return {
                success: false,
                message: `${player.name} wants a better offer. Current wage: $${(currentWage / 1000).toFixed(0)}K, Offered: $${(newWage / 1000).toFixed(0)}K`
            };
        }
    }

    // Generate AI transfer activity
    generateAITransferActivity(playerDatabase, week) {
        // Simulate other clubs making transfers
        if (week % 2 === 0 && Math.random() < 0.3) {
            const availablePlayers = playerDatabase.filter(p =>
                p.club !== 'Manchester United' && Math.random() < 0.1
            );

            if (availablePlayers.length > 0) {
                const player = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
                const randomClub = ['Manchester City', 'Liverpool FC', 'Arsenal FC', 'Chelsea FC'][Math.floor(Math.random() * 4)];

                return {
                    player: player.name,
                    from: player.club,
                    to: randomClub,
                    fee: this.calculateTransferValue(player)
                };
            }
        }

        return null;
    }

    getTransferSummary() {
        const spent = this.transferHistory
            .filter(t => t.to === 'Manchester United')
            .reduce((sum, t) => sum + t.fee, 0);

        const received = this.transferHistory
            .filter(t => t.from === 'Manchester United')
            .reduce((sum, t) => sum + t.fee, 0);

        return {
            spent: spent,
            received: received,
            netSpend: spent - received,
            transfers: this.transferHistory.length,
            incomingTransfers: this.transferHistory.filter(t => t.to === 'Manchester United').length,
            outgoingTransfers: this.transferHistory.filter(t => t.from === 'Manchester United').length
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TransferEngine };
}
