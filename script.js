// Enterprise Clicker Logic

var gameState = {
    cash: 0,
    lifetimeEarnings: 0,
    jobLevel: 0,
    upgrades: {}, // id: count
    stockOptions: 0,
    metaUpgrades: {} // id: count
};

// Configuration
var metaUpgradeList = [
    { id: "insider_trading", name: "Insider Trading", cost: 1, costScaling: 2, desc: "+10% Passive Income per level.", icon: "images/chart.ico" },
    { id: "golden_parachute", name: "Golden Parachute", cost: 2, costScaling: 1.5, desc: "Click power +20% per level.", icon: "images/moneybag.ico" },
    { id: "nepotism", name: "Nepotism", cost: 5, costScaling: 3, desc: "Start with $1000 extra cash per level after reset.", icon: "images/handshake.ico" }
];

var jobs = [
    { title: "Intern", baseRate: 0, clickPower: 1, promoteCost: 100 },
    { title: "Mailroom Clerk", baseRate: 1, clickPower: 2, promoteCost: 500 },
    { title: "Junior Associate", baseRate: 5, clickPower: 5, promoteCost: 2000 },
    { title: "Middle Manager", baseRate: 20, clickPower: 15, promoteCost: 10000 },
    { title: "Senior VP", baseRate: 100, clickPower: 50, promoteCost: 50000 },
    { title: "CEO", baseRate: 500, clickPower: 200, promoteCost: Infinity }
];

var upgradeList = [
    { id: "stapler", name: "Red Stapler", cost: 50, rate: 0.5, desc: "Keeps papers together. +$0.50/sec", icon: "images/stapler.ico" },
    { id: "coffee", name: "Cheap Coffee", cost: 150, rate: 2, desc: "Caffeine boost. +$2.00/sec", icon: "images/coffee.ico" },
    { id: "intern", name: "Unpaid Intern", cost: 500, rate: 5, desc: "Does the grunt work. +$5.00/sec", icon: "images/intern.ico" },
    { id: "copier", name: "Fax Machine", cost: 1200, rate: 10, desc: "Communication speed. +$10.00/sec", icon: "images/fax.ico" },
    { id: "computer", name: "Windows 95 PC", cost: 5000, rate: 40, desc: "High tech efficiency. +$40.00/sec", icon: "images/computer.ico" },
    { id: "server", name: "Mainframe", cost: 20000, rate: 100, desc: "Data processing. +$100.00/sec", icon: "images/mainframe.ico" }
];

// Loop variables
var tickRate = 1000; // 1 second
var gameLoop;

function startGame() {
    console.log("Starting Enterprise Clicker...");
    loadGame();
    initShop();
    initMetaShop();
    updateDisplay();
    gameLoop = setInterval(gameTick, tickRate);
    setInterval(spawnFloatingIcon, 1500); // Spawn an icon every 1.5 seconds
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

    // Randomize position and animation properties
    var leftPos = Math.random() * 95; // 0% to 95%
    var duration = 10 + Math.random() * 10; // 10s to 20s
    var delay = Math.random() * 5; // 0s to 5s delay

    icon.style.left = leftPos + "%";
    icon.style.animationDuration = duration + "s";

    var container = document.getElementById("background-fx");
    if (container) {
        container.appendChild(icon);

        // Remove after animation completes + buffer
        setTimeout(function() {
            if (icon.parentNode) {
                icon.parentNode.removeChild(icon);
            }
        }, duration * 1000 + 1000);
    }
}

function gameTick() {
    // Calculate passive income from job + upgrades
    var passiveIncome = getPassiveIncome();

    if (passiveIncome > 0) {
        addCash(passiveIncome);
    }

    saveGame();
}

function getPassiveIncome() {
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

    return total;
}

function addCash(amount) {
    gameState.cash += amount;
    gameState.lifetimeEarnings += amount;
    updateDisplay();

    // Trigger pulse animation
    var display = document.getElementById("cash-display");
    if (display) {
        // Remove class if it exists to reset animation
        display.classList.remove("currency-increase");
        // Force reflow
        void display.offsetWidth;
        display.classList.add("currency-increase");
    }
}

