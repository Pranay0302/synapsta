import { useState } from 'react';

export default function Accordion({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ margin: '1rem 0' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: 'pointer',
          backgroundColor: '#efefef',
          padding: '0.5rem',
          fontWeight: 'bold',
        }}
      >
        {title}
      </div>
      {isOpen && (
        <div style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
          {children}
        </div>
      )}
    </div>
  );
}
