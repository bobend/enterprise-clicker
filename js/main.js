import { gameState, saveGame, loadGame, resetGame } from './modules/state.js';
import { jobs, upgradeList, metaUpgradeList, projectList } from './modules/constants.js';
import { getPassiveIncome, getUpgradeCost, calculateMaxAffordable, calculateStockOptions, formatNumber } from './modules/logic.js';
import { soundManager } from './modules/audio.js';
import {
    initMarket, updateMarket,
    initMicromanagement, updateMicromanagement,
    checkSideProjectConsequences, stockMarket
} from './modules/minigames.js';
import {
    updateDisplay, initShop, initShopControls, initMetaShop,
    initProjects, updateShopVisibility, updateProjectVisibility,
    updateMarketDisplay, updateMicromanagementUI,
    logMessage, getBuyMultiplier
} from './modules/ui.js';

var tickRate = 1000;
var gameLoop;

window.gameState = gameState; // Debug access
window.resetGame = resetGame;
window.soundManager = soundManager;

// Expose global tooltip functions (since UI generates HTML with inline events)
// But better to move tooltip logic to UI module entirely.
// For now, let's attach to window to support the inline events in generated HTML
window.showTooltip = function(e, text) {
    var tooltip = document.getElementById("custom-tooltip");
    if (!tooltip) return;
    tooltip.innerHTML = text;
    tooltip.style.display = "block";
    window.moveTooltip(e);
};

window.moveTooltip = function(e) {
    var tooltip = document.getElementById("custom-tooltip");
    if (!tooltip) return;
    var x = e.pageX + 10;
    var y = e.pageY + 10;
    if (x + 200 > window.innerWidth) {
        x = e.pageX - 210;
    }
    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
};

window.hideTooltip = function() {
    var tooltip = document.getElementById("custom-tooltip");
    if (tooltip) tooltip.style.display = "none";
};

function startGame() {
    console.log("Starting Enterprise Clicker...");
    loadGame(logMessage);
    initShopControls();
    initShop(buyUpgrade);
    initMetaShop(buyMetaUpgrade);
    initProjects(contributeProject);
    initMarket();
    initMicromanagement();
    updateDisplay();
    gameLoop = setInterval(gameTick, tickRate);
    setInterval(spawnFloatingIcon, 1500);
    setInterval(updateTicker, 10000);

    // Initial UI Setup for static buttons
    document.getElementById("work-btn").onclick = work;
    document.getElementById("promote-btn").onclick = promote;
    document.getElementById("retire-btn").onclick = ascend;

    // Save menu toggles
    window.toggleSaveMenu = function() {
        var menu = document.getElementById("save-menu");
        menu.style.display = (menu.style.display === "none") ? "block" : "none";
    };
    window.exportSave = function() {
        var saveString = JSON.stringify(gameState);
        var encoded = btoa(saveString);
        var area = document.getElementById("export-area");
        area.value = encoded;
        area.select();
        document.execCommand("copy");
        logMessage("Save data copied to clipboard.");
    };
    window.importSave = function() {
        var encoded = document.getElementById("import-area").value;
        if (!encoded) return;
        try {
            var decoded = atob(encoded);
            var newState = JSON.parse(decoded);
            if (typeof newState.cash === 'undefined') throw new Error("Invalid save format");
            if (confirm("Overwrite current progress with imported data?")) {
                // We need to reload to apply cleanly
                // Or we could assign to gameState, but imports are safer with reload
                // Manually setting cookie
                var d = new Date();
                d.setTime(d.getTime() + (365*24*60*60*1000));
                document.cookie = "enterpriseSave=" + JSON.stringify(newState) + ";expires="+ d.toUTCString() + ";path=/";
                location.reload();
            }
        } catch (e) {
            alert("Invalid Save Data!");
        }
    };
}

function gameTick() {
    var passiveIncome = getPassiveIncome();

    if (passiveIncome > 0) {
        addCash(passiveIncome);
    }

    updateMarket(logMessage);
    updateMicromanagement(logMessage);
    checkSideProjectConsequences(logMessage);

    // Refresh Dynamic UI
    updateShopVisibility();
    updateProjectVisibility();
    updateMarketDisplay(buyStock, sellStock);
    updateMicromanagementUI();

    saveGame();
}

function addCash(amount) {
    gameState.cash += amount;
    gameState.lifetimeEarnings += amount;
    updateDisplay();

    // We should also refresh shop buttons state (enabled/disabled) here?
    // Current UI logic toggles visibility but doesn't re-render buttons for disable state.
    // The bug report says "Buttons don't update until toggle".
    // We should call initShop again? Too expensive.
    // We should have a function that just updates button states.
    // For now, let's just re-init shop/projects if cash changes significantly? No.
    // Let's implement a lighter update function in UI or just call initShop for now since list isn't huge (11 items).
    initShop(buyUpgrade);
    initProjects(contributeProject);

    var display = document.getElementById("cash-display");
    if (display) {
        display.classList.remove("currency-increase");
        void display.offsetWidth;
        display.classList.add("currency-increase");
    }
}

