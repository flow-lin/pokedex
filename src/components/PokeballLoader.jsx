function PokeballLoader({ label = "Loading your Pokédex…" }) {
  return (
    <div className="loading-scene" role="status" aria-live="polite">
      <div className="loading-stage" aria-hidden="true">
        <span className="loading-orbit" />
        <span className="loading-sparkle sparkle-one">✦</span>
        <span className="loading-sparkle sparkle-two">✧</span>
        <span className="loading-pokeball"><span /></span>
      </div>
      <p className="loading-message">{label}</p>
      <span className="loading-dots" aria-hidden="true"><i /><i /><i /></span>
    </div>
  );
}

export default PokeballLoader;
