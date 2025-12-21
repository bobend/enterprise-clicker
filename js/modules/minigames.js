import { gameState, saveGame } from './state.js';
import { formatNumber } from './logic.js';
import { soundManager } from './audio.js';
import { projectList } from './constants.js';

// --- STONKS MARKET ---
export var stockMarket = [];
var stockTickTimer = 0;
var stockUpdateInterval = 5;

// --- MICROMANAGEMENT ---
// Employees are now in gameState.employees
var microTickTimer = 0;

export function initMarket() {
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
}

export function updateMarket(logMessage, updateDisplayFunc) {
    stockTickTimer++;
    if (stockTickTimer < stockUpdateInterval) return;
    stockTickTimer = 0;

    for (var i = 0; i < stockMarket.length; i++) {
        var s = stockMarket[i];
        var change = (Math.random() - 0.5) * s.volatility;
        change += s.trend;
        s.price = s.price * (1 + change);
        if (s.price < 0.10) s.price = 0.10;

        if (!s.history) s.history = [];
        s.history.push(s.price);
        if (s.history.length > 20) s.history.shift();

        if (Math.random() < 0.05) {
            s.trend = (Math.random() - 0.5) * 0.05;
        }
    }
}

export function generateSparkline(history) {
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

export function initMicromanagement() {
    // Only init if empty (new game or first time load)
    if (!gameState.employees || gameState.employees.length === 0) {
        gameState.employees = [
            { id: 1, name: "Bob", role: "Intern", stress: 10, productivity: 50 },
            { id: 2, name: "Alice", role: "Clerk", stress: 20, productivity: 60 },
            { id: 3, name: "Dave", role: "Developer", stress: 30, productivity: 70 }
        ];
    }
}

export function updateMicromanagement(logMessage) {
    if (gameState.jobLevel < 3) return;

    microTickTimer++;
    if (microTickTimer < 2) return;
    microTickTimer = 0;

    if (gameState.employees) {
        gameState.employees.forEach(e => {
            e.stress = Math.min(100, e.stress + 0.5);
            if (e.stress > 80) {
                e.productivity = Math.max(0, e.productivity - 1);
            }
        });
    }
}

export function motivateEmployee(id) {
    if (!gameState.employees) return;
    var e = gameState.employees.find(x => x.id === id);
    if (!e) return;
    e.stress = Math.max(0, e.stress - 20);
    e.productivity = Math.min(100, e.productivity + 10);
    soundManager.playClick();
}

export function checkSideProjectConsequences(logMessage) {
    var slopProgress = gameState.sideProjects["ai_slop_generator"] || 0;
    var slopGoal = projectList.find(p => p.id === "ai_slop_generator").goal;

    if (slopProgress >= slopGoal) {
        if (Math.random() < 0.005) {
            triggerGlitch("text", logMessage);
        }
    }

    var hallucinationProgress = gameState.sideProjects["image_hallucinator"] || 0;
    var hallucinationGoal = projectList.find(p => p.id === "image_hallucinator").goal;

    if (hallucinationProgress >= hallucinationGoal) {
        if (Math.random() < 0.005) {
            triggerGlitch("image", logMessage);
        }
    }
}

function triggerGlitch(type, logMessage) {
    var body = document.body;

    if (type === "text") {
        var ticker = document.getElementById("game-ticker");
        if (ticker) {
            var originalText = ticker.innerHTML;
            var chars = "¥§©®±¶$#@%&";
            var garbled = "";
            for (var i = 0; i < 20; i++) garbled += chars.charAt(Math.floor(Math.random() * chars.length));
            ticker.innerHTML = `<b>*** ${garbled} ***</b>`;
            setTimeout(function() {
                if (ticker) ticker.innerHTML = originalText;
            }, 2000);
        }
        if (logMessage) logMessage("SYSTEM ALERT: Semantic drift detected.");
    } else if (type === "image") {
        var originalFilter = body.style.filter;
        body.style.filter = "invert(100%) hue-rotate(180deg)";
        setTimeout(function() {
            body.style.filter = originalFilter;
        }, 500);
        if (logMessage) logMessage("SYSTEM ALERT: Visual cortex buffer overflow.");
    }
}
