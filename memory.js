(() => {
  const hobbies = [
    {
      name: "Running", description: "I love running.",
      art: '<path fill="#a8dcff" d="m19 15 8 1 8 11 13 3c4 1 6 4 6 8H13l1-9z"/><path fill="#fff" d="M13 38h41v5H13z"/><path d="m28 22-5 5m9-1-5 5m10-3-5 5M6 29h4M3 35h7"/>',
    },
    {
      name: "Hiking", description: "I love hiking.",
      art: '<circle cx="48" cy="13" r="5" fill="#ffd98b"/><path fill="#a8dcff" d="m4 38 17-24 10 13 8-10 17 21z"/><path fill="#fff" d="m13 25 8-11 8 11-6-2-4 3z"/><path fill="none" d="M35 34c-15 2-16 5-7 7s7 4-9 6"/>',
    },
    {
      name: "Board games", description: "I love playing board games.",
      art: '<rect x="11" y="12" width="26" height="26" rx="6" fill="#a8dcff" transform="rotate(-13 24 25)"/><path fill="#ffdb9d" d="M37 29a6 6 0 1 1 9 5l5 10H33l5-10a6 6 0 0 1-1-5z"/><g fill="currentColor" stroke="none"><circle cx="18" cy="20" r="2"/><circle cx="24" cy="25" r="2"/><circle cx="30" cy="30" r="2"/></g>',
    },
    {
      name: "Monopoly", description: "My favorite board game.",
      art: '<rect x="7" y="8" width="44" height="38" rx="4" fill="#a8dcff"/><rect x="15" y="16" width="28" height="22" rx="2" fill="#f5fbff"/><path d="M20 8v8m9-8v8m9-8v8M20 38v8m9-8v8m9-8v8M7 27h8m28 0h8"/><path fill="#a8e3d1" d="m22 25 7-6 7 6v9H22z"/><path d="M28 34v-5h3v5"/>',
    },
    {
      name: "Side projects", description: "I build projects for fun.",
      art: '<rect x="10" y="11" width="39" height="28" rx="3" fill="#a8dcff"/><path fill="#fff" d="M10 38h39l5 6H5z"/><path d="m24 20-5 5 5 5m10-10 5 5-5 5m-3-12-4 14"/>',
    },
    {
      name: "Learning", description: "I love learning new things.",
      art: '<path fill="#a8dcff" d="M29 42C23 37 14 36 7 38V14c9-2 17 0 22 5 5-5 13-7 22-5v24c-7-2-16-1-22 4z"/><path d="M29 19v23M13 21c4 0 8 1 11 3m-11 4c4 0 8 1 11 3m10-7c3-2 7-3 11-3m-11 10c3-2 7-3 11-3"/>',
    },
  ];

  function shuffledDeck() {
    const deck = [...hobbies, ...hobbies];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  function createRound() {
    return {
      deck: shuffledDeck(),
      open: [],
      matched: new Set(),
      moves: 0,
      startedAt: null,
      finishedAt: null,
    };
  }

  function reveal(round, index, now) {
    if (round.open.length === 2 || round.open.includes(index) || round.matched.has(index)) return;
    round.startedAt ??= now;
    round.open.push(index);
    if (round.open.length === 1) return "first";

    round.moves++;
    const [first, second] = round.open;
    if (round.deck[first] !== round.deck[second]) return "mismatch";

    round.matched.add(first);
    round.matched.add(second);
    round.open = [];
    if (round.matched.size === round.deck.length) {
      round.finishedAt = now;
      return "complete";
    }
    return "match";
  }

  function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  }

  const game = document.querySelector(".memory-game");
  const board = game.querySelector(".memory-board");
  const status = game.querySelector(".memory-status");
  const reset = game.querySelector(".memory-reset");
  const pairs = game.querySelector("[data-pairs]");
  const moves = game.querySelector("[data-moves]");
  const time = game.querySelector("[data-time]");
  let round;
  let flipTimer;
  let clockTimer;

  const cards = Array.from({ length: hobbies.length * 2 }, (_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "memory-card";
    button.innerHTML = '<span class="memory-card-inner" aria-hidden="true"><span class="memory-back">AS</span><span class="memory-front"></span></span>';
    button.addEventListener("click", () => play(index));
    board.append(button);
    return button;
  });

  function render() {
    cards.forEach((button, index) => {
      const matched = round.matched.has(index);
      const open = round.open.includes(index);
      const face = matched ? "matched" : open ? "revealed" : "face down";
      button.dataset.face = face;
      button.setAttribute("aria-label", `Card ${index + 1}, ${face}${matched || open ? `: ${round.deck[index].name}` : ""}`);
      button.setAttribute("aria-disabled", String(matched || open || round.open.length === 2));
    });
    pairs.textContent = `${round.matched.size / 2}/${hobbies.length}`;
    moves.textContent = round.moves;
  }

  function updateTime() {
    const elapsed = round.startedAt === null ? 0 : (round.finishedAt ?? performance.now()) - round.startedAt;
    time.textContent = formatTime(elapsed);
  }

  function restart(announce) {
    clearTimeout(flipTimer);
    clearInterval(clockTimer);
    round = createRound();
    game.classList.remove("is-complete");
    game.classList.add("is-reset");
    reset.textContent = "Restart";
    cards.forEach((button, index) => {
      const { name, art } = round.deck[index];
      button.querySelector(".memory-front").innerHTML = `<svg viewBox="0 0 58 50" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${art}</svg><span>${name}</span>`;
    });
    status.textContent = announce ? "New round. All cards are face down." : "";
    render();
    updateTime();
  }

  function play(index) {
    const activeRound = round;
    const outcome = reveal(activeRound, index, performance.now());
    if (!outcome) return;

    game.classList.remove("is-reset");
    render();
    const hobby = activeRound.deck[index];
    if (outcome === "first") {
      if (activeRound.moves === 0) clockTimer = setInterval(updateTime, 250);
      status.textContent = `${hobby.name} revealed. Choose another card.`;
    } else if (outcome === "mismatch") {
      const first = activeRound.deck[activeRound.open[0]];
      status.textContent = `${first.name} and ${hobby.name} do not match.`;
      flipTimer = setTimeout(() => {
        if (round !== activeRound) return;
        activeRound.open = [];
        render();
        status.textContent = "Cards flipped back. Try another pair.";
      }, 900);
    } else if (outcome === "complete") {
      clearInterval(clockTimer);
      updateTime();
      reset.textContent = "Play Again";
      game.classList.add("is-complete");
      status.textContent = `All six pairs matched in ${activeRound.moves} moves. Time ${time.textContent}. ${hobby.description}`;
    } else {
      status.textContent = `Matched ${hobby.name}. ${hobby.description}`;
    }
  }

  reset.addEventListener("click", () => {
    restart(true);
    cards[0].focus();
  });
  restart(false);
  game.hidden = false;
})();
