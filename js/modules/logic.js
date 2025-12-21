import { gameState } from './state.js';
import { jobs, upgradeList, metaUpgradeList, projectList } from './constants.js';

export function formatNumber(num) {
    if (num < 1000) {
        // Fix for "100.00" vs "100" if integer
        if (Number.isInteger(num)) return num.toString();
        return num.toFixed(2);
    }

    var suffixes = ["", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
    var suffixNum = Math.floor(("" + Math.floor(num)).length / 3);

    var shortValue = parseFloat((suffixNum !== 0 ? (num / Math.pow(1000, suffixNum)) : num).toPrecision(3));
    if (shortValue % 1 !== 0) {
        shortValue = shortValue.toFixed(2);
    }

    if (suffixNum < suffixes.length) {
        return shortValue + suffixes[suffixNum];
    }

    return num.toExponential(2);
}

export function getPassiveIncome() {
    var jobIncome = jobs[gameState.jobLevel].baseRate;
    var upgradeIncome = 0;

    for (var i = 0; i < upgradeList.length; i++) {
        var u = upgradeList[i];
        if (gameState.upgrades[u.id]) {
            upgradeIncome += u.rate * gameState.upgrades[u.id];
        }
    }

    var total = jobIncome + upgradeIncome;

    // Insider Trading Bonus
    var insiderLevel = gameState.metaUpgrades["insider_trading"] || 0;
    if (insiderLevel > 0) {
        total *= (1 + (insiderLevel * 0.10));
    }

    // Blood Pact Bonus
    var bloodLevel = gameState.metaUpgrades["blood_pact"] || 0;
    if (bloodLevel > 0) {
        total *= (1 + (bloodLevel * 0.50));
    }

    // Void Investment Bonus
    var voidLevel = gameState.metaUpgrades["void_investment"] || 0;
    if (voidLevel > 0) {
        total *= Math.pow(2, voidLevel);
    }

    // Side Project Bonuses
    for (var i = 0; i < projectList.length; i++) {
        var p = projectList[i];
        var progress = gameState.sideProjects[p.id] || 0;
        if (progress >= p.goal && p.rewardType === "passive_mult") {
             total *= (1 + p.rewardValue);
        }
    }

    // Personnel Management Bonus (Micromanagement)
    if (gameState.employees && gameState.employees.length > 0 && gameState.jobLevel >= 3) {
        // Calculate total productivity
        var totalProductivity = 0;
        gameState.employees.forEach(e => {
             totalProductivity += (e.productivity || 0);
        });

        // Bonus: +1% for every 10 productivity points across all employees
        // e.g. 3 employees with 50 prod = 150 total = 15% bonus
        var bonus = (totalProductivity / 10) / 100;
        if (bonus > 0) {
            total *= (1 + bonus);
        }
    }

    return total;
}

export function getUpgradeCost(u, currentCount, amount) {
    var r = 1.15;
    var firstCost = u.cost * Math.pow(r, currentCount);

    if (amount === "MAX") {
        var maxAfford = calculateMaxAffordable(u, currentCount, gameState.cash);
        if (maxAfford === 0) return firstCost;

        return firstCost * (Math.pow(r, maxAfford) - 1) / (r - 1);
    }

    var total = firstCost * (Math.pow(r, amount) - 1) / (r - 1);
    return Math.floor(total);
}

export function calculateMaxAffordable(u, currentCount, cash) {
    var r = 1.15;
    var firstCost = u.cost * Math.pow(r, currentCount);

    if (cash < firstCost) return 0;

    var maxN = Math.floor(Math.log((cash * (r - 1) / firstCost) + 1) / Math.log(r));
    return maxN;
}

export function calculateStockOptions() {
    if (gameState.lifetimeEarnings < 500) return 0;
    return Math.floor(Math.sqrt(gameState.lifetimeEarnings / 500));
}