function work() {
    var clickPower = jobs[gameState.jobLevel].clickPower;

    // Golden Parachute Bonus
    var parachuteLevel = gameState.metaUpgrades["golden_parachute"] || 0;
    if (parachuteLevel > 0) {
        clickPower *= (1 + (parachuteLevel * 0.20));
    }

    addCash(clickPower);
    logMessage("You did work. Earned $" + clickPower.toFixed(2));
}

function initShop() {
    var table = document.getElementById("shop-table");
    table.innerHTML = "";

    for (var i = 0; i < upgradeList.length; i++) {
        var u = upgradeList[i];
        var row = table.insertRow(-1);
        var cell = row.insertCell(0);

        var count = gameState.upgrades[u.id] || 0;
        var currentCost = Math.floor(u.cost * Math.pow(1.15, count));

        cell.innerHTML = `
            <div style="border: 1px outset white; background: #c0c0c0; padding: 5px; margin-bottom: 5px; display: flex; align-items: center;">
                <img src="${u.icon}" class="shop-icon" alt="${u.name}" style="margin-right: 10px; width: 32px; height: 32px;">
                <div>
                    <b>${u.name}</b> (${count})<br>
                    <small>${u.desc}</small><br>
                    Cost: $${currentCost}<br>
                    <button onclick="buyUpgrade('${u.id}')">Buy</button>
                </div>
            </div>
        `;
    }
}

function buyUpgrade(id) {
    var u = upgradeList.find(x => x.id === id);
    var count = gameState.upgrades[id] || 0;
    var cost = Math.floor(u.cost * Math.pow(1.15, count));

    if (gameState.cash >= cost) {
        gameState.cash -= cost;
        gameState.upgrades[id] = count + 1;
        logMessage("Bought " + u.name);
        initShop(); // refresh prices
        updateDisplay();
    } else {
        logMessage("Not enough cash!");
    }
}

function initMetaShop() {
    var table = document.getElementById("meta-shop-table");
    if (!table) return;
    table.innerHTML = "";

    for (var i = 0; i < metaUpgradeList.length; i++) {
        var u = metaUpgradeList[i];
        var row = table.insertRow(-1);
        var cell = row.insertCell(0);

        var count = gameState.metaUpgrades[u.id] || 0;
        var currentCost = Math.floor(u.cost * Math.pow(u.costScaling, count));

        cell.innerHTML = `
            <div style="border: 1px outset gold; background: #000000; color: gold; padding: 5px; margin-bottom: 5px; display: flex; align-items: center;">
                 <img src="${u.icon}" class="shop-icon" alt="${u.name}" style="margin-right: 10px; width: 32px; height: 32px; border: 1px solid gold;">
                 <div>
                    <b>${u.name}</b> (Lvl ${count})<br>
                    <small style="color: #ffffaa;">${u.desc}</small><br>
                    Cost: ${currentCost} Stocks<br>
                    <button onclick="buyMetaUpgrade('${u.id}')" style="background: gold; color: black; border-color: #886600;">Invest</button>
                 </div>
            </div>
        `;
    }
}

function buyMetaUpgrade(id) {
    var u = metaUpgradeList.find(x => x.id === id);
    var count = gameState.metaUpgrades[id] || 0;
    var currentCost = Math.floor(u.cost * Math.pow(u.costScaling, count));

    if (gameState.stockOptions >= currentCost) {
        gameState.stockOptions -= currentCost;
        gameState.metaUpgrades[id] = count + 1;
        logMessage("Acquired Asset: " + u.name);
        initMetaShop();
        updateDisplay();
        saveGame();
    } else {
        logMessage("Insufficient Stock Options!");
    }
}

