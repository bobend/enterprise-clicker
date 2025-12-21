import { gameState, saveGame } from './state.js';
import { formatNumber, getPassiveIncome, getUpgradeCost, calculateMaxAffordable, calculateStockOptions } from './logic.js';
import { soundManager } from './audio.js';
import { upgradeList, metaUpgradeList, projectList, jobs } from './constants.js';
import { stockMarket, generateSparkline, motivateEmployee as motivateEmployeeLogic } from './minigames.js';

var buyMultiplier = 1;

export function getBuyMultiplier() {
    return buyMultiplier;
}

export function logMessage(msg) {
    var log = document.getElementById("message-log");
    if (!log) return;
    var entry = document.createElement("div");
    entry.textContent = "> " + msg;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

export function updateDisplay() {
    var cashDisplay = document.getElementById('cash-display');
    if (cashDisplay) cashDisplay.textContent = "$" + formatNumber(gameState.cash);

    var lifetimeDisplay = document.getElementById('lifetime-display');
    if (lifetimeDisplay) lifetimeDisplay.textContent = "$" + formatNumber(gameState.lifetimeEarnings);

    var passiveDisplay = document.getElementById('passive-display');
    if (passiveDisplay) passiveDisplay.textContent = "$" + formatNumber(getPassiveIncome());

    var job = jobs[gameState.jobLevel];
    var jobTitle = document.getElementById('job-title');
    if (jobTitle) jobTitle.textContent = job.title;

    var splashImg = document.getElementById("job-splash");
    if (splashImg && job.image) {
        if (splashImg.getAttribute("src") !== job.image) {
             splashImg.src = job.image;
        }
        splashImg.style.display = "block";
    } else if (splashImg) {
        splashImg.style.display = "none";
    }

    var nextPromote = job.promoteCost;
    var promoText = (nextPromote === Infinity) ? "MAX LEVEL" : "$" + formatNumber(nextPromote);
    var promoCostDisplay = document.getElementById('next-promotion-cost');
    if (promoCostDisplay) promoCostDisplay.textContent = promoText;

    var promoteBtn = document.getElementById('promote-btn');
    if (promoteBtn) {
        promoteBtn.disabled = !(nextPromote !== Infinity && gameState.cash >= nextPromote);
    }

    var pendingStock = calculateStockOptions();
    var retireBtn = document.getElementById('retire-btn');
    if (retireBtn) {
        retireBtn.title = "Retire now to earn " + pendingStock + " Stock Options";
    }
    var stockDisplay = document.getElementById('stock-display');
    if (stockDisplay) stockDisplay.textContent = gameState.stockOptions;

    var pendingStockDisplay = document.getElementById('pending-stock-display');
    if (pendingStockDisplay) pendingStockDisplay.textContent = pendingStock;

    updateTheme();
}

export function updateShopVisibility() {
    var nextFound = false;

    for (var i = 0; i < upgradeList.length; i++) {
        var u = upgradeList[i];
        var row = document.getElementById("upgrade-row-" + u.id);
        if (!row) continue;

        var count = gameState.upgrades[u.id] || 0;
        var cost = getUpgradeCost(u, count, 1);
        var canAfford = gameState.cash >= cost;
        var isBought = count > 0;

        var shouldShow = false;

        if (isBought) {
            shouldShow = true;
        } else if (canAfford) {
            shouldShow = true;
        } else if (!nextFound) {
            shouldShow = true;
            nextFound = true;
        } else {
            shouldShow = false;
        }

        row.style.display = shouldShow ? "" : "none";
    }
}

export function updateProjectVisibility() {
    var nextFound = false;

    for (var i = 0; i < projectList.length; i++) {
        var p = projectList[i];
        var row = document.getElementById("project-row-" + p.id);
        if (!row) continue;

        var progress = gameState.sideProjects[p.id] || 0;
        var isStarted = progress > 0;
        var canAfford = gameState.cash >= p.cost;

        var shouldShow = false;

        if (isStarted) {
            shouldShow = true;
        } else if (canAfford) {
            shouldShow = true;
        } else if (!nextFound) {
            shouldShow = true;
            nextFound = true;
        } else {
            shouldShow = false;
        }

        row.style.display = shouldShow ? "" : "none";
    }
}

export function initShopControls() {
    var container = document.getElementById("shop-controls");
    if (!container) return;

    var multipliers = [1, 10, 100, "MAX"];
    var html = "Buy Amount: ";

    multipliers.forEach(function(m) {
        var style = (m === buyMultiplier) ? "font-weight: bold; background-color: white;" : "";
        var label = (m === "MAX") ? "MAX" : "x" + m;
        var val = (m === "MAX") ? "'MAX'" : m;
        // Note: inline onclick needs access to global function. Since we are module, we must attach to window or use event listeners.
        // For simplicity during refactor, we will attach a global handler in main.js
        html += `<button class="shop-control-btn" data-multiplier="${label}" style="${style}">${label}</button> `;
    });

    container.innerHTML = html;

    // Attach listeners
    const btns = container.getElementsByClassName('shop-control-btn');
    for (let btn of btns) {
        btn.onclick = () => {
             let val = btn.getAttribute('data-multiplier');
             if (val !== 'MAX') val = parseInt(val.replace('x', ''));
             setMultiplier(val);
        };
    }
}

function setMultiplier(m) {
    buyMultiplier = m;
    initShopControls();
    initShop();
    initProjects();
}

export function initShop(buyUpgradeCallback) {
    var table = document.getElementById("shop-table");
    if (!table) return;
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
             if (maxCanBuy === 0) cost = getUpgradeCost(u, count, 1);
             else cost = getUpgradeCost(u, count, displayAmount);
        } else {
            cost = getUpgradeCost(u, count, buyMultiplier);
        }

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
                <img src="${u.icon}" class="shop-icon upgrade-icon" alt="${u.name}"
                     onmouseenter="window.showTooltip(event, '${safeDesc}')"
                     onmousemove="window.moveTooltip(event)"
                     onmouseleave="window.hideTooltip()">
                <div class="upgrade-details">
                    <b>${u.name}</b> (${count})<br>
                    <small>${u.desc}</small>
                </div>
                <div class="upgrade-actions">
                    <small>Cost: $${formatNumber(cost)}</small>
                    <button class="buy-upgrade-btn ${btnClass}" data-id="${u.id}" ${btnDisabled}>Buy ${buyMultiplier === 'MAX' ? 'x' + displayAmount : 'x' + buyMultiplier}</button>
                </div>
            </div>
        `;
    }

    // Attach listeners
    const btns = table.getElementsByClassName('buy-upgrade-btn');
    for (let btn of btns) {
        btn.onclick = () => buyUpgradeCallback(btn.getAttribute('data-id'));
    }

    updateShopVisibility();
}

export function initMetaShop(buyMetaCallback) {
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
            <div class="meta-shop-item" style="border: 1px outset gold; background: #000000; color: gold; padding: 5px; margin-bottom: 5px; display: flex; align-items: center;">
                 <img src="${u.icon}" class="shop-icon zoomable-icon" alt="${u.name}" style="margin-right: 10px; width: 32px; height: 32px; border: 1px solid gold;"
                      onmouseenter="window.showTooltip(event, '${safeDesc}')"
                      onmousemove="window.moveTooltip(event)"
                      onmouseleave="window.hideTooltip()">
                 <div>
                    <b>${u.name}</b> (Lvl ${count})<br>
                    <small style="color: #ffffaa;">${u.desc}</small><br>
                    Cost: ${currentCost} Stocks<br>
                    <button class="buy-meta-btn" data-id="${u.id}" style="background: gold; color: black; border-color: #886600;" ${btnDisabled}>Invest</button>
                 </div>
            </div>
        `;
    }

    const btns = table.getElementsByClassName('buy-meta-btn');
    for (let btn of btns) {
        btn.onclick = () => buyMetaCallback(btn.getAttribute('data-id'));
    }
}

