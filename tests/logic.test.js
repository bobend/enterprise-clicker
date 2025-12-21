import { describe, it, expect, vi } from 'vitest';
import { calculateMaxAffordable, getUpgradeCost, formatNumber, getPassiveIncome } from '../js/modules/logic.js';
import { gameState } from '../js/modules/state.js';

describe('Logic Module', () => {
    describe('calculateMaxAffordable', () => {
        it('should calculate correct amount purchasable', () => {
            const upgrade = { cost: 100 };
            const r = 1.15;
            // 0 bought, 100 cash => 1
            expect(calculateMaxAffordable(upgrade, 0, 100)).toBe(1);
            // 0 bought, 99 cash => 0
            expect(calculateMaxAffordable(upgrade, 0, 99)).toBe(0);

            // 0 bought, cost for 2 = 100 + 115 = 215.
            // Cash 215 => 2
            expect(calculateMaxAffordable(upgrade, 0, 215)).toBe(2);
        });
    });

    describe('formatNumber', () => {
        it('should format small numbers correctly', () => {
            expect(formatNumber(100)).toBe('100'); // Updated expectation for integers
            expect(formatNumber(999.99)).toBe('999.99');
        });

        it('should format large numbers with suffixes', () => {
            expect(formatNumber(1000)).toBe('1k');

            // 1500 -> 1.50k (The logic enforces 2 decimals for non-integers)
            expect(formatNumber(1500)).toBe('1.50k');

            // 1,000,000 -> 1M
            expect(formatNumber(1000000)).toBe('1M');
        });
    });

    describe('getPassiveIncome with Personnel', () => {
        it('should apply bonus from employees if jobLevel >= 3', () => {
            gameState.jobLevel = 3; // Middle Manager
            gameState.upgrades = {};
            gameState.metaUpgrades = {};
            gameState.sideProjects = {};

            // Base job 3 rate is 20
            // Employees: 100 total prod
            gameState.employees = [
                { productivity: 50 },
                { productivity: 50 }
            ];
            // Bonus: 100 / 10 = 10%

            const income = getPassiveIncome();
            // Base 20 + 10% = 22
            expect(income).toBe(22);
        });

        it('should NOT apply bonus if jobLevel < 3', () => {
            gameState.jobLevel = 2;
            gameState.upgrades = {};
            gameState.employees = [{ productivity: 1000 }];

            // Base job 2 rate is 5
            const income = getPassiveIncome();
            expect(income).toBe(5);
        });
    });
});
