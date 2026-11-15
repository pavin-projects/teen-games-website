const gamesGrid = document.querySelector("#games-grid");
const gamesCount = document.querySelector("#games-count");
const playPanel = document.querySelector("#play-panel");
const gameFrame = document.querySelector("#game-frame");
const playTitle = document.querySelector("#play-title");
const remixCanvas = document.querySelector("#remix-canvas");
const remixContext = remixCanvas.getContext("2d");
const remixPlayArea = document.querySelector("#remix-play-area");
const remixTitle = document.querySelector("#remix-title");
const remixStatus = document.querySelector("#remix-status");
const remixCount = document.querySelector("#remix-count");
let remixGame = null;
let remixFrame = 0;
const remixKeys = new Set();
const storedRemixCount = Number(localStorage.getItem("playroomRemixesPlayed") || 0);

remixCount.textContent = `${storedRemixCount} remixes played on this device`;

function showMessage(message, isError = false) {
  const paragraph = document.createElement("p");
  paragraph.className = `status-message${isError ? " error" : ""}`;
  paragraph.textContent = message;
  gamesGrid.replaceChildren(paragraph);
}

function startGame(game) {
  stopRemix();
  playTitle.textContent = game.title;
  gameFrame.title = game.title;
  const gameUrl = new URL(game.url, window.location.href);
  gameUrl.searchParams.set("playroom", Date.now().toString(36));
  gameFrame.src = gameUrl.href;
  playPanel.hidden = false;
  playPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderGames(games) {
  if (!Array.isArray(games) || games.length === 0) {
    showMessage("No games are available yet. Check back soon!");
    gamesCount.textContent = "0 games";
    return;
  }

  gamesCount.textContent = `${games.length} hosted ${games.length === 1 ? "game" : "games"}`;
  const cards = games.map((game) => {
    const article = document.createElement("article");
    article.className = "game-card";
    article.style.setProperty("--card-color", game.color || "#eeeaff");
    article.style.setProperty("--card-ink", game.ink || "#7356f2");

    const art = document.createElement("div");
    art.className = "card-art";
    art.setAttribute("aria-hidden", "true");
    const icon = document.createElement("span");
    icon.textContent = game.icon || "★";
    art.append(icon);

    const content = document.createElement("div");
    content.className = "card-content";
    const meta = document.createElement("div");
    meta.className = "card-meta";
    const title = document.createElement("h3");
    title.textContent = game.title;
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = game.tag || "Game";
    meta.append(title, tag);
    const description = document.createElement("p");
    description.textContent = game.description;
    const button = document.createElement("button");
    button.className = "button";
    button.type = "button";
    button.textContent = "Play now";
    button.addEventListener("click", () => startGame(game));
    content.append(meta, description, button);
    article.append(art, content);
    return article;
  });

  gamesGrid.replaceChildren(...cards);
}

const remixVariants = [
  { title: "Comet Catch", goal: "Catch golden sparks and dodge comets.", target: "star", hazard: "comet", speed: 115 },
  { title: "Crystal Courier", goal: "Collect crystals while dodging thorn-stars.", target: "crystal", hazard: "thorn", speed: 135 },
  { title: "Moon Pebble Dash", goal: "Grab moon pebbles and weave around meteors.", target: "moon", hazard: "meteor", speed: 155 }
];
const remixPalettes = [
  { sky: ["#151c43", "#33245b"], glow: "#ffe38a", accent: "#79e9ff", hazard: "#ff748e" },
  { sky: ["#102d3a", "#164c57"], glow: "#adffcf", accent: "#ffdc80", hazard: "#ff826d" },
  { sky: ["#241b42", "#4c2456"], glow: "#ffa9df", accent: "#8ce9ff", hazard: "#ffb46f" },
  { sky: ["#172d3a", "#214d73"], glow: "#fff29a", accent: "#a9a0ff", hazard: "#ff759e" }
];

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function newRemixSeed() {
  return Math.floor(Math.random() * 0x100000000) >>> 0;
}

function generateRemix(seed = newRemixSeed()) {
  stopRemix();
  const random = seededRandom(seed);
  const variant = remixVariants[seed % remixVariants.length];
  const palette = remixPalettes[Math.floor(random() * remixPalettes.length)];
  const difficulty = 0.8 + random() * 0.7;
  const stars = Array.from({ length: 42 }, () => ({
    x: random() * remixCanvas.width,
    y: random() * remixCanvas.height,
    radius: 0.5 + random() * 1.8,
    alpha: 0.2 + random() * 0.65
  }));
  remixGame = {
    seed,
    random,
    variant,
    palette,
    difficulty,
    stars,
    objects: [],
    score: 0,
    elapsed: 0,
    timeLeft: 35,
    playerX: remixCanvas.width / 2,
    pointerX: null,
    spawnElapsed: 0,
    lastFrame: performance.now(),
    running: true,
    endedByHit: false
  };

  remixTitle.textContent = variant.title;
  document.querySelector("#remix-instructions").textContent = `${variant.goal} Move with ←/→ or A/D, or drag to steer.`;
  remixStatus.textContent = `Remix ${seed} is ready.`;
  remixPlayArea.hidden = false;
  const played = Number(localStorage.getItem("playroomRemixesPlayed") || 0) + 1;
  localStorage.setItem("playroomRemixesPlayed", String(played));
  remixCount.textContent = `${played} remixes played on this device`;
  remixCanvas.focus();
  remixGame.lastFrame = performance.now();
  remixFrame = requestAnimationFrame(updateRemix);
}

function drawRemix() {
  const game = remixGame;
  if (!game) return;
  const context = remixContext;
  const width = remixCanvas.width;
  const height = remixCanvas.height;
  const background = context.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, game.palette.sky[0]);
  background.addColorStop(1, game.palette.sky[1]);
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  game.stars.forEach((star) => {
    context.globalAlpha = star.alpha;
    context.fillStyle = "#ffffff";
    context.beginPath();
    context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    context.fill();
  });
  context.globalAlpha = 1;

  game.objects.forEach((object) => {
    context.save();
    context.translate(object.x, object.y);
    context.rotate(object.rotation);
    context.fillStyle = object.kind === "target" ? game.palette.glow : game.palette.hazard;
    context.shadowColor = context.fillStyle;
    context.shadowBlur = 14;
    if (object.kind === "target" && game.variant.target === "star") {
      drawStar(context, object.radius);
    } else if (object.kind === "target" && game.variant.target === "crystal") {
      context.beginPath();
      context.moveTo(0, -object.radius);
      context.lineTo(object.radius * 0.72, 0);
      context.lineTo(0, object.radius);
      context.lineTo(-object.radius * 0.72, 0);
      context.closePath();
      context.fill();
    } else if (object.kind === "target") {
      context.beginPath();
      context.arc(0, 0, object.radius, -Math.PI * 0.82, Math.PI * 0.82);
      context.arc(object.radius * 0.4, 0, object.radius * 0.75, Math.PI * 0.78, -Math.PI * 0.78, true);
      context.fill();
    } else {
      context.beginPath();
      context.arc(0, 0, object.radius, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#fff8";
      context.beginPath();
      context.arc(-object.radius * 0.25, -object.radius * 0.25, object.radius * 0.2, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  });

  const playerY = height - 46;
  context.save();
  context.translate(game.playerX, playerY);
  context.fillStyle = game.palette.accent;
  context.shadowColor = game.palette.accent;
  context.shadowBlur = 20;
  context.beginPath();
  context.moveTo(0, -18);
  context.lineTo(17, 15);
  context.lineTo(0, 8);
  context.lineTo(-17, 15);
  context.closePath();
  context.fill();
  context.restore();

  context.fillStyle = "#fff";
  context.font = "700 18px Segoe UI, sans-serif";
  context.textAlign = "left";
  context.fillText(`SCORE ${game.score}`, 18, 30);
  context.textAlign = "right";
  context.fillText(`${Math.ceil(game.timeLeft)}s`, width - 18, 30);
  context.textAlign = "left";

  if (!game.running) {
    context.fillStyle = "#080a17c9";
    context.fillRect(0, 0, width, height);
    context.textAlign = "center";
    context.fillStyle = "#fff";
    context.font = "700 34px Segoe UI, sans-serif";
    context.fillText(game.endedByHit ? "Nice run!" : "Time!", width / 2, height / 2 - 8);
    context.font = "500 18px Segoe UI, sans-serif";
    context.fillText(`You scored ${game.score} · Generate another remix to play again`, width / 2, height / 2 + 28);
    context.textAlign = "left";
  }
}

function drawStar(context, radius) {
  context.beginPath();
  for (let point = 0; point < 10; point += 1) {
    const angle = -Math.PI / 2 + (point * Math.PI) / 5;
    const distance = point % 2 === 0 ? radius : radius * 0.46;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    if (point === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
  context.fill();
}

function updateRemix(now) {
  const game = remixGame;
  if (!game || !game.running || document.hidden) return;
  const delta = Math.min((now - game.lastFrame) / 1000, 0.04);
  game.lastFrame = now;
  game.elapsed += delta;
  game.timeLeft = Math.max(0, 35 - game.elapsed);
  const direction = Number(remixKeys.has("right")) - Number(remixKeys.has("left"));
  if (game.pointerX !== null) {
    game.playerX = game.pointerX;
  } else {
    game.playerX += direction * 360 * delta;
  }
  game.playerX = Math.max(22, Math.min(remixCanvas.width - 22, game.playerX));

  game.spawnElapsed += delta;
  const spawnInterval = Math.max(0.3, (0.82 - game.difficulty * 0.2));
  if (game.spawnElapsed >= spawnInterval) {
    game.spawnElapsed = 0;
    game.objects.push({
      x: 28 + game.random() * (remixCanvas.width - 56),
      y: -25,
      radius: 9 + game.random() * 8,
      speed: game.variant.speed * game.difficulty * (0.75 + game.random() * 0.65),
      rotation: game.random() * Math.PI,
      spin: (game.random() - 0.5) * 3,
      kind: game.random() < 0.7 ? "target" : "hazard"
    });
  }

  const playerY = remixCanvas.height - 46;
  for (let i = game.objects.length - 1; i >= 0; i -= 1) {
    const object = game.objects[i];
    object.y += object.speed * delta;
    object.rotation += object.spin * delta;
    if (object.y >= playerY - 5 && object.y <= playerY + 18 && Math.abs(object.x - game.playerX) < object.radius + 17) {
      if (object.kind === "target") game.score += 1;
      else {
        game.running = false;
        game.endedByHit = true;
      }
      game.objects.splice(i, 1);
      continue;
    }
    if (object.y > remixCanvas.height + 24) game.objects.splice(i, 1);
  }

  if (game.timeLeft <= 0) game.running = false;
  if (!game.running) remixStatus.textContent = `Run complete. Score: ${game.score}. Generate another game to play again.`;
  drawRemix();
  if (game.running) remixFrame = requestAnimationFrame(updateRemix);
}

function stopRemix() {
  if (remixFrame) cancelAnimationFrame(remixFrame);
  remixFrame = 0;
  if (remixGame) remixGame.running = false;
}

function steerRemix(event) {
  if (!remixGame?.running) return;
  const bounds = remixCanvas.getBoundingClientRect();
  remixGame.pointerX = Math.max(0, Math.min(remixCanvas.width, ((event.clientX - bounds.left) / bounds.width) * remixCanvas.width));
}

remixCanvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  remixCanvas.focus();
  remixCanvas.setPointerCapture(event.pointerId);
  steerRemix(event);
});
remixCanvas.addEventListener("pointermove", (event) => {
  if (event.buttons || event.pointerType === "touch") steerRemix(event);
});
remixCanvas.addEventListener("pointerup", () => {
  if (remixGame) remixGame.pointerX = null;
});
remixCanvas.addEventListener("pointercancel", () => {
  if (remixGame) remixGame.pointerX = null;
});
window.addEventListener("keydown", (event) => {
  if (!remixGame?.running || document.activeElement !== remixCanvas) return;
  const key = event.key.toLowerCase();
  if (key === "arrowleft" || key === "a") {
    event.preventDefault();
    remixKeys.add("left");
  } else if (key === "arrowright" || key === "d") {
    event.preventDefault();
    remixKeys.add("right");
  }
});
window.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  if (key === "arrowleft" || key === "a") remixKeys.delete("left");
  if (key === "arrowright" || key === "d") remixKeys.delete("right");
});
window.addEventListener("blur", () => remixKeys.clear());
document.addEventListener("visibilitychange", () => {
  if (document.hidden && remixFrame) {
    cancelAnimationFrame(remixFrame);
    remixFrame = 0;
  } else if (!document.hidden && remixGame?.running && !remixFrame) {
    remixGame.lastFrame = performance.now();
    remixFrame = requestAnimationFrame(updateRemix);
  }
});

document.querySelector("#generate-remix").addEventListener("click", () => generateRemix());
document.querySelector("#copy-remix-link").addEventListener("click", async () => {
  if (!remixGame) return;
  const shareUrl = new URL(window.location.href);
  shareUrl.searchParams.set("remix", String(remixGame.seed));
  shareUrl.hash = "forge";
  try {
    await navigator.clipboard.writeText(shareUrl.toString());
    remixStatus.textContent = "Share link copied.";
  } catch {
    remixStatus.textContent = `Copy unavailable. Share this link: ${shareUrl.toString()}`;
  }
});

const sharedSeed = new URLSearchParams(window.location.search).get("remix");
if (sharedSeed !== null && /^\d+$/.test(sharedSeed)) {
  generateRemix(Number(sharedSeed) >>> 0);
}

document.querySelector("#close-game").addEventListener("click", () => {
  playPanel.hidden = true;
  gameFrame.removeAttribute("src");
  document.querySelector("#games").scrollIntoView({ behavior: "smooth", block: "start" });
});

fetch("games.json")
  .then((response) => {
    if (!response.ok) throw new Error(`Could not load the game list (${response.status}).`);
    return response.json();
  })
  .then(renderGames)
  .catch((error) => {
    showMessage(`${error.message} Run this site through a local web server and try again.`, true);
  });