export function initProjects(contributeCallback) {
    var container = document.getElementById("project-list-container");
    if (!container) return;
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

        var btnClass = "btn-x1";
        if (buyMultiplier === 10) btnClass = "btn-x10";
        if (buyMultiplier === 100) btnClass = "btn-x100";
        if (buyMultiplier === "MAX") btnClass = "btn-max";

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

        var iconHtml = "";
        if (p.icon) {
            var safeDesc = p.desc.replace(/'/g, "\\'");
            iconHtml = `<img src="${p.icon}" class="zoomable-icon" style="width: 32px; height: 32px; margin-right: 5px; border: 1px solid gray;"
                        onmouseenter="window.showTooltip(event, '${safeDesc}')"
                        onmousemove="window.moveTooltip(event)"
                        onmouseleave="window.hideTooltip()">`;
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
                <button class="project-btn ${btnClass}" data-id="${p.id}" ${buttonDisabled} style="font-size: 10px;">${buttonText}</button>
            </div>
        `;
        container.appendChild(div);
    }

    const btns = container.getElementsByClassName('project-btn');
    for (let btn of btns) {
        btn.onclick = () => contributeCallback(btn.getAttribute('data-id'));
    }

    updateProjectVisibility();
}

export function updateMarketDisplay(buyStockCallback, sellStockCallback) {
    var container = document.getElementById("stock-market-display");
    if (!container) return;

    var html = "";

    for (var i = 0; i < stockMarket.length; i++) {
        var s = stockMarket[i];
        var owned = gameState.stocksOwned[s.symbol] || 0;
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
                    <button class="buy-stock-btn" data-symbol="${s.symbol}" style="font-size: 10px; padding: 1px 3px;">Buy</button>
                    <button class="sell-stock-btn" data-symbol="${s.symbol}" style="font-size: 10px; padding: 1px 3px;">Sell</button>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;

    // Listeners
    const buyBtns = container.getElementsByClassName('buy-stock-btn');
    for (let btn of buyBtns) {
        btn.onclick = () => buyStockCallback(btn.getAttribute('data-symbol'));
    }
    const sellBtns = container.getElementsByClassName('sell-stock-btn');
    for (let btn of sellBtns) {
        btn.onclick = () => sellStockCallback(btn.getAttribute('data-symbol'));
    }
}

export function updateMicromanagementUI() {
    var list = document.getElementById("employee-list");
    if (!list) return;

    // Visibility check
    if (gameState.jobLevel < 3) {
        var container = document.getElementById("micromanagement-container");
        if (container) container.style.display = "none";
        return;
    } else {
        var container = document.getElementById("micromanagement-container");
        if (container && container.style.display === "none") {
            container.style.display = "block";
            logMessage("Micromanagement Module Unlocked.");
        }
    }

    var html = "";
    if (gameState.employees) {
        gameState.employees.forEach(e => {
            var stressColor = e.stress > 80 ? "red" : (e.stress > 50 ? "orange" : "green");

            html += `
                <div class="employee-card">
                    <div style="display: flex; justify-content: space-between;">
                        <b>${e.name} (${e.role})</b>
                        <button class="motivate-btn" data-id="${e.id}" style="font-size: 9px;">Motivate</button>
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
    }

    list.innerHTML = html;

    const btns = list.getElementsByClassName('motivate-btn');
    for (let btn of btns) {
        btn.onclick = () => {
            motivateEmployeeLogic(parseInt(btn.getAttribute('data-id')));
            updateMicromanagementUI();
        };
    }
}

export function updateTheme() {
    var stocks = gameState.stockOptions;
    var body = document.body;

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

    if (!soundManager.audioCtx) {
        soundManager.init();
    }
    soundManager.setTheme(newTheme);
}
