import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOfficialArtworkUrl } from "../utils.js";

function SearchForm() {
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    const name = query.trim().toLowerCase();

    if (!name) {
      setError("Enter a Pokémon name to get started.");
      return;
    }

    setError(null);
    navigate(`/pokemon/${encodeURIComponent(name)}`);
  }

  return (
    <section className="search" aria-labelledby="search-title">
      <div className="search-content">
        <p className="eyebrow">THE WORLD OF POKÉMON</p>
        <h2 id="search-title">Find your next favorite.</h2>
        <p className="search-copy">Search the Pokédex by name and discover what makes each Pokémon special.</p>
        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try Pikachu, Eevee, or Mewtwo…"
            className="search-input"
            aria-label="Pokémon name"
          />
          <button type="submit" className="search-button">Search <span aria-hidden="true">→</span></button>
        </form>
        {error && <p className="search-error" role="alert">{error}</p>}
      </div>
      <img
        className="hero-pokemon-art"
        src={getOfficialArtworkUrl(25)}
        alt=""
        aria-hidden="true"
        draggable="false"
      />
    </section>
  );
}

export default SearchForm;