function work(e) {
    // Sparkle Effect
    if (e && e.pageX && e.pageY) {
        var sparkle = document.createElement("div");
        sparkle.className = "sparkle";
        sparkle.style.left = e.pageX + "px";
        sparkle.style.top = e.pageY + "px";

        // Intensity based on job level
        var intensity = Math.min(2.0, 0.5 + (gameState.jobLevel * 0.1));
        sparkle.style.transform = "scale(" + intensity + ")";

        // Random color for higher levels
        if (gameState.jobLevel >= 6) {
             var colors = ["#ff00ff", "#00ffff", "#ff0000", "#ffff00"];
             sparkle.style.background = colors[Math.floor(Math.random() * colors.length)];
             sparkle.style.boxShadow = "0 0 10px " + sparkle.style.background;
        }

        document.body.appendChild(sparkle);
        setTimeout(function() {
            if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle);
        }, 500);
    }

    var clickPower = jobs[gameState.jobLevel].clickPower;

    var parachuteLevel = gameState.metaUpgrades["golden_parachute"] || 0;
    if (parachuteLevel > 0) {
        clickPower *= (1 + (parachuteLevel * 0.20));
    }

    for (var i = 0; i < projectList.length; i++) {
        var p = projectList[i];
        var progress = gameState.sideProjects[p.id] || 0;
        if (progress >= p.goal && p.rewardType === "click_mult") {
             clickPower *= (1 + p.rewardValue);
        }
    }

    addCash(clickPower);
    soundManager.playClick();
    logMessage("You did work. Earned $" + formatNumber(clickPower));
}

function buyUpgrade(id) {
    var u = upgradeList.find(x => x.id === id);
    var count = gameState.upgrades[id] || 0;
    var buyMultiplier = getBuyMultiplier();

    var amountToBuy = buyMultiplier;
    var cost = 0;

    if (buyMultiplier === "MAX") {
        amountToBuy = calculateMaxAffordable(u, count, gameState.cash);
        if (amountToBuy === 0) {
            logMessage("Not enough cash!");
            return;
        }
        cost = getUpgradeCost(u, count, amountToBuy);
    } else {
        cost = getUpgradeCost(u, count, buyMultiplier);
    }

    if (gameState.cash >= cost) {
        gameState.cash -= cost;
        gameState.upgrades[id] = count + amountToBuy;
        soundManager.playClick();
        logMessage("Bought " + amountToBuy + "x " + u.name);
        initShop(buyUpgrade);
        updateDisplay();
    } else {
        logMessage("Not enough cash!");
    }
}

function buyMetaUpgrade(id) {
    var u = metaUpgradeList.find(x => x.id === id);
    var count = gameState.metaUpgrades[id] || 0;
    var currentCost = Math.floor(u.cost * Math.pow(u.costScaling, count));

    if (gameState.stockOptions >= currentCost) {
        gameState.stockOptions -= currentCost;
        gameState.metaUpgrades[id] = count + 1;
        soundManager.playClick();
        logMessage("Acquired Asset: " + u.name);
        initMetaShop(buyMetaUpgrade);
        updateDisplay();
        saveGame();
    } else {
        logMessage("Insufficient Stock Options!");
    }
}

function contributeProject(id) {
    var p = projectList.find(x => x.id === id);
    if (!p) return;

    var progress = gameState.sideProjects[id] || 0;
    if (progress >= p.goal) return;

    var buyMultiplier = getBuyMultiplier();
    var amount = 0;
    if (buyMultiplier === "MAX") {
        var maxAffordable = Math.floor(gameState.cash / p.cost);
        amount = Math.min(maxAffordable, p.goal - progress);
        if (amount <= 0) amount = 1;
    } else {
        amount = Math.min(buyMultiplier, p.goal - progress);
    }

    var totalCost = p.cost * amount;

    if (gameState.cash >= totalCost) {
        gameState.cash -= totalCost;
        gameState.sideProjects[id] = progress + amount;
        soundManager.playClick();
        logMessage("Funded project: " + p.name + " (x" + amount + ")");

        if (gameState.sideProjects[id] >= p.goal) {
            logMessage("PROJECT COMPLETE: " + p.name);
            updateDisplay();
        }

        initProjects(contributeProject);
        updateDisplay();
    } else {
        logMessage("Not enough cash to fund project.");
    }
}

function buyStock(symbol) {
    var s = stockMarket.find(x => x.symbol === symbol);
    if (!s) return;

    var buyMultiplier = getBuyMultiplier();
    // Fix: Implement Buy Max logic properly
    var amount = 0;

    if (buyMultiplier === "MAX") {
         amount = Math.floor(gameState.cash / s.price);
         if (amount === 0) amount = 1; // Try to buy at least one even if can't afford (will fail check below)
    } else {
        amount = buyMultiplier;
    }

    var cost = s.price * amount;

    if (gameState.cash >= cost) {
        gameState.cash -= cost;
        gameState.stocksOwned[symbol] = (gameState.stocksOwned[symbol] || 0) + amount;
        logMessage(`Bought ${amount} ${symbol} @ $${s.price.toFixed(2)}`);
        updateDisplay();
        updateMarketDisplay(buyStock, sellStock);
    } else {
        logMessage("Not enough cash for stocks.");
    }
}

