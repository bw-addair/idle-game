
const SAVE_KEY = 'idleClickerSave';

let coins     = 0;
let auto      = 0;         // auto-clickers owned
let power     = 1;         // coins per manual click
let prestige  = 0;         // prestige currency
let totalEarned = 0;       // lifetime coins (for prestige calculation)

/* ----- sounds ---- */
const sndClick = document.getElementById('sndClick');

clickBtn.addEventListener('click', () => {
  if (sndClick.paused || sndClick.ended) {
    sndClick.currentTime = 0;
    sndClick.play();
  }
  coins++;
  updateDisplay();
});



/* ---- DOM shortcuts ---- */
const $ = id => document.getElementById(id);
const coinSpan      = $('coins');
const autoCostSpan  = $('autoCost');
const autoCountSpan = $('autoCount');
const powerCostSpan = $('powerCost');
const powerCountSpan= $('powerCount');
const prestigeGain  = $('prestigeGain');
const prestigeSec   = $('prestige');

/* ---- upgrade formulas ---- */
function autoCost()   { return 50  * Math.pow(1.15, auto); }
function powerCost()  { return 100 * Math.pow(1.5,  power); }

/* ---- render state ---- */
function render() {
  coinSpan.textContent      = coins.toLocaleString();
  autoCostSpan.textContent  = Math.floor(autoCost()).toLocaleString();
  autoCountSpan.textContent = auto;
  powerCostSpan.textContent = Math.floor(powerCost()).toLocaleString();
  powerCountSpan.textContent= power;
  prestigeGain.textContent  = prestigeFor(totalEarned);

  // show prestige button after 100k total earned
  prestigeSec.hidden = totalEarned < 1e5;
}

/* ---- prestige formula ---- */
function prestigeFor(lifetime) {
  return Math.floor(Math.pow(lifetime / 1e5, 0.5));
}

/* ---- main click ---- */
$('clickBtn').addEventListener('click', () => {
  coins += power;
  totalEarned += power;
  render();
});

/* ---- auto-coins ---- */
setInterval(() => {
  if (auto > 0) {
    coins += auto;
    totalEarned += auto;
    render();
  }
}, 1000);

/* ---- store buttons ---- */
$('buyAutoBtn').addEventListener('click', () => {
  const cost = Math.floor(autoCost());
  if (coins >= cost) {
    coins -= cost;
    auto++;
    render();
  }
});

$('buyPowerBtn').addEventListener('click', () => {
  const cost = Math.floor(powerCost());
  if (coins >= cost) {
    coins -= cost;
    power++;
    render();
  }
});

/* ---- prestige reset ---- */
$('resetBtn').addEventListener('click', () => {
  const gain = prestigeFor(totalEarned);
  if (gain > prestige) {
    prestige = gain;
    coins = 0;
    auto = 0;
    power = 1;
    totalEarned = 0;
    render();
    alert(`Prestiged! You now have ${prestige} prestige points.`);
  }
});

/* ---- save / load / wipe ---- */
function save() {
  const data = { coins, auto, power, prestige, totalEarned };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}
function load() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;
  const data = JSON.parse(raw);
  coins       = data.coins       || 0;
  auto        = data.auto        || 0;
  power       = data.power       || 1;
  prestige    = data.prestige    || 0;
  totalEarned = data.totalEarned || 0;
  render();
}
function wipe() {
  if (confirm('Delete ALL progress?')) {
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  }
}

/* ---- wire up buttons ---- */
$('saveBtn').addEventListener('click', save);
$('loadBtn').addEventListener('click', load);
$('wipeBtn').addEventListener('click', wipe);

/* ---- auto-save every 10s ---- */
setInterval(save, 10000);

/* ---- initial load ---- */
load();
render();
