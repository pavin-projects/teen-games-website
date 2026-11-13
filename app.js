const gamesGrid = document.querySelector("#games-grid");
const gamesCount = document.querySelector("#games-count");
const playPanel = document.querySelector("#play-panel");
const gameFrame = document.querySelector("#game-frame");
const playTitle = document.querySelector("#play-title");

function showMessage(message, isError = false) {
  const paragraph = document.createElement("p");
  paragraph.className = `status-message${isError ? " error" : ""}`;
  paragraph.textContent = message;
  gamesGrid.replaceChildren(paragraph);
}

function startGame(game) {
  playTitle.textContent = game.title;
  gameFrame.title = game.title;
  gameFrame.src = game.url;
  playPanel.hidden = false;
  playPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderGames(games) {
  if (!Array.isArray(games) || games.length === 0) {
    showMessage("No games are available yet. Check back soon!");
    gamesCount.textContent = "0 games";
    return;
  }

  gamesCount.textContent = `${games.length} ${games.length === 1 ? "game" : "games"}`;
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
