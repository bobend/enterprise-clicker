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
    { id: "synergy_summit", name: "Synergy Summit", cost: 1000, goal: 100, desc: "Coordinate business efforts. Reward: +5% Passive Income.", rewardType: "passive_mult", rewardValue: 0.05 },
    { id: "rebranding", name: "Rebranding Campaign", cost: 5000, goal: 250, desc: "New logo, same great taste. Reward: +10% Click Power.", rewardType: "click_mult", rewardValue: 0.10 },
    { id: "offshore_accounts", name: "Offshore Accounts", cost: 25000, goal: 500, desc: "Hide assets. Reward: +10% Passive Income.", rewardType: "passive_mult", rewardValue: 0.10 },
    { id: "hostile_takeover", name: "Hostile Takeover", cost: 100000, goal: 1000, desc: "Acquire competition. Reward: +20% Passive Income.", rewardType: "passive_mult", rewardValue: 0.20 },
    { id: "occult_ritual", name: "Occult Ritual", cost: 666666, goal: 666, desc: "Sacrifice for power. Reward: +66% Click Power.", rewardType: "click_mult", rewardValue: 0.66 }
];

var metaUpgradeList = [
    { id: "insider_trading", name: "Insider Trading", cost: 1, costScaling: 2, desc: "+10% Passive Income per level.", icon: "images/chart.ico" },
    { id: "golden_parachute", name: "Golden Parachute", cost: 2, costScaling: 1.5, desc: "Click power +20% per level.", icon: "images/moneybag.ico" },
    { id: "nepotism", name: "Nepotism", cost: 5, costScaling: 3, desc: "Start with $1000 extra cash per level after reset.", icon: "images/handshake.ico" },
    { id: "blood_pact", name: "Blood Pact", cost: 10, costScaling: 5, desc: "Unlocks 1 additional Upgrade in shop (wip). For now: +50% All Income.", icon: "images/ink.svg" },
    { id: "void_investment", name: "Void Investment", cost: 50, costScaling: 10, desc: "Capitalize on nothingness. Passive Income x2.", icon: "images/void.svg" }
];

var jobs = [
    { title: "Intern", baseRate: 0, clickPower: 1, promoteCost: 100 },
    { title: "Mailroom Clerk", baseRate: 1, clickPower: 2, promoteCost: 500 },
    { title: "Junior Associate", baseRate: 5, clickPower: 5, promoteCost: 2000 },
    { title: "Middle Manager", baseRate: 20, clickPower: 15, promoteCost: 10000 },
    { title: "Senior VP", baseRate: 100, clickPower: 50, promoteCost: 50000 },
    { title: "CEO", baseRate: 500, clickPower: 200, promoteCost: 250000 },
    { title: "Board Member", baseRate: 2000, clickPower: 1000, promoteCost: 1000000 },
    { title: "Chairman", baseRate: 10000, clickPower: 5000, promoteCost: 5000000 },
    { title: "Shadow Director", baseRate: 50000, clickPower: 25000, promoteCost: 25000000 },
    { title: "Grand Architect", baseRate: 200000, clickPower: 100000, promoteCost: 100000000 },
    { title: "Elder God Avatar", baseRate: 1000000, clickPower: 500000, promoteCost: Infinity }
];

