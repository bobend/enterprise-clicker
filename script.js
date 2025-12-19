// Enterprise Clicker Logic

var gameState = {
    cash: 0,
    lifetimeEarnings: 0,
    jobLevel: 0,
    upgrades: {} // id: count
};

// Configuration
var jobs = [
    { title: "Intern", baseRate: 0, clickPower: 1, promoteCost: 100 },
    { title: "Mailroom Clerk", baseRate: 1, clickPower: 2, promoteCost: 500 },
    { title: "Junior Associate", baseRate: 5, clickPower: 5, promoteCost: 2000 },
    { title: "Middle Manager", baseRate: 20, clickPower: 15, promoteCost: 10000 },
    { title: "Senior VP", baseRate: 100, clickPower: 50, promoteCost: 50000 },
    { title: "CEO", baseRate: 500, clickPower: 200, promoteCost: Infinity }
];

var upgradeList = [
    { id: "stapler", name: "Red Stapler", cost: 50, rate: 0.5, desc: "Keeps papers together. +$0.50/sec" },
    { id: "coffee", name: "Cheap Coffee", cost: 150, rate: 2, desc: "Caffeine boost. +$2.00/sec" },
    { id: "intern", name: "Unpaid Intern", cost: 500, rate: 5, desc: "Does the grunt work. +$5.00/sec" },
    { id: "copier", name: "Fax Machine", cost: 1200, rate: 10, desc: "Communication speed. +$10.00/sec" },
    { id: "computer", name: "Windows 95 PC", cost: 5000, rate: 40, desc: "High tech efficiency. +$40.00/sec" },
    { id: "server", name: "Mainframe", cost: 20000, rate: 100, desc: "Data processing. +$100.00/sec" }
];

// Loop variables
var tickRate = 1000; // 1 second
var gameLoop;

function startGame() {
    console.log("Starting Enterprise Clicker...");
    loadGame();
    initShop();
    updateDisplay();
    gameLoop = setInterval(gameTick, tickRate);
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

    return jobIncome + upgradeIncome;
}

function addCash(amount) {
    gameState.cash += amount;
    gameState.lifetimeEarnings += amount;
    updateDisplay();
}

function work() {
    var clickPower = jobs[gameState.jobLevel].clickPower;
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
            <div style="border: 1px outset white; background: #c0c0c0; padding: 5px; margin-bottom: 5px;">
                <b>${u.name}</b> (${count})<br>
                <small>${u.desc}</small><br>
                Cost: $${currentCost}<br>
                <button onclick="buyUpgrade('${u.id}')">Buy</button>
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
                gameState.cash = savedState.cash || 0;
                gameState.lifetimeEarnings = savedState.lifetimeEarnings || 0;
                gameState.jobLevel = savedState.jobLevel || 0;
                gameState.upgrades = savedState.upgrades || {};

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
