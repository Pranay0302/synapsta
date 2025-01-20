import React from 'react';

export default function AIResponse({ results }) {
  if (!results) return null;

  const webResults = results?.web?.results || [];

  const summary = webResults
    .slice(0, 3)
    .map((item, idx) => {
      return `(${idx + 1}) ${item.title} - ${item.url}`;
    })
    .join('\n');

  return (
    <div style={{ marginTop: '1rem', border: '1px solid #ccc', padding: '1rem', overflow: 'auto' }}>
      <h2>AI Summary</h2>
      <p>
        Here is a quick summary of top results:
      </p>
      <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{summary}</pre>
    </div>
  );
}
