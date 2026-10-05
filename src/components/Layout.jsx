import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useSound } from "../context/useSound.js";

function Layout() {
  const { soundEnabled, toggleSound } = useSound();
  const location = useLocation();
  const navigate = useNavigate();
  const onFavorites = location.pathname === "/" && new URLSearchParams(location.search).get("view") === "favorites";
  const onExplore = location.pathname === "/" && !onFavorites;

  function surpriseMe() {
    const randomId = Math.floor(Math.random() * 1025) + 1;
    navigate(`/pokemon/${randomId}`);
  }

  return (
    <div className="app">
      <header className="app-header">
        <span className="pokeball-mark" aria-hidden="true" />
        <Link to="/" className="app-title-link">
          <h1>PokéDex Mini</h1>
        </Link>
        <button
          type="button"
          className={`sound-toggle${soundEnabled ? " is-on" : ""}`}
          onClick={toggleSound}
          aria-pressed={soundEnabled}
          aria-label={`Turn sound ${soundEnabled ? "off" : "on"}`}
          title={`Turn sound ${soundEnabled ? "off" : "on"}`}
        >
          <span aria-hidden="true">{soundEnabled ? "♫" : "♪"}</span>
          <span className="sound-label">Sound {soundEnabled ? "on" : "off"}</span>
        </button>
      </header>
      <nav className="main-nav" aria-label="Main navigation">
        <Link to="/" className={`nav-link${onExplore ? " is-active" : ""}`} aria-current={onExplore ? "page" : undefined}>
          <span aria-hidden="true">✦</span> Explore
        </Link>
        <Link to="/?view=favorites" className={`nav-link${onFavorites ? " is-active" : ""}`} aria-current={onFavorites ? "page" : undefined}>
          <span aria-hidden="true">♡</span> My favorites
        </Link>
        <button type="button" className="nav-surprise" onClick={surpriseMe}>
          <span aria-hidden="true">🎲</span> Surprise me
        </button>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
