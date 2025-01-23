import { Eye, EyeClosed, CircleX } from 'lucide-react';
import React, { useState } from 'react';

export default function Dialog({ title, content }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ marginTop: '1rem' }}>
      <button onClick={() => setIsOpen(!isOpen)} style={{cursor: 'pointer'}}>
        {isOpen ? <Eye /> : <EyeClosed />}
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
            <CircleX />
          </button>
        </div>
      )}
    </div>
  );
}
