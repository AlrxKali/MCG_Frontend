import { FormEvent, useState } from "react";

type DrugAnalysis = {
  name: string;
  url: string;
  top_tokens: string[];
  description?: string | null;
};

type ApiResponse = {
  results: DrugAnalysis[];
};

const DEFAULT_PLACEHOLDER = "Metformin, Aspirin, Escitalopram";

function parseInput(input: string): string[] {
  return input
    .split(/[,\n]/)
    .map((token) => token.trim())
    .filter(Boolean);
}

const App = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<DrugAnalysis[] | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const drugs = parseInput(query);
    if (drugs.length === 0) {
      setError("Enter at least one drug name.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${__API_BASE_URL__}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drugs })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const detail = payload?.detail;
        throw new Error(typeof detail === "string" ? detail : "Request failed");
      }

      const payload: ApiResponse = await response.json();
      setResults(payload.results);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1>Health Assistant</h1>
        <p>
          Enter one or more drug names separated by commas or new lines to fetch
          RxNorm and MedlinePlus insights.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="app__form">
        <label htmlFor="drug-input">Drug names</label>
        <textarea
          id="drug-input"
          name="drug-input"
          rows={3}
          placeholder={DEFAULT_PLACEHOLDER}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Fetching…" : "Fetch insights"}
        </button>
      </form>

      {error && <div className="app__error">{error}</div>}

      {results && (
        <section className="results">
          {results.map((result) => (
            <article key={result.name} className="results__card">
              <h2>{result.name}</h2>
              <a href={result.url} target="_blank" rel="noreferrer">
                {result.url}
              </a>
              {result.description && (
                <section className="results__genai">
                  <h3>Our GenAI assistance says:</h3>
                  <p>{result.description}</p>
                </section>
              )}
              <h3>Top terms</h3>
              <ul>
                {result.top_tokens.map((token) => (
                  <li key={token}>{token}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default App;
