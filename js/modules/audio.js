import { gameState } from './state.js';
import { formatNumber, getPassiveIncome, calculateStockOptions, getUpgradeCost, calculateMaxAffordable } from './logic.js';
import { jobs, upgradeList, metaUpgradeList, projectList } from './constants.js';

export var soundManager = {
    audioCtx: null,
    musicInterval: null,
    isMuted: false,
    currentTheme: "normal",

    init: function() {
        try {
            var AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
            this.renderControls();

            var _this = this;
            var resumeFunc = function() {
                if (_this.audioCtx && _this.audioCtx.state === 'suspended') {
                    _this.audioCtx.resume().then(() => {
                        // Restart music if it should be playing but was suspended
                        if (!_this.isMuted) _this.startMusic();
                    });
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
            container.innerHTML = ` | <button id="mute-toggle-btn">${text}</button>`;
            document.getElementById("mute-toggle-btn").onclick = () => this.toggleMute();
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

        var _this = this;
        var beatTime = 500;
        var notes = [];

        if (this.currentTheme === "eldritch") {
            beatTime = 800;
            notes = [110, 103, 97, 103, 82];
        } else if (this.currentTheme === "unsettling") {
            beatTime = 600;
            notes = [220, 261, 311, 293];
        } else {
            beatTime = 400;
            notes = [440, 554, 659, 880];
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

        osc.type = (this.currentTheme === "eldritch") ? "sawtooth" : "triangle";
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

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
            // Only restart music if we are already unmuted
            if (!this.isMuted) {
                this.startMusic();
            }
        }
    }
};
