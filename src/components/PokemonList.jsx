import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import { getIdFromUrl, capitalize, getSpriteUrl } from "../utils.js";
import { useSound } from "../context/useSound.js";
import PokeballLoader from "./PokeballLoader.jsx";

const PAGE_SIZE = 32;
const FAVORITES_KEY = "pokedex-mini-favorites";

function getSavedFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
  } catch {
    return [];
  }
}

function PokemonList() {
  const { playCuteSound } = useSound();
  const [pokemons, setPokemons] = useState([]);
  const [favorites, setFavorites] = useState(getSavedFavorites);
  const [searchParams, setSearchParams] = useSearchParams();
  const showFavorites = searchParams.get("view") === "favorites";
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    let isCurrent = true;

    async function loadPokemons() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/pokemon?limit=${PAGE_SIZE}&offset=${offset}`,
        );

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        const data = await response.json();

        if (isCurrent) {
          setPokemons((current) => [...current, ...data.results]);
          setHasMore(Boolean(data.next));
        }
      } catch (err) {
        if (isCurrent) setError(err.message);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    loadPokemons();
    return () => {
      isCurrent = false;
    };
  }, [offset]);

  function toggleFavorite(name) {
    playCuteSound();
    setFavorites((current) =>
      current.includes(name)
        ? current.filter((favorite) => favorite !== name)
        : [...current, name],
    );
  }

  function toggleFavoritesView() {
    const nextParams = new URLSearchParams(searchParams);
    if (showFavorites) nextParams.delete("view");
    else nextParams.set("view", "favorites");
    setSearchParams(nextParams);
  }

  const visiblePokemons = showFavorites
    ? pokemons.filter((pokemon) => favorites.includes(pokemon.name))
    : pokemons;

  if (isLoading && pokemons.length === 0) {
    return <PokeballLoader label="Opening your Pokédex…" />;
  }

  if (error && pokemons.length === 0) {
    return <p className="status status-error">Couldn't load the list: {error}</p>;
  }

  return (
    <section className="collection" aria-label="Pokémon collection">
      <div className="collection-heading">
        <div>
          <p className="eyebrow">YOUR FIELD GUIDE</p>
          <h2>{showFavorites ? "Your favorites" : "Discover Pokémon"}</h2>
          <p className="collection-copy">
            {showFavorites
              ? `${favorites.length} Pokémon saved in your collection`
              : "Meet your next favorite. Tap a card to learn more."}
          </p>
        </div>
        <button
          type="button"
          className={`filter-button${showFavorites ? " is-active" : ""}`}
          onClick={toggleFavoritesView}
          aria-pressed={showFavorites}
        >
          <span aria-hidden="true">♡</span>
          {showFavorites ? "Show all" : "Favorites"}
          {!showFavorites && favorites.length > 0 && (
            <span className="favorite-count">{favorites.length}</span>
          )}
        </button>
      </div>

      {visiblePokemons.length > 0 ? (
        <ul className="pokemon-list">
          {visiblePokemons.map((pokemon, index) => {
            const id = getIdFromUrl(pokemon.url);
            const isFavorite = favorites.includes(pokemon.name);

            return (
              <li
                key={pokemon.name}
                className="pokemon-list-item"
                style={{ "--card-index": index }}
              >
                <Link to={`/pokemon/${pokemon.name}`} className="pokemon-link">
                  <span className="card-number">#{id.padStart(3, "0")}</span>
                  <span className="sprite-halo">
                    <img
                      className="pokemon-sprite"
                      src={getSpriteUrl(id)}
                      alt=""
                      width={96}
                      height={96}
                      loading="lazy"
                    />
                  </span>
                  <span className="pokemon-name">{capitalize(pokemon.name)}</span>
                  <span className="card-hint">View details <span aria-hidden="true">↗</span></span>
                </Link>
                <button
                  type="button"
                  className={`favorite-button${isFavorite ? " is-favorite" : ""}`}
                  onClick={() => toggleFavorite(pokemon.name)}
                  aria-label={`${isFavorite ? "Remove" : "Add"} ${pokemon.name} ${isFavorite ? "from" : "to"} favorites`}
                  aria-pressed={isFavorite}
                >
                  {isFavorite ? "♥" : "♡"}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="empty-state">
          <span aria-hidden="true">☆</span>
          <p>{showFavorites ? "No favorites yet. Tap a heart on a card to save one!" : "No Pokémon to show."}</p>
        </div>
      )}

      {error && <p className="status status-error">Couldn't load more Pokémon: {error}</p>}
      {!showFavorites && hasMore && (
        <button
          className="load-more-button"
          type="button"
          onClick={() => setOffset((current) => current + PAGE_SIZE)}
          disabled={isLoading}
        >
          {isLoading ? "Loading…" : "Load more Pokémon"}
          {!isLoading && <span aria-hidden="true"> ↓</span>}
        </button>
      )}
    </section>
  );
}

export default PokemonList;
