// Order is the color: yellow, green, blue, purple.
// Purple hides a month in each word: Doctor (oct), Nightmare (mar),
// Separate (sep), Apricot (apr).
const PUZZLE = [
  {
    name: "Places we've been together",
    words: ["Puerto Rico", "Lisbon", "NYC", "Cascais"],
  },
  {
    name: "Our first four dates",
    words: ["Mogador", "Mister Paradise", "Studio 151", "LIC"],
  },
  {
    name: "___ feast",
    words: ["Thanksgiving", "Sacrificial", "Wedding", "Lavish"],
  },
  {
    name: "Hides OCT, MAR, SEP, or APR",
    words: ["Doctor", "Nightmare", "Separate", "Apricot"],
  },
];

const MAX_MISTAKES = 4;

const solvedEl = document.querySelector("#connect-solved");
const gridEl = document.querySelector("#connect-grid");
const dotsEl = document.querySelector("#connect-dots");
const messageEl = document.querySelector("#connect-message");
const actionsEl = document.querySelector("#connect-actions");
const shuffleBtn = document.querySelector("#connect-shuffle");
const clearBtn = document.querySelector("#connect-clear");
const submitBtn = document.querySelector("#connect-submit");
const againBtn = document.querySelector("#connect-again");

const state = {
  tiles: [],
  selected: new Set(),
  solved: [],
  mistakes: 0,
  seen: new Set(),
  over: false,
  shake: false,
  justSolved: null,
  revealing: false,
};

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shuffle(items) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = copy[i];
    copy[i] = copy[j];
    copy[j] = swap;
  }
  return copy;
}

function setMessage(text) {
  messageEl.textContent = text;
}

function fitTiles() {
  gridEl.querySelectorAll(".connect-tile").forEach((button) => {
    let size = parseFloat(getComputedStyle(button).fontSize);
    const min = 8;
    while (button.scrollWidth > button.clientWidth + 1 && size > min) {
      size -= 0.5;
      button.style.fontSize = size + "px";
    }
  });
}

function selectedTiles() {
  return state.tiles.filter((tile) => state.selected.has(tile.id));
}

function guessKey(tiles) {
  return tiles
    .map((tile) => tile.word)
    .sort()
    .join("|");
}

function isOneAway(tiles) {
  const counts = new Map();
  tiles.forEach((tile) => {
    counts.set(tile.groupIndex, (counts.get(tile.groupIndex) || 0) + 1);
  });
  return [...counts.values()].some((count) => count === 3);
}

function start() {
  const tiles = [];
  PUZZLE.forEach((group, groupIndex) => {
    group.words.forEach((word, wordIndex) => {
      tiles.push({
        id: groupIndex + "-" + wordIndex,
        word,
        groupIndex,
      });
    });
  });
  state.tiles = shuffle(tiles);
  state.selected = new Set();
  state.solved = [];
  state.mistakes = 0;
  state.seen = new Set();
  state.over = false;
  state.shake = false;
  state.justSolved = null;
  state.revealing = false;
  setMessage("");
  render();
}

