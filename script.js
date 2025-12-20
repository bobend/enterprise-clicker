// Enterprise Clicker Logic

var gameState = {
    cash: 0,
    lifetimeEarnings: 0,
    jobLevel: 0,
    upgrades: {}, // id: count
    stockOptions: 0,
    metaUpgrades: {}, // id: count
    sideProjects: {} // id: progress
};

var buyMultiplier = 1;

// Configuration
var projectList = [
    { id: "synergy_summit", name: "Synergy Summit", cost: 1000, goal: 100, desc: "Align key stakeholders. Reward: +5% Passive Income.", rewardType: "passive_mult", rewardValue: 0.05, icon: "images/project_synergy_summit.png" },
    { id: "rebranding", name: "Rebranding Campaign", cost: 5000, goal: 250, desc: "New logo, same problems. Reward: +10% Click Power.", rewardType: "click_mult", rewardValue: 0.10, icon: "images/project_rebranding.png" },
    { id: "offshore_accounts", name: "Offshore Accounts", cost: 25000, goal: 500, desc: "Tax optimization strategies. Reward: +10% Passive Income.", rewardType: "passive_mult", rewardValue: 0.10, icon: "images/project_offshore_accounts.png" },
    { id: "hostile_takeover", name: "Hostile Takeover", cost: 100000, goal: 1000, desc: "Acquire the competition. Reward: +20% Passive Income.", rewardType: "passive_mult", rewardValue: 0.20, icon: "images/project_hostile_takeover.png" },
    { id: "occult_ritual", name: "Occult Ritual", cost: 666666, goal: 666, desc: "Sacrifices must be made. Reward: +66% Click Power.", rewardType: "click_mult", rewardValue: 0.66, icon: "images/project_occult_ritual.png" },
    { id: "ai_slop_generator", name: "Generative Text Engine", cost: 1000000, goal: 2000, desc: "Flood the internet with content. Reward: +50% Passive Income. Warning: Unforeseen side effects.", rewardType: "passive_mult", rewardValue: 0.50, icon: "images/project_ai_slop_generator.png" },
    { id: "image_hallucinator", name: "Image Hallucinator", cost: 5000000, goal: 5000, desc: "Generate infinite visuals. Reward: +100% Click Power. Warning: Reality stability decreases.", rewardType: "click_mult", rewardValue: 1.00, icon: "images/project_image_hallucinator.png" }
];

var metaUpgradeList = [
    { id: "insider_trading", name: "Insider Trading", cost: 1, costScaling: 2, desc: "We know before they know. +10% Passive Income per level.", icon: "images/meta_insider_trading.png" },
    { id: "golden_parachute", name: "Golden Parachute", cost: 2, costScaling: 1.5, desc: "Safety first. Click power +20% per level.", icon: "images/meta_golden_parachute.png" },
    { id: "nepotism", name: "Nepotism", cost: 5, costScaling: 3, desc: "It's who you know. Start with $1000 extra cash per level after reset.", icon: "images/meta_nepotism.png" },
    { id: "blood_pact", name: "Blood Pact", cost: 10, costScaling: 5, desc: "Sign on the dotted line. +50% All Income.", icon: "images/meta_blood_pact.png" },
    { id: "void_investment", name: "Void Investment", cost: 50, costScaling: 10, desc: "Diversify into non-existence. Passive Income x2.", icon: "images/meta_void_investment.png" }
];

var jobs = [
    { title: "Intern", baseRate: 0, clickPower: 1, promoteCost: 100, image: "images/job_intern.png" },
    { title: "Mailroom Clerk", baseRate: 1, clickPower: 2, promoteCost: 500, image: "images/job_mailroom_clerk.png" },
    { title: "Junior Associate", baseRate: 5, clickPower: 5, promoteCost: 2000, image: "images/job_junior_associate.png" },
    { title: "Middle Manager", baseRate: 20, clickPower: 15, promoteCost: 10000, image: "images/job_middle_manager.png" },
    { title: "Senior VP", baseRate: 100, clickPower: 50, promoteCost: 50000, image: "images/job_senior_vp.png" },
    { title: "CEO", baseRate: 500, clickPower: 200, promoteCost: 250000, image: "images/job_ceo.png" },
    { title: "Board Member", baseRate: 2000, clickPower: 1000, promoteCost: 1000000, image: "images/job_board_member.png" },
    { title: "Chairman", baseRate: 10000, clickPower: 5000, promoteCost: 5000000, image: "images/job_chairman.png" },
    { title: "Shadow Director", baseRate: 50000, clickPower: 25000, promoteCost: 25000000, image: "images/job_shadow_director.png" },
    { title: "Grand Architect", baseRate: 200000, clickPower: 100000, promoteCost: 100000000, image: "images/job_grand_architect.png" },
    { title: "Elder God Avatar", baseRate: 1000000, clickPower: 500000, promoteCost: Infinity, image: "images/job_elder_god_avatar.png" }
];

