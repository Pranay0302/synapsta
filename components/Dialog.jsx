import React, { useState } from 'react';

export default function Dialog({ title, content }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ marginTop: '1rem' }}>
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 'Hide Info' : 'Show Info'}
      </button>
      {isOpen && (
        <div
          style={{
            border: '1px solid #ccc',
            padding: '1rem',
            marginTop: '0.5rem',
            position: 'relative',
          }}
        >
          <h2>{title}</h2>
          <p>{content}</p>
          <button
            onClick={() => setIsOpen(false)}
            style={{ position: 'absolute', top: 8, right: 8 }}
          >
            X
          </button>
        </div>
      )}
    </div>
  );
}
