import { Fragment, useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL } from "../config.js";
import { capitalize, getIdFromUrl, getOfficialArtworkUrl } from "../utils.js";
import { useSound } from "../context/useSound.js";
import PokeballLoader from "../components/PokeballLoader.jsx";

function getEvolutionStages(chain) {
  const stages = [];

  function addStage(node, index = 0) {
    stages[index] ??= [];
    stages[index].push({
      name: node.species.name,
      id: getIdFromUrl(node.species.url),
    });
    node.evolves_to.forEach((next) => addStage(next, index + 1));
  }

  addStage(chain);
  return stages;
}

function DetailPage() {
  const { name } = useParams();
  const { soundEnabled } = useSound();
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [evolutionStages, setEvolutionStages] = useState([]);
  const [isEvolutionLoading, setIsEvolutionLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlayingCry, setIsPlayingCry] = useState(false);
  const cryRef = useRef(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadPokemon() {
      setIsLoading(true);
      setError(null);
      setPokemon(null);
      setSpecies(null);

      try {
        const response = await fetch(`${API_BASE_URL}/pokemon/${name}`);

        if (!response.ok) {
          throw new Error(`No Pokémon named "${name}" — check the spelling.`);
        }

        const data = await response.json();
        if (isCurrent) setPokemon(data);

        try {
          const speciesResponse = await fetch(data.species.url);
          if (speciesResponse.ok) {
            const speciesData = await speciesResponse.json();
            if (isCurrent) setSpecies(speciesData);
          }
        } catch {
          // The Pokémon details still work if the optional species data is unavailable.
        }
      } catch (err) {
        if (isCurrent) setError(err.message);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    loadPokemon();
    return () => {
      isCurrent = false;
    };
  }, [name]);

  useEffect(() => {
    if (!species?.evolution_chain?.url) return undefined;
    let isCurrent = true;

    async function loadEvolutionChain() {
      setIsEvolutionLoading(true);
      setEvolutionStages([]);
      try {
        const response = await fetch(species.evolution_chain.url);
        if (!response.ok) throw new Error("Couldn't load the evolution path.");
        const data = await response.json();
        if (isCurrent) setEvolutionStages(getEvolutionStages(data.chain));
      } catch {
        if (isCurrent) setEvolutionStages([]);
      } finally {
        if (isCurrent) setIsEvolutionLoading(false);
      }
    }

    loadEvolutionChain();
    return () => {
      isCurrent = false;
    };
  }, [species]);

  if (isLoading) return <PokeballLoader label={`Finding ${capitalize(name)}…`} />;
  if (error) {
    return (
      <div className="detail-error">
        <p className="status status-error">{error}</p>
        <Link to="/" className="back-link">← Back to the Pokédex</Link>
      </div>
    );
  }

  const artwork =
    pokemon.sprites.other["official-artwork"].front_default ||
    pokemon.sprites.front_default;
  const description = species?.flavor_text_entries
    ?.find((entry) => entry.language.name === "en")
    ?.flavor_text.replace(/[\n\f]/g, " ");
  const genus = species?.genera?.find((entry) => entry.language.name === "en")?.genus;

  async function playPokemonCry() {
    if (!cryRef.current || !soundEnabled) return;
    cryRef.current.currentTime = 0;
    try {
      await cryRef.current.play();
      setIsPlayingCry(true);
    } catch {
      setIsPlayingCry(false);
    }
  }

  return (
    <div className="detail-page">
      <Link to="/" className="back-link"><span aria-hidden="true">←</span> Back to the Pokédex</Link>
      <article className="detail-card">
        <div className={`detail-art type-${pokemon.types[0].type.name}`}>
          <img src={artwork} alt={pokemon.name} width={300} height={300} />
        </div>
        <div className="detail-info">
          <span className="detail-number">POKÉDEX No. {String(pokemon.id).padStart(3, "0")}</span>
          <h2>{capitalize(pokemon.name)}</h2>
          <p className="pokemon-genus">{genus || "Pokémon"}</p>
          <div className="pokemon-types" aria-label="Types">
            {pokemon.types.map(({ type }) => (
              <span className={`type-chip type-${type.name}`} key={type.name}>{type.name}</span>
            ))}
          </div>
          <p className="pokemon-description">
            {description || `${capitalize(pokemon.name)} is waiting to join your adventure. Explore its abilities and base stats below.`}
          </p>
          {pokemon.cries?.latest && (
            <div className="cry-control">
              <button
                type="button"
                className="cry-button"
                onClick={playPokemonCry}
                disabled={!soundEnabled}
                aria-label={`Play ${pokemon.name}'s cry`}
              >
                <span aria-hidden="true">{isPlayingCry ? "♫" : "▶"}</span>
                {soundEnabled ? "Hear its cry" : "Turn sound on to hear its cry"}
              </button>
              <audio
                ref={cryRef}
                src={pokemon.cries.latest}
                onEnded={() => setIsPlayingCry(false)}
                onError={() => setIsPlayingCry(false)}
              />
            </div>
          )}
          <div className="pokemon-measurements">
            <span><strong>{(pokemon.height / 10).toFixed(1)} m</strong>Height</span>
            <span><strong>{(pokemon.weight / 10).toFixed(1)} kg</strong>Weight</span>
            <span><strong>{pokemon.base_experience ?? "—"}</strong>Base XP</span>
          </div>
          <div className="abilities-section">
            <h3 className="stats-heading">Abilities</h3>
            <div className="ability-list">
              {pokemon.abilities.map(({ ability, is_hidden }) => (
                <span className="ability-chip" key={ability.name}>
                  {ability.name.replaceAll("-", " ")}
                  {is_hidden && <small>Hidden</small>}
                </span>
              ))}
            </div>
          </div>
          <h3 className="stats-heading">Base stats</h3>
          <ul className="stat-list">
            {pokemon.stats.map(({ stat, base_stat }) => (
              <li key={stat.name}>
                <span className="stat-name">{stat.name.replace("-", " ")}</span>
                <span className="stat-value">{base_stat}</span>
                <span className="stat-track" aria-label={`${base_stat} base stat`}>
                  <span className="stat-fill" style={{ width: `${Math.min(base_stat / 2, 100)}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </article>
      <section className="evolution-panel" aria-labelledby="evolution-title">
        <div className="evolution-heading">
          <div>
            <p className="eyebrow">THE FAMILY TREE</p>
            <h3 id="evolution-title">Evolution path</h3>
          </div>
          <span className="evolution-pokeball" aria-hidden="true">✦</span>
        </div>
        {isEvolutionLoading ? (
          <p className="evolution-note">Finding this Pokémon's family…</p>
        ) : evolutionStages.length > 1 ? (
          <div className="evolution-path">
            {evolutionStages.map((stage, stageIndex) => (
              <Fragment key={stageIndex}>
                <div className="evolution-stage">
                  <span className="stage-label">
                    {stageIndex === 0 ? "FIRST FORM" : stageIndex === 1 ? "EVOLVES INTO" : "FINAL FORM"}
                  </span>
                  <div className="evolution-forms">
                    {stage.map((form) => (
                      <Link
                        key={form.name}
                        to={`/pokemon/${form.name}`}
                        className={`evolution-card${form.name === pokemon.name ? " is-current" : ""}`}
                        aria-current={form.name === pokemon.name ? "page" : undefined}
                      >
                        <span className="evolution-artwork">
                          <img src={getOfficialArtworkUrl(form.id)} alt={form.name} loading="lazy" />
                        </span>
                        <span className="evolution-name">{capitalize(form.name)}</span>
                        <span className="evolution-number">#{form.id.padStart(3, "0")}</span>
                      </Link>
                    ))}
                  </div>
                </div>
                {stageIndex < evolutionStages.length - 1 && (
                  <span className="evolution-arrow" aria-hidden="true">➜</span>
                )}
              </Fragment>
            ))}
          </div>
        ) : (
          <p className="evolution-note">
            {evolutionStages.length === 1
              ? `${capitalize(pokemon.name)} has no further evolutions.`
              : "Evolution details are unavailable right now."}
          </p>
        )}
      </section>
    </div>
  );
}

export default DetailPage;