var upgradeList = [
    { id: "stapler", name: "Red Stapler", cost: 50, rate: 0.5, desc: "A robust fastening device. +$0.50/sec", icon: "images/upgrade_stapler.png" },
    { id: "coffee", name: "Cheap Coffee", cost: 150, rate: 2, desc: "Fuel for the machine. +$2.00/sec", icon: "images/upgrade_coffee.png" },
    { id: "intern", name: "Unpaid Intern", cost: 500, rate: 5, desc: "Eager to please, easy to replace. +$5.00/sec", icon: "images/upgrade_intern.png" },
    { id: "copier", name: "Fax Machine", cost: 1200, rate: 10, desc: "Transmit data over copper wires. +$10.00/sec", icon: "images/upgrade_copier.png" },
    { id: "computer", name: "Office PC", cost: 5000, rate: 40, desc: "It runs Solitaire. +$40.00/sec", icon: "images/upgrade_computer.png" },
    { id: "server", name: "Mainframe", cost: 20000, rate: 100, desc: "Big iron for big data. +$100.00/sec", icon: "images/upgrade_server.png" },
    { id: "algorithm", name: "HFT Algorithm", cost: 100000, rate: 500, desc: "Trading faster than light. +$500.00/sec", icon: "images/upgrade_algorithm.png" },
    { id: "ai_manager", name: "AI Manager", cost: 500000, rate: 2500, desc: "Efficiency without empathy. +$2,500.00/sec", icon: "images/upgrade_ai_manager.png" },
    { id: "neural_link", name: "Neural Link", cost: 2500000, rate: 10000, desc: "Direct cortex integration. +$10,000.00/sec", icon: "images/upgrade_neural_link.png" },
    { id: "blood_ink", name: "Blood Ink", cost: 10000000, rate: 50000, desc: "Contracts that bind eternally. +$50,000.00/sec", icon: "images/upgrade_blood_ink.png" },
    { id: "soul_harvester", name: "Soul Harvester", cost: 50000000, rate: 250000, desc: "Automated extraction. +$250,000.00/sec", icon: "images/upgrade_soul_harvester.png" }
];

// Loop variables
var tickRate = 1000; // 1 second
var gameLoop;

function startGame() {
    console.log("Starting Enterprise Clicker...");
    loadGame();
    initShopControls();
    initShop();
    initMetaShop();
    initProjects();
    initMarket();
    initMicromanagement();
    updateDisplay();
    gameLoop = setInterval(gameTick, tickRate);
    setInterval(spawnFloatingIcon, 1500); // Spawn an icon every 1.5 seconds
    setInterval(updateTicker, 10000); // Update ticker every 10 seconds
}

function formatNumber(num) {
    if (num < 1000) return num.toFixed(2);

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

    updateMarket();
    updateMicromanagement();
    checkSideProjectConsequences();

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

    return total;
}

