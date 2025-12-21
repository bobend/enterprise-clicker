export const gameState = {
    cash: 0,
    lifetimeEarnings: 0,
    jobLevel: 0,
    upgrades: {}, // id: count
    stockOptions: 0,
    metaUpgrades: {}, // id: count
    sideProjects: {}, // id: progress
    stocksOwned: {},
    employees: [] // list of employee objects
};

export function saveGame() {
    var saveString = JSON.stringify(gameState);
    // 365 days expiration
    var d = new Date();
    d.setTime(d.getTime() + (365*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = "enterpriseSave=" + saveString + ";" + expires + ";path=/";
}

export function loadGame(logMessage) {
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

                // Employees (Micromanagement)
                gameState.employees = savedState.employees || [];

                if (logMessage) logMessage("Welcome back. Game loaded.");
            } catch (e) {
                console.error("Save file corrupted");
                if (logMessage) logMessage("Error loading save.");
            }
            return;
        }
    }
    if (logMessage) logMessage("New game started.");
}

export function resetGame() {
    if (confirm("Are you sure you want to resign and lose all progress?")) {
        // Expire the cookie
        document.cookie = "enterpriseSave=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        location.reload();
    }
}
