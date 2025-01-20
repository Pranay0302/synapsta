import React from 'react';

export default function AIResponse({ results }) {
  if (!results) return null;

  const webResults = results?.web?.results || [];

  return (
    <div style={{ marginTop: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
      <h2>Search Results</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {webResults.slice(0, 6).map((item, idx) => {
          const faviconUrl = new URL(item.url).origin + '/favicon.ico';
          return (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.5rem 1rem',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '4px',
                textDecoration: 'none',
                color: '#333',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '200px',
              }}
              title={item.title}
            >
              <img
                src={faviconUrl}
                alt=""
                style={{ width: '16px', height: '16px', borderRadius: '3px' }}
                onError={(e) => {
                  e.target.style.display = 'none'; 
                }}
              />
              {item.title}
            </a>
          );
        })}
      </div>
    </div>
  );
}
