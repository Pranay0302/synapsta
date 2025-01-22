import { useState } from 'react';
import Input from 'synapses/Input';
import Button from 'synapses/Button';
import AIResponse from 'synapses/chat/AIResponse';
import Accordion from 'synapses/Accordion';
import Dialog from 'synapses/Dialog';

export default function Home() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [aiQueries, setAiQueries] = useState([]);
  const [error, setError] = useState(null);

  async function handleSearch() {
    if (!query.trim()) {
      setSearchResults(null);
      setAiQueries([]);
      setError(null);
      return;
    }
    setError(null);

    try {
      const res = await fetch(`/api/brave?q=${encodeURIComponent(query)}`);
      if (!res.ok) {
        throw new Error(`Request to Brave API failed with status ${res.status}`);
      }
      const data = await res.json();
      setSearchResults(data);
      const newQueries = data?.web?.results?.slice(0, 3).map((item) => item.title) || [];
      setAiQueries(newQueries);

    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <h1>Synapsta (Powered by Brave Search & AI)</h1>

      <div style={{ display: 'flex', gap: '8px' }}>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {searchResults && (
        <div style={{ marginTop: '1rem' }}>
          <Accordion title="Raw Brave Search Results">
            <pre>{JSON.stringify(searchResults, null, 2)}</pre>
          </Accordion>
          <AIResponse
            results={searchResults}
            queries={aiQueries}
          />
        </div>
      )}

      <Dialog
        title="About This App"
        content="This is a simple AI-powered search engine that uses the Brave Search API for web results and OpenAI (gpt-3.5-turbo) for AI responses. Many other models will be added."
      />
    </div>
  );
}