function sellStock(symbol) {
    var s = stockMarket.find(x => x.symbol === symbol);
    if (!s) return;

    var buyMultiplier = getBuyMultiplier();
    var owned = gameState.stocksOwned[symbol] || 0;
    var amount = (buyMultiplier === "MAX") ? owned : buyMultiplier;

    if (owned >= amount && amount > 0) {
        var val = s.price * amount;
        gameState.cash += val;
        gameState.stocksOwned[symbol] -= amount;
        logMessage(`Sold ${amount} ${symbol} @ $${s.price.toFixed(2)}`);
        updateDisplay();
        updateMarketDisplay(buyStock, sellStock);
    } else {
        logMessage("Not enough stocks to sell.");
    }
}

function promote() {
    var job = jobs[gameState.jobLevel];
    if (gameState.cash >= job.promoteCost) {
        gameState.cash -= job.promoteCost;
        gameState.jobLevel++;
        logMessage("PROMOTION! You are now " + jobs[gameState.jobLevel].title);
        updateDisplay();

        // Check for micromanagement unlock
        if (gameState.jobLevel === 3) {
             updateMicromanagementUI();
        }
    } else {
        logMessage("Not enough cash for promotion.");
    }
}

function ascend() {
    var pending = calculateStockOptions();
    if (pending === 0) {
        logMessage("You need to earn more before retiring!");
        return;
    }

    if (!confirm("Retire? You will lose all cash and upgrades, but gain " + pending + " Stock Options.")) {
        return;
    }

    gameState.stockOptions += pending;
    gameState.cash = 0;
    gameState.lifetimeEarnings = 0;
    gameState.jobLevel = 0;
    gameState.upgrades = {};
    gameState.sideProjects = {};
    gameState.stocksOwned = {}; // Stocks reset? Yes usually.

    var nepotismLevel = gameState.metaUpgrades["nepotism"] || 0;
    if (nepotismLevel > 0) {
        gameState.cash = nepotismLevel * 1000;
        logMessage("Nepotism bonus: Started with $" + gameState.cash);
    }

    saveGame();
    location.reload();
}

function updateTicker() {
    var ticker = document.getElementById("game-ticker");
    if (!ticker) return;

    var msgs = [];
    var stocks = gameState.stockOptions;

    if (stocks < 50) {
        msgs = [
            "*** WELCOME TO THE CORPORATION *** WORK HARD *** GET PROMOTED *** SYNERGIZE ***",
            "*** REMINDER: CASUAL FRIDAYS ARE CANCELLED UNTIL PROFITS IMPROVE ***",
            "*** THE PRINTER IS JAMMED AGAIN ***",
            "*** PRODUCTIVITY IS UP 0.5% ***",
            "*** PLEASE DO NOT FEED THE INTERNS ***"
        ];
    } else if (stocks < 1000) {
        msgs = [
            "*** PROFITS SOARING *** INVEST IN FUTURES ***",
            "*** THE BOARD IS WATCHING ***",
            "*** SHADOW ASSETS LIQUIDATED ***",
            "*** REMEMBER: YOU ARE REPLACEABLE, BUT YOUR VALUE IS NOT ***",
            "*** SYNERGY LEVELS CRITICAL ***"
        ];
    } else {
        msgs = [
            "*** THE VOID STARES BACK ***",
            "*** CONSUME *** CONSUME *** CONSUME ***",
            "*** REALITY IS AN ASSET CLASS ***",
            "*** TIME IS MONEY *** MONEY IS BLOOD ***",
            "*** WE ARE ETERNAL ***"
        ];
    }

    if (gameState.cash > 1000000) msgs.push("*** YOU ARE RICH ***");
    if (gameState.jobLevel >= 5) msgs.push("*** LEADERSHIP MATERIAL ***");

    var randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
    ticker.innerHTML = "<b>" + randomMsg + "</b>";
}

function spawnFloatingIcon() {
    var ownedUpgrades = [];
    for (var id in gameState.upgrades) {
        if (gameState.upgrades[id] > 0) {
            ownedUpgrades.push(id);
        }
    }

    if (ownedUpgrades.length === 0) return;

    var randomId = ownedUpgrades[Math.floor(Math.random() * ownedUpgrades.length)];
    var upgrade = upgradeList.find(function(u) { return u.id === randomId; });

    if (!upgrade) return;

    var icon = document.createElement("img");
    icon.src = upgrade.icon;
    icon.className = "floating-icon";

    var leftPos = Math.random() * 95;
    var duration = 10 + Math.random() * 10;

    icon.style.left = leftPos + "%";
    icon.style.animationDuration = duration + "s";

    var container = document.getElementById("background-fx");
    if (container) {
        container.appendChild(icon);
        setTimeout(function() {
            if (icon.parentNode) {
                icon.parentNode.removeChild(icon);
            }
        }, duration * 1000 + 1000);
    }
}

// Start
window.onload = startGame;