function render() {
  solvedEl.innerHTML = state.solved
    .map((groupIndex) => {
      const group = PUZZLE[groupIndex];
      const fresh = groupIndex === state.justSolved ? " is-new" : "";
      return (
        '<div class="connect-solved-row connect-tone-' +
        groupIndex +
        fresh +
        '">' +
        "<p class=\"connect-solved-name\">" +
        escapeHtml(group.name) +
        "</p>" +
        "<p class=\"connect-solved-words\">" +
        group.words.map(escapeHtml).join(", ") +
        "</p>" +
        "</div>"
      );
    })
    .join("");
  state.justSolved = null;

  gridEl.innerHTML = state.tiles
    .map((tile) => {
      const pressed = state.selected.has(tile.id);
      return (
        '<button type="button" class="connect-tile' +
        (pressed ? " is-selected" : "") +
        '" data-id="' +
        tile.id +
        '" aria-pressed="' +
        pressed +
        '">' +
        escapeHtml(tile.word) +
        "</button>"
      );
    })
    .join("");

  if (state.shake) {
    gridEl.querySelectorAll(".is-selected").forEach((tile) => {
      tile.classList.add("is-shaking");
    });
    state.shake = false;
  }

  fitTiles();

  dotsEl.innerHTML = "";
  for (let i = 0; i < MAX_MISTAKES; i += 1) {
    const dot = document.createElement("span");
    dot.className = "connect-dot" + (i < state.mistakes ? " is-spent" : "");
    dotsEl.appendChild(dot);
  }
  const left = MAX_MISTAKES - state.mistakes;
  dotsEl.setAttribute(
    "aria-label",
    left + (left === 1 ? " mistake remaining" : " mistakes remaining")
  );

  const picked = state.selected.size;
  submitBtn.disabled = state.over || picked !== 4;
  clearBtn.disabled = state.over || picked === 0;
  shuffleBtn.disabled = state.over || state.tiles.length < 2;
  actionsEl.hidden = state.over;
  againBtn.hidden = !state.over;
}

function finishSolve(groupIndex) {
  state.revealing = false;
  state.justSolved = groupIndex;
  state.solved.push(groupIndex);
  state.tiles = state.tiles.filter((tile) => tile.groupIndex !== groupIndex);
  state.selected.clear();
  if (state.solved.length === PUZZLE.length) {
    state.over = true;
    setMessage("You found every group.");
  } else {
    setMessage("");
  }
  render();
}

function submitGuess() {
  const picked = selectedTiles();
  if (state.revealing || state.over || picked.length !== 4) return;

  const groupIndex = picked[0].groupIndex;
  const correct = picked.every((tile) => tile.groupIndex === groupIndex);
  if (correct) {
    state.revealing = true;
    const ids = new Set(picked.map((tile) => tile.id));
    gridEl.querySelectorAll(".connect-tile").forEach((button) => {
      if (!ids.has(button.dataset.id)) return;
      button.classList.remove("is-selected");
      button.classList.add("is-solved", "connect-tone-" + groupIndex);
    });
    submitBtn.disabled = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      finishSolve(groupIndex);
      return;
    }
    window.setTimeout(() => finishSolve(groupIndex), 460);
    return;
  }

  const key = guessKey(picked);
  if (state.seen.has(key)) {
    setMessage("Already guessed.");
    return;
  }

  state.seen.add(key);
  state.mistakes += 1;
  state.shake = true;
  const close = isOneAway(picked);

  if (state.mistakes >= MAX_MISTAKES) {
    PUZZLE.forEach((_, index) => {
      if (!state.solved.includes(index)) state.solved.push(index);
    });
    state.tiles = [];
    state.selected.clear();
    state.over = true;
    setMessage(close ? "One away. Here are the groups." : "Here are the groups.");
  } else {
    setMessage(close ? "One away..." : "Not a group.");
  }
  render();
}

gridEl.addEventListener("click", (event) => {
  const button = event.target.closest(".connect-tile");
  if (!button || state.over || state.revealing) return;
  const id = button.dataset.id;
  if (state.selected.has(id)) {
    state.selected.delete(id);
    setMessage("");
  } else if (state.selected.size >= 4) {
    setMessage("Four at a time.");
  } else {
    state.selected.add(id);
    setMessage("");
  }
  render();
});

shuffleBtn.addEventListener("click", () => {
  if (state.over || state.revealing) return;
  state.tiles = shuffle(state.tiles);
  setMessage("");
  render();
});

clearBtn.addEventListener("click", () => {
  if (state.revealing) return;
  state.selected.clear();
  setMessage("");
  render();
});

submitBtn.addEventListener("click", submitGuess);
againBtn.addEventListener("click", start);

start();