function logMessage(msg) {
    var log = document.getElementById("message-log");
    var entry = document.createElement("div");
    entry.textContent = "> " + msg;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

function updateDisplay() {
    document.getElementById('cash-display').textContent = "$" + gameState.cash.toFixed(2);
    document.getElementById('lifetime-display').textContent = "$" + gameState.lifetimeEarnings.toFixed(2);
    document.getElementById('passive-display').textContent = "$" + getPassiveIncome().toFixed(2);
    document.getElementById('job-title').textContent = jobs[gameState.jobLevel].title;

    var nextPromote = jobs[gameState.jobLevel].promoteCost;
    var promoText = (nextPromote === Infinity) ? "MAX LEVEL" : "$" + nextPromote;
    document.getElementById('next-promotion-cost').textContent = promoText;

    // Update Promote Button
    var promoteBtn = document.getElementById('promote-btn');
    if (nextPromote !== Infinity && gameState.cash >= nextPromote) {
        promoteBtn.disabled = false;
    } else {
        promoteBtn.disabled = true;
    }

    // Update Ascension UI
    var pendingStock = calculateStockOptions();
    var retireBtn = document.getElementById('retire-btn');
    if (retireBtn) {
        retireBtn.title = "Retire now to earn " + pendingStock + " Stock Options";
        document.getElementById('stock-display').textContent = gameState.stockOptions;
        document.getElementById('pending-stock-display').textContent = pendingStock;
    }
}

function calculateStockOptions() {
    // Formula: 1 stock option for every $1000 earned, square root scaling?
    // Let's go simple: floor(sqrt(lifetimeEarnings / 500))
    if (gameState.lifetimeEarnings < 500) return 0;
    return Math.floor(Math.sqrt(gameState.lifetimeEarnings / 500));
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

    // Add stock options
    gameState.stockOptions += pending;

    // Reset Run State
    gameState.cash = 0;
    gameState.lifetimeEarnings = 0;
    gameState.jobLevel = 0;
    gameState.upgrades = {};

    // Apply Nepotism Bonus immediately on reset
    var nepotismLevel = gameState.metaUpgrades["nepotism"] || 0;
    if (nepotismLevel > 0) {
        gameState.cash = nepotismLevel * 1000;
        logMessage("Nepotism bonus: Started with $" + gameState.cash);
    }

    saveGame();
    location.reload();
}

function promote() {
    var job = jobs[gameState.jobLevel];
    if (gameState.cash >= job.promoteCost) {
        gameState.cash -= job.promoteCost;
        gameState.jobLevel++;
        logMessage("PROMOTION! You are now " + jobs[gameState.jobLevel].title);
        updateDisplay();
    } else {
        logMessage("Not enough cash for promotion.");
    }
}

function saveGame() {
    var saveString = JSON.stringify(gameState);
    // 365 days expiration
    var d = new Date();
    d.setTime(d.getTime() + (365*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = "enterpriseSave=" + saveString + ";" + expires + ";path=/";
}

function loadGame() {
    var name = "enterpriseSave=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            var saveString = c.substring(name.length, c.length);
            try {
                var savedState = JSON.parse(saveString);

                // Merge save with default to ensure new fields are added if updated
                gameState.cash = (typeof savedState.cash !== 'undefined') ? savedState.cash : 0;
                gameState.lifetimeEarnings = (typeof savedState.lifetimeEarnings !== 'undefined') ? savedState.lifetimeEarnings : 0;
                gameState.jobLevel = (typeof savedState.jobLevel !== 'undefined') ? savedState.jobLevel : 0;
                gameState.upgrades = savedState.upgrades || {};

                // Meta progression fields
                gameState.stockOptions = (typeof savedState.stockOptions !== 'undefined') ? savedState.stockOptions : 0;
                gameState.metaUpgrades = savedState.metaUpgrades || {};

                logMessage("Welcome back. Game loaded.");
            } catch (e) {
                console.error("Save file corrupted");
                logMessage("Error loading save.");
            }
            return;
        }
    }
    logMessage("New game started.");
}

function resetGame() {
    if (confirm("Are you sure you want to resign and lose all progress?")) {
        // Expire the cookie
        document.cookie = "enterpriseSave=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        location.reload();
    }
}

window.onload = startGame;