function addCash(amount) {
    gameState.cash += amount;
    gameState.lifetimeEarnings += amount;
    updateDisplay();
    updateShopVisibility();
    updateProjectVisibility();

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

function updateTicker() {
    var ticker = document.getElementById("game-ticker");
    if (!ticker) return;

    var msgs = [];
    var stocks = gameState.stockOptions;

    // Normal messages
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

    // Add some dynamic ones
    if (gameState.cash > 1000000) msgs.push("*** YOU ARE RICH ***");
    if (gameState.jobLevel >= 5) msgs.push("*** LEADERSHIP MATERIAL ***");

    var randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
    ticker.innerHTML = "<b>" + randomMsg + "</b>";
}

function work() {
    var clickPower = jobs[gameState.jobLevel].clickPower;

    // Golden Parachute Bonus
    var parachuteLevel = gameState.metaUpgrades["golden_parachute"] || 0;
    if (parachuteLevel > 0) {
        clickPower *= (1 + (parachuteLevel * 0.20));
    }

    // Side Project Bonuses
    for (var i = 0; i < projectList.length; i++) {
        var p = projectList[i];
        var progress = gameState.sideProjects[p.id] || 0;
        if (progress >= p.goal && p.rewardType === "click_mult") {
             clickPower *= (1 + p.rewardValue);
        }
    }

    addCash(clickPower);
    soundManager.playClick();
    logMessage("You did work. Earned $" + clickPower.toFixed(2));
}

function initShopControls() {
    var container = document.getElementById("shop-controls");
    if (!container) return;

    var multipliers = [1, 10, 100, "MAX"];
    var html = "Buy Amount: ";

    multipliers.forEach(function(m) {
        var style = (m === buyMultiplier) ? "font-weight: bold; background-color: white;" : "";
        var label = (m === "MAX") ? "MAX" : "x" + m;
        var val = (m === "MAX") ? "'MAX'" : m;
        html += `<button onclick="setMultiplier(${val})" style="${style}">${label}</button> `;
    });

    container.innerHTML = html;
}

function setMultiplier(m) {
    buyMultiplier = m;
    initShopControls();
    initShop();
    initProjects();
}

function getUpgradeCost(u, currentCount, amount) {
    var r = 1.15;
    var firstCost = u.cost * Math.pow(r, currentCount);

    if (amount === "MAX") {
        // Just return the cost of 1 for display purposes if needed,
        // but actual buy logic handles max.
        // For display in the list, we want to show cost of Max purchasable?
        // Or just "N/A"? Let's calculate how many we can afford.
        var maxAfford = calculateMaxAffordable(u, currentCount, gameState.cash);
        if (maxAfford === 0) return firstCost; // Show next one cost

        return firstCost * (Math.pow(r, maxAfford) - 1) / (r - 1);
    }

    var total = firstCost * (Math.pow(r, amount) - 1) / (r - 1);
    return Math.floor(total);
}

function calculateMaxAffordable(u, currentCount, cash) {
    var r = 1.15;
    var firstCost = u.cost * Math.pow(r, currentCount);

    if (cash < firstCost) return 0;

    // Formula derived from Sum = First * (r^n - 1) / (r - 1)
    // Cash * (r - 1) / First = r^n - 1
    // (Cash * (r - 1) / First) + 1 = r^n
    // n = log_r( ... )

    var maxN = Math.floor(Math.log((cash * (r - 1) / firstCost) + 1) / Math.log(r));
    return maxN;
}

function initShop() {
    var table = document.getElementById("shop-table");
    table.innerHTML = "";

    for (var i = 0; i < upgradeList.length; i++) {
        var u = upgradeList[i];
        var row = table.insertRow(-1);
        var cell = row.insertCell(0);

        var count = gameState.upgrades[u.id] || 0;

        var displayAmount = buyMultiplier;
        var cost = 0;

        if (buyMultiplier === "MAX") {
             var maxCanBuy = calculateMaxAffordable(u, count, gameState.cash);
             displayAmount = maxCanBuy > 0 ? maxCanBuy : 1;
             cost = getUpgradeCost(u, count, displayAmount); // if 0 can buy, shows cost of 1
             // If maxCanBuy is 0, getUpgradeCost with 1 will return cost of next 1
             if (maxCanBuy === 0) cost = getUpgradeCost(u, count, 1);
        } else {
            cost = getUpgradeCost(u, count, buyMultiplier);
        }

        // Assign an ID to the row for filtering
        row.id = "upgrade-row-" + u.id;

        var canAfford = gameState.cash >= cost;
        var btnDisabled = canAfford ? "" : "disabled";

        var btnClass = "btn-x1";
        if (buyMultiplier === 10) btnClass = "btn-x10";
        if (buyMultiplier === 100) btnClass = "btn-x100";
        if (buyMultiplier === "MAX") btnClass = "btn-max";

        var safeDesc = u.desc.replace(/'/g, "\\'");

        cell.innerHTML = `
            <div class="upgrade-row">
                <img src="${u.icon}" class="shop-icon upgrade-icon" alt="${u.name}" onmouseenter="showTooltip(event, '${safeDesc}')" onmousemove="moveTooltip(event)" onmouseleave="hideTooltip()">
                <div class="upgrade-details">
                    <b>${u.name}</b> (${count})<br>
                    <small>${u.desc}</small>
                </div>
                <div class="upgrade-actions">
                    <small>Cost: $${formatNumber(cost)}</small>
                    <button onclick="buyUpgrade('${u.id}')" ${btnDisabled} class="${btnClass}">Buy ${buyMultiplier === 'MAX' ? 'x' + displayAmount : 'x' + buyMultiplier}</button>
                </div>
            </div>
        `;
    }

    updateShopVisibility();
}

function updateShopVisibility() {
    var nextFound = false;

    for (var i = 0; i < upgradeList.length; i++) {
        var u = upgradeList[i];
        var row = document.getElementById("upgrade-row-" + u.id);
        if (!row) continue;

        var count = gameState.upgrades[u.id] || 0;
        var cost = getUpgradeCost(u, count, 1); // Check affordabilty of 1 unit
        var canAfford = gameState.cash >= cost;
        var isBought = count > 0;

        // "The only upgrade you have bought before or can afford or is the next upgrade you can save up for."
        // Meaning:
        // 1. We bought it at least once.
        // 2. OR we can afford it now.
        // 3. OR it's the *first* one we haven't bought and can't afford (the "next" target).

        var shouldShow = false;

        if (isBought) {
            shouldShow = true;
        } else if (canAfford) {
            shouldShow = true;
        } else if (!nextFound) {
            // This is the first unbought, unaffordable item
            shouldShow = true;
            nextFound = true;
        } else {
            // Unbought, unaffordable, and we already found the "next" target
            shouldShow = false;
        }

        row.style.display = shouldShow ? "" : "none";
    }
}

function buyUpgrade(id) {
    var u = upgradeList.find(x => x.id === id);
    var count = gameState.upgrades[id] || 0;

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

        var canAfford = gameState.stockOptions >= currentCost;
        var btnDisabled = canAfford ? "" : "disabled";

        var safeDesc = u.desc.replace(/'/g, "\\'");
        cell.innerHTML = `
            <div style="border: 1px outset gold; background: #000000; color: gold; padding: 5px; margin-bottom: 5px; display: flex; align-items: center;">
                 <img src="${u.icon}" class="shop-icon zoomable-icon" alt="${u.name}" style="margin-right: 10px; width: 32px; height: 32px; border: 1px solid gold;" onmouseenter="showTooltip(event, '${safeDesc}')" onmousemove="moveTooltip(event)" onmouseleave="hideTooltip()">
                 <div>
                    <b>${u.name}</b> (Lvl ${count})<br>
                    <small style="color: #ffffaa;">${u.desc}</small><br>
                    Cost: ${currentCost} Stocks<br>
                    <button onclick="buyMetaUpgrade('${u.id}')" style="background: gold; color: black; border-color: #886600;" ${btnDisabled}>Invest</button>
                 </div>
            </div>
        `;
    }
}

// --- TOOLTIP SYSTEM ---
function showTooltip(e, text) {
    var tooltip = document.getElementById("custom-tooltip");
    if (!tooltip) return;
    tooltip.innerHTML = text;
    tooltip.style.display = "block";
    moveTooltip(e);
}

function moveTooltip(e) {
    var tooltip = document.getElementById("custom-tooltip");
    if (!tooltip) return;

    // Offset slightly from cursor
    var x = e.pageX + 10;
    var y = e.pageY + 10;

    // Boundary check (optional/simple)
    if (x + 200 > window.innerWidth) {
        x = e.pageX - 210;
    }

    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
}

function hideTooltip() {
    var tooltip = document.getElementById("custom-tooltip");
    if (tooltip) tooltip.style.display = "none";
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
        initMetaShop();
        updateDisplay();
        saveGame();
    } else {
        logMessage("Insufficient Stock Options!");
    }
}

function initProjects() {
    var container = document.getElementById("project-list-container");
    if (!container) return; // Should exist if HTML is updated
    container.innerHTML = "";

    for (var i = 0; i < projectList.length; i++) {
        var p = projectList[i];
        var progress = gameState.sideProjects[p.id] || 0;
        var isComplete = progress >= p.goal;

        var pct = Math.min(100, Math.floor((progress / p.goal) * 100));
        var statusText = isComplete ? "COMPLETED" : pct + "%";

        var amount = 0;
        if (buyMultiplier === "MAX") {
            var maxAffordable = Math.floor(gameState.cash / p.cost);
            amount = Math.min(maxAffordable, p.goal - progress);
            if (amount <= 0 && !isComplete) amount = 1;
        } else {
            amount = Math.min(buyMultiplier, p.goal - progress);
            if (amount <= 0 && !isComplete) amount = 1;
        }

        var currentCost = p.cost * amount;
        var canAfford = gameState.cash >= currentCost;
        var buttonDisabled = (isComplete || !canAfford) ? "disabled" : "";
        var buttonText = isComplete ? "Done" : "Fund x" + amount + " ($" + currentCost.toLocaleString() + ")";

        // Determine button class based on multiplier
        var btnClass = "btn-x1";
        if (buyMultiplier === 10) btnClass = "btn-x10";
        if (buyMultiplier === 100) btnClass = "btn-x100";
        if (buyMultiplier === "MAX") btnClass = "btn-max";

        // Simple HTML progress bar
        var barColor = isComplete ? "#008000" : "#000080";
        var barHTML = `
            <div style="width: 100%; background-color: white; border: 1px inset gray; height: 16px; position: relative;">
                <div style="width: ${pct}%; background-color: ${barColor}; height: 100%; position: absolute; top: 0; left: 0;"></div>
                <div style="position: absolute; top: 0; left: 0; width: 100%; text-align: center; color: ${pct > 50 ? 'white' : 'black'}; font-size: 10px; line-height: 16px;">
                    ${statusText}
                </div>
            </div>
        `;

        var div = document.createElement("div");
        div.style.marginBottom = "10px";
        div.style.padding = "5px";
        div.style.border = "1px outset white";
        div.style.backgroundColor = "#c0c0c0";
        div.id = "project-row-" + p.id;

        // Add Icon if available
        var iconHtml = "";
        if (p.icon) {
            var safeDesc = p.desc.replace(/'/g, "\\'");
            iconHtml = `<img src="${p.icon}" class="zoomable-icon" style="width: 32px; height: 32px; margin-right: 5px; border: 1px solid gray;" onmouseenter="showTooltip(event, '${safeDesc}')" onmousemove="moveTooltip(event)" onmouseleave="hideTooltip()">`;
        }

        div.innerHTML = `
            <div style="display: flex; align-items: center;">
                ${iconHtml}
                <div>
                    <b>${p.name}</b><br>
                    <small>${p.desc}</small>
                </div>
            </div>
            <div style="margin-top: 5px;">
                ${barHTML}
            </div>
            <div style="margin-top: 5px; text-align: right;">
                <button onclick="contributeProject('${p.id}')" ${buttonDisabled} class="${btnClass}" style="font-size: 10px;">${buttonText}</button>
            </div>
        `;
        container.appendChild(div);
    }
    updateProjectVisibility();
}

function updateProjectVisibility() {
    var nextFound = false;

    for (var i = 0; i < projectList.length; i++) {
        var p = projectList[i];
        var row = document.getElementById("project-row-" + p.id);
        if (!row) continue;

        var progress = gameState.sideProjects[p.id] || 0;
        var isStarted = progress > 0;
        var canAfford = gameState.cash >= p.cost; // Base cost check for visibility

        var shouldShow = false;

        if (isStarted) {
            shouldShow = true;
        } else if (canAfford) {
            shouldShow = true;
        } else if (!nextFound) {
            // First unstarted, unaffordable project
            shouldShow = true;
            nextFound = true;
        } else {
            shouldShow = false;
        }

        row.style.display = shouldShow ? "" : "none";
    }
}

function contributeProject(id) {
    var p = projectList.find(x => x.id === id);
    if (!p) return;

    var progress = gameState.sideProjects[id] || 0;
    if (progress >= p.goal) return;

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
            updateDisplay(); // Recalculate bonuses immediately
        }

        initProjects(); // Refresh UI
        updateDisplay(); // Refresh cash display
    } else {
        logMessage("Not enough cash to fund project.");
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
    document.getElementById('cash-display').textContent = "$" + formatNumber(gameState.cash);
    document.getElementById('lifetime-display').textContent = "$" + formatNumber(gameState.lifetimeEarnings);
    document.getElementById('passive-display').textContent = "$" + formatNumber(getPassiveIncome());
    var job = jobs[gameState.jobLevel];
    document.getElementById('job-title').textContent = job.title;

    // Update Job Splash
    var splashImg = document.getElementById("job-splash");
    if (splashImg && job.image) {
        if (splashImg.getAttribute("src") !== job.image) { // avoid flicker
             splashImg.src = job.image;
        }
        splashImg.style.display = "block";
    } else if (splashImg) {
        splashImg.style.display = "none";
    }

    var nextPromote = job.promoteCost;
    var promoText = (nextPromote === Infinity) ? "MAX LEVEL" : "$" + formatNumber(nextPromote);
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

    updateTheme();
}

// Sound Manager
var soundManager = {
    audioCtx: null,
    musicInterval: null,
    isMuted: false,
    currentTheme: "normal", // normal, unsettling, eldritch

    init: function() {
        try {
            var AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
            this.renderControls();

            // Auto-resume on first interaction
            var _this = this;
            var resumeFunc = function() {
                if (_this.audioCtx && _this.audioCtx.state === 'suspended') {
                    _this.audioCtx.resume();
                }
                document.removeEventListener('click', resumeFunc);
                document.removeEventListener('keydown', resumeFunc);
            };
            document.addEventListener('click', resumeFunc);
            document.addEventListener('keydown', resumeFunc);

        } catch (e) {
            console.error("Web Audio API not supported");
        }
    },

    toggleMute: function() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopMusic();
        } else {
            if (this.audioCtx && this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
            this.startMusic();
        }
        this.renderControls();
    },

    renderControls: function() {
        var container = document.getElementById("audio-controls-placeholder");
        if (container) {
            var text = this.isMuted ? "Enable Audio" : "Mute Audio";
            container.innerHTML = ` | <button onclick="soundManager.toggleMute()">${text}</button>`;
        }
    },

    playClick: function() {
        if (this.isMuted || !this.audioCtx) return;

        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        var osc = this.audioCtx.createOscillator();
        var gain = this.audioCtx.createGain();

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        // Short high beep for retro feel
        osc.type = "square";
        osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.1);
    },

    startMusic: function() {
        if (this.isMuted || !this.audioCtx) return;

        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        if (this.musicInterval) clearInterval(this.musicInterval);

        // Music logic based on theme
        var _this = this;
        var beatTime = 500; // ms
        var notes = [];

        if (this.currentTheme === "eldritch") {
            // Low, slow, dissonant
            beatTime = 800;
            notes = [110, 103, 97, 103, 82]; // A2, G#2, G2...
        } else if (this.currentTheme === "unsettling") {
            // Minor, slightly faster
            beatTime = 600;
            notes = [220, 261, 311, 293]; // A3, C4, Eb4, D4
        } else {
            // Happy major arpeggio
            beatTime = 400;
            notes = [440, 554, 659, 880]; // A4, C#5, E5, A5
        }

        var noteIndex = 0;
        this.musicInterval = setInterval(function() {
            if (_this.isMuted) return;

            var freq = notes[noteIndex % notes.length];
            _this.playNote(freq);
            noteIndex++;
        }, beatTime);
    },

    stopMusic: function() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    },

    playNote: function(freq) {
        if (!this.audioCtx) return;

        var osc = this.audioCtx.createOscillator();
        var gain = this.audioCtx.createGain();

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        // Simple synth tone
        osc.type = (this.currentTheme === "eldritch") ? "sawtooth" : "triangle";
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

        // Envelope
        var now = this.audioCtx.currentTime;
        var dur = 0.3;

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.start(now);
        osc.stop(now + dur);
    },

    setTheme: function(theme) {
        if (this.currentTheme !== theme) {
            this.currentTheme = theme;
            if (!this.isMuted) {
                this.startMusic();
            }
        }
    }
};

