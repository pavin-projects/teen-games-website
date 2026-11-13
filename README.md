# Playroom — teen games website

A responsive, static game portal. Games are listed in `games.json` and opened in an embedded frame, so the website can grow without putting every game's code into the portal.

## Run locally

The site uses `fetch()` to read the game catalog, so open it through a local web server instead of double-clicking `index.html`.

1. Install Python 3 if it is not already installed.
2. Open a terminal in the `gitprojects` folder that contains both `teen-games-website` and `snake-and-ladders`.
3. Run `py -m http.server 8000` on Windows, or `python -m http.server 8000` on macOS/Linux.
4. Visit `http://localhost:8000/teen-games-website/`.
5. To stop the server, press `Ctrl+C` in the terminal.

The first game card points to the published Snake & Ladders project. For a local-only setup, change its `url` in `games.json` to `../snake-and-ladders/index.html` while serving the parent folder.

## Add another hosted game

1. Build the game as a standalone static site and test it on its own.
2. Publish the game project to a static host. Make sure its host permits embedding in an iframe (its `Content-Security-Policy` must allow this site in `frame-ancestors`).
3. Add a game object to `games.json` with `title`, `description`, `tag`, `icon`, `url`, `color`, and `ink`. Set `url` to the published game's public URL. Use a relative URL for a game shipped under this same site.
4. Test the portal's card, embedded game, keyboard controls, mobile layout, and browser console.
5. Publish this project to GitHub Pages, Netlify, or another static host. It needs no server-side runtime or build command.

The iframe is sandboxed to scripts only. Keep games self-contained; they cannot access the portal's parent page or storage.

## Publish with GitHub Pages

1. Create a GitHub repository for this project and add these files.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select the branch containing these files and the `/(root)` folder, then save.
4. Wait for the Pages deployment and open the URL shown in the Pages settings.
5. If the game is in a separate repository/site, update its `games.json` URL to the game's public URL and commit/push the change. Deploy the portal again.

For Netlify, import the repository, leave the build command empty, and set the publish directory to the project root.

## Teen-friendly defaults

- No accounts, chat, tracking scripts, or personal-information forms.
- Keep games playable without downloads and usable with a keyboard.
- Review game content and third-party embeds before listing them.
- Avoid collecting personal information; get appropriate adult review before adding accounts, messaging, or analytics.