var upgradeList = [
    { id: "stapler", name: "Red Stapler", cost: 50, rate: 0.5, desc: "Keeps papers together. +$0.50/sec", icon: "images/stapler.ico" },
    { id: "coffee", name: "Cheap Coffee", cost: 150, rate: 2, desc: "Caffeine boost. +$2.00/sec", icon: "images/coffee.ico" },
    { id: "intern", name: "Unpaid Intern", cost: 500, rate: 5, desc: "Does the grunt work. +$5.00/sec", icon: "images/intern.ico" },
    { id: "copier", name: "Fax Machine", cost: 1200, rate: 10, desc: "Communication speed. +$10.00/sec", icon: "images/fax.ico" },
    { id: "computer", name: "Windows 95 PC", cost: 5000, rate: 40, desc: "High tech efficiency. +$40.00/sec", icon: "images/computer.ico" },
    { id: "server", name: "Mainframe", cost: 20000, rate: 100, desc: "Data processing. +$100.00/sec", icon: "images/mainframe.ico" },
    { id: "algorithm", name: "HFT Algorithm", cost: 100000, rate: 500, desc: "Microsecond trading. +$500.00/sec", icon: "images/chart.ico" },
    { id: "ai_manager", name: "AI Manager", cost: 500000, rate: 2500, desc: "Optimizes workflow. +$2,500.00/sec", icon: "images/computer.ico" },
    { id: "neural_link", name: "Neural Link", cost: 2500000, rate: 10000, desc: "Direct brain interface. +$10,000.00/sec", icon: "images/mainframe.ico" },
    { id: "blood_ink", name: "Blood Ink", cost: 10000000, rate: 50000, desc: "Contracts are binding. +$50,000.00/sec", icon: "images/ink.svg" },
    { id: "soul_harvester", name: "Soul Harvester", cost: 50000000, rate: 250000, desc: "Automated extraction. +$250,000.00/sec", icon: "images/skull.svg" }
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
    updateDisplay();
    gameLoop = setInterval(gameTick, tickRate);
    setInterval(spawnFloatingIcon, 1500); // Spawn an icon every 1.5 seconds
    setInterval(updateTicker, 10000); // Update ticker every 10 seconds
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

    var multipliers = [1, 10, 100];
    var html = "Buy Amount: ";

    multipliers.forEach(function(m) {
        var style = (m === buyMultiplier) ? "font-weight: bold; background-color: white;" : "";
        html += `<button onclick="setMultiplier(${m})" style="${style}">x${m}</button> `;
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
    // Geometric series sum: Base * r^k * (r^n - 1) / (r - 1)
    // where r is 1.15
    // But since the loop is cleaner for small N and prevents precision errors with formula,
    // let's do a loop for now (max 100 iterations is trivial).
    // Or optimized:
    // First item cost: u.cost * 1.15^currentCount
    // Sum = FirstCost * (1.15^amount - 1) / (1.15 - 1)

    var firstCost = u.cost * Math.pow(1.15, currentCount);
    var r = 1.15;

    // Using formula for geometric series sum: S_n = a(1-r^n)/(1-r)
    // Here we want sum of costs.
    // Cost(i) = Base * 1.15^(current + i)
    // Sum = Base * 1.15^current * (1 + 1.15 + ... + 1.15^(amount-1))
    // Sum = Base * 1.15^current * ((1.15^amount - 1) / (1.15 - 1))

    var total = firstCost * (Math.pow(r, amount) - 1) / (r - 1);
    return Math.floor(total);
}

function initShop() {
    var table = document.getElementById("shop-table");
    table.innerHTML = "";

    for (var i = 0; i < upgradeList.length; i++) {
        var u = upgradeList[i];
        var row = table.insertRow(-1);
        var cell = row.insertCell(0);

        var count = gameState.upgrades[u.id] || 0;
        var cost = getUpgradeCost(u, count, buyMultiplier);

        // Assign an ID to the row for filtering
        row.id = "upgrade-row-" + u.id;

        cell.innerHTML = `
            <div class="upgrade-row">
                <img src="${u.icon}" class="shop-icon upgrade-icon" alt="${u.name}">
                <div class="upgrade-details">
                    <b>${u.name}</b> (${count})<br>
                    <small>${u.desc}</small>
                </div>
                <div class="upgrade-actions">
                    <small>Cost: $${cost.toLocaleString()}</small>
                    <button onclick="buyUpgrade('${u.id}')">Buy x${buyMultiplier}</button>
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
    var cost = getUpgradeCost(u, count, buyMultiplier);

    if (gameState.cash >= cost) {
        gameState.cash -= cost;
        gameState.upgrades[id] = count + buyMultiplier;
        soundManager.playClick();
        logMessage("Bought " + buyMultiplier + "x " + u.name);
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
        var buttonDisabled = isComplete ? "disabled" : "";

        var amount = Math.min(buyMultiplier, p.goal - progress);
        if (amount <= 0 && !isComplete) amount = 1; // Fallback

        var currentCost = p.cost * amount;
        var buttonText = isComplete ? "Done" : "Fund x" + amount + " ($" + currentCost.toLocaleString() + ")";

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

        div.innerHTML = `
            <b>${p.name}</b><br>
            <small>${p.desc}</small><br>
            ${barHTML}
            <div style="margin-top: 5px; text-align: right;">
                <button onclick="contributeProject('${p.id}')" ${buttonDisabled} style="font-size: 10px;">${buttonText}</button>
            </div>
        `;
        container.appendChild(div);
    }
}

function contributeProject(id) {
    var p = projectList.find(x => x.id === id);
    if (!p) return;

    var progress = gameState.sideProjects[id] || 0;
    if (progress >= p.goal) return;

    var amount = Math.min(buyMultiplier, p.goal - progress);
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