function updateTheme() {
    var stocks = gameState.stockOptions;
    var body = document.body;

    // Reset classes
    body.classList.remove("theme-unsettling");
    body.classList.remove("theme-eldritch");

    var newTheme = "normal";

    if (stocks >= 1000) {
        body.classList.add("theme-eldritch");
        newTheme = "eldritch";
    } else if (stocks >= 50) {
        body.classList.add("theme-unsettling");
        newTheme = "unsettling";
    }

    // Initialize audio context on first theme update (usually start) if not done
    if (!soundManager.audioCtx) {
        soundManager.init();
    }
    soundManager.setTheme(newTheme);
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
    // Note: sideProjects persist across runs like metaUpgrades? Or do they reset?
    // Request says "Add multiple new side projects... on the higher accessions."
    // Usually side projects in these games might reset. But given the high costs and goals, let's keep them persistent OR reset them.
    // "Customize the ticket... depended on the game progress."
    // Let's assume Side Projects are run-specific but provide powerful bonuses.
    // If they are persistent, they would be meta-upgrades.
    // So let's reset them.
    gameState.sideProjects = {};

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
                gameState.sideProjects = savedState.sideProjects || {};
                gameState.stocksOwned = savedState.stocksOwned || {};

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

function toggleSaveMenu() {
    var menu = document.getElementById("save-menu");
    if (menu.style.display === "none") {
        menu.style.display = "block";
    } else {
        menu.style.display = "none";
    }
}

function exportSave() {
    // Generate base64 encoded save string to make it look "techy" and prevent accidental edits
    var saveString = JSON.stringify(gameState);
    var encoded = btoa(saveString);
    document.getElementById("export-area").value = encoded;
    document.getElementById("export-area").select();
    document.execCommand("copy");
    logMessage("Save data copied to clipboard.");
}

function importSave() {
    var encoded = document.getElementById("import-area").value;
    if (!encoded) return;

    try {
        var decoded = atob(encoded);
        var newState = JSON.parse(decoded);

        // Basic validation
        if (typeof newState.cash === 'undefined') throw new Error("Invalid save format");

        if (confirm("Overwrite current progress with imported data?")) {
            gameState = newState;
            // Re-merge with defaults in case of version mismatch
            gameState.upgrades = gameState.upgrades || {};
            gameState.metaUpgrades = gameState.metaUpgrades || {};
            gameState.sideProjects = gameState.sideProjects || {};

            saveGame();
            location.reload();
        }
    } catch (e) {
        alert("Invalid Save Data!");
        console.error(e);
    }
}

window.onload = startGame;

// --- STONKS MARKET ---
var stockMarket = [];
var stockTickTimer = 0;
var stockUpdateInterval = 5; // update every 5 ticks

function initMarket() {
    // Check if market already initialized (e.g. from save)
    if (!gameState.stocksOwned) {
        gameState.stocksOwned = {};
    }

    stockMarket = [
        { symbol: "VOID", name: "Void Corp", price: 10.00, volatility: 0.15, trend: 0, history: [] },
        { symbol: "BLUD", name: "Blood Bank", price: 25.00, volatility: 0.05, trend: 0.02, history: [] },
        { symbol: "SYNR", name: "Synergy Ltd", price: 50.00, volatility: 0.08, trend: -0.01, history: [] },
        { symbol: "SOUL", name: "Soul Systems", price: 100.00, volatility: 0.12, trend: 0, history: [] },
        { symbol: "GLITCH", name: "Null Pointer", price: 5.00, volatility: 0.25, trend: 0.05, history: [] }
    ];

    // Initial render
    updateMarketDisplay();
}

function updateMarket() {
    stockTickTimer++;
    if (stockTickTimer < stockUpdateInterval) return;
    stockTickTimer = 0;

    for (var i = 0; i < stockMarket.length; i++) {
        var s = stockMarket[i];

        // Random walk
        var change = (Math.random() - 0.5) * s.volatility;
        // Trend bias
        change += s.trend;

        // Update price
        s.price = s.price * (1 + change);
        if (s.price < 0.10) s.price = 0.10; // Floor

        // Update history
        if (!s.history) s.history = [];
        s.history.push(s.price);
        if (s.history.length > 20) s.history.shift();

        // Update trend occasionally
        if (Math.random() < 0.05) {
            s.trend = (Math.random() - 0.5) * 0.05;
        }
    }

    updateMarketDisplay();
}

function generateSparkline(history) {
    if (!history || history.length < 2) return "";

    var width = 60;
    var height = 20;
    var min = Math.min(...history);
    var max = Math.max(...history);
    var range = max - min;
    if (range === 0) range = 1;

    var points = history.map((val, index) => {
        var x = (index / (history.length - 1)) * width;
        var y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(" ");

    var color = history[history.length - 1] >= history[0] ? "#00ff00" : "#ff0000";

    return `<svg width="${width}" height="${height}" style="background: black; border: 1px solid #333;">
                <polyline points="${points}" style="fill:none;stroke:${color};stroke-width:1" />
            </svg>`;
}

function updateMarketDisplay() {
    var container = document.getElementById("stock-market-display");
    if (!container) return;

    var html = "";

    for (var i = 0; i < stockMarket.length; i++) {
        var s = stockMarket[i];
        var owned = gameState.stocksOwned[s.symbol] || 0;

        // Determine color based on trend/change (simplified here just by trend for now)
        var trendClass = s.trend >= 0 ? "stock-up" : "stock-down";
        var trendSymbol = s.trend >= 0 ? "▲" : "▼";

        var sparkline = generateSparkline(s.history || []);

        html += `
            <div class="stock-ticker-row">
                <div style="width: 25%;">
                    <span class="stock-symbol">${s.symbol}</span><br>
                    <span style="font-size:10px;">Owned: ${owned}</span>
                </div>
                <div style="width: 20%;">
                    ${sparkline}
                </div>
                <div style="width: 25%; text-align: right;" class="stock-price">
                    $${s.price.toFixed(2)}
                </div>
                <div style="width: 30%; text-align: right;">
                    <button onclick="buyStock('${s.symbol}')" style="font-size: 10px; padding: 1px 3px;">Buy</button>
                    <button onclick="sellStock('${s.symbol}')" style="font-size: 10px; padding: 1px 3px;">Sell</button>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

function buyStock(symbol) {
    var s = stockMarket.find(x => x.symbol === symbol);
    if (!s) return;

    // Buy 1 or based on multiplier? simplified to 1 for now or 10 if shift click?
    // Let's use global multiplier
    var amount = (buyMultiplier === "MAX") ? 1 : buyMultiplier;
    if (amount === "MAX") amount = 1; // Fallback for stocks

    var cost = s.price * amount;

    if (gameState.cash >= cost) {
        gameState.cash -= cost;
        gameState.stocksOwned[symbol] = (gameState.stocksOwned[symbol] || 0) + amount;
        logMessage(`Bought ${amount} ${symbol} @ $${s.price.toFixed(2)}`);
        updateDisplay();
        updateMarketDisplay();
    } else {
        logMessage("Not enough cash for stocks.");
    }
}

function sellStock(symbol) {
    var s = stockMarket.find(x => x.symbol === symbol);
    if (!s) return;

    var owned = gameState.stocksOwned[symbol] || 0;
    var amount = (buyMultiplier === "MAX") ? owned : buyMultiplier;

    if (owned >= amount && amount > 0) {
        var val = s.price * amount;
        gameState.cash += val;
        gameState.stocksOwned[symbol] -= amount;
        logMessage(`Sold ${amount} ${symbol} @ $${s.price.toFixed(2)}`);
        updateDisplay();
        updateMarketDisplay();
    } else {
        logMessage("Not enough stocks to sell.");
    }
}

// --- SIDE PROJECT CONSEQUENCES ---
function checkSideProjectConsequences() {
    // Check for AI Slop
    var slopProgress = gameState.sideProjects["ai_slop_generator"] || 0;
    var slopGoal = projectList.find(p => p.id === "ai_slop_generator").goal;

    if (slopProgress >= slopGoal) {
        if (Math.random() < 0.005) { // 0.5% chance per tick
            triggerGlitch("text");
        }
    }

    // Check for Image Hallucinator
    var hallucinationProgress = gameState.sideProjects["image_hallucinator"] || 0;
    var hallucinationGoal = projectList.find(p => p.id === "image_hallucinator").goal;

    if (hallucinationProgress >= hallucinationGoal) {
        if (Math.random() < 0.005) {
            triggerGlitch("image");
        }
    }
}

function triggerGlitch(type) {
    var body = document.body;

    if (type === "text") {
        var ticker = document.getElementById("game-ticker");
        var originalText = ticker.innerHTML;

        // Temporarily garble text
        var chars = "¥§©®±¶$#@%&";
        var garbled = "";
        for (var i = 0; i < 20; i++) garbled += chars.charAt(Math.floor(Math.random() * chars.length));

        ticker.innerHTML = `<b>*** ${garbled} ***</b>`;

        setTimeout(function() {
            if (ticker) ticker.innerHTML = originalText;
        }, 2000);

        logMessage("SYSTEM ALERT: Semantic drift detected.");
    } else if (type === "image") {
        // Invert colors briefly
        var originalFilter = body.style.filter;
        body.style.filter = "invert(100%) hue-rotate(180deg)";

        setTimeout(function() {
            body.style.filter = originalFilter;
        }, 500); // 0.5s flash

        logMessage("SYSTEM ALERT: Visual cortex buffer overflow.");
    }
}

// --- MICROMANAGEMENT ---
var employees = [];
var microTickTimer = 0;

function initMicromanagement() {
    // Generate some dummy employees if not exists
    // Ideally this would be persistent, but for now we generate fresh or from simple state if we wanted
    // Let's keep it simple: reset on load or keep in memory if we add it to save.
    // Since we didn't add it to save structure explicitly, we'll re-init.

    employees = [
        { id: 1, name: "Bob", role: "Intern", stress: 10, productivity: 50 },
        { id: 2, name: "Alice", role: "Clerk", stress: 20, productivity: 60 },
        { id: 3, name: "Dave", role: "Developer", stress: 30, productivity: 70 }
    ];

    updateMicromanagementUI();
}

function updateMicromanagement() {
    // Only available if Middle Manager or higher (index 3)
    if (gameState.jobLevel < 3) {
        var container = document.getElementById("micromanagement-container");
        if (container) container.style.display = "none";
        return;
    }

    // Show container
    var container = document.getElementById("micromanagement-container");
    if (container && container.style.display === "none") {
        container.style.display = "block";
        logMessage("Micromanagement Module Unlocked.");
    }

    microTickTimer++;
    if (microTickTimer < 2) return; // Update slower than tick
    microTickTimer = 0;

    // Passive changes
    employees.forEach(e => {
        // Stress goes up, productivity goes down over time
        e.stress = Math.min(100, e.stress + 0.5);
        if (e.stress > 80) {
            e.productivity = Math.max(0, e.productivity - 1);
        }
    });

    updateMicromanagementUI();
}

function updateMicromanagementUI() {
    var list = document.getElementById("employee-list");
    if (!list) return;

    // Check visibility logic again just in case
    if (gameState.jobLevel < 3) return;

    var html = "";
    employees.forEach(e => {
        // Color coding
        var stressColor = e.stress > 80 ? "red" : (e.stress > 50 ? "orange" : "green");

        html += `
            <div class="employee-card">
                <div style="display: flex; justify-content: space-between;">
                    <b>${e.name} (${e.role})</b>
                    <button onclick="motivateEmployee(${e.id})" style="font-size: 9px;">Motivate</button>
                </div>
                <div style="font-size: 10px;">
                    Stress: <span style="color:${stressColor}">${Math.floor(e.stress)}%</span>
                    <div class="employee-stats-bar">
                        <div class="employee-stats-fill" style="width: ${e.stress}%; background-color: ${stressColor};"></div>
                    </div>
                </div>
                <div style="font-size: 10px; margin-top: 2px;">
                    Productivity: ${Math.floor(e.productivity)}%
                    <div class="employee-stats-bar">
                        <div class="employee-stats-fill" style="width: ${e.productivity}%; background-color: blue;"></div>
                    </div>
                </div>
            </div>
        `;
    });

    list.innerHTML = html;
}

function motivateEmployee(id) {
    var e = employees.find(x => x.id === id);
    if (!e) return;

    // Motivate: Reduces stress, boosts productivity slightly
    // Cost? Maybe free but has cooldown? Or costs cash?
    // Let's make it cost a small amount of cash based on job level to keep it relevant?
    // Or just simple clicker mechanic.

    e.stress = Math.max(0, e.stress - 20);
    e.productivity = Math.min(100, e.productivity + 10);

    soundManager.playClick();
    updateMicromanagementUI();
}
