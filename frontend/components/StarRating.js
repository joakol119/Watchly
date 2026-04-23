'use client';
import { useState } from 'react';

export default function StarRating({ value, onChange, size = 16, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  const stars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {stars.map(star => (
        <button
          key={star}
          onClick={e => { e.stopPropagation(); if (!readonly && onChange) onChange(star === value ? null : star); }}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{
            background: 'none', border: 'none', padding: 0,
            cursor: readonly ? 'default' : 'pointer',
            fontSize: size,
            lineHeight: 1,
            color: (hovered ? star <= hovered : star <= (value || 0))
              ? '#fbbf24'
              : 'rgba(255,255,255,0.15)',
            transition: 'color 0.1s, transform 0.1s',
            transform: !readonly && (hovered ? star <= hovered : star <= (value || 0)) ? 'scale(1.2)' : 'scale(1)',
          }}
        >
          ★
        </button>
      ))}
      {value && (
        <span style={{ fontSize: size - 2, color: '#fbbf24', fontWeight: 700, marginLeft: 4 }}>
          {value}/10
        </span>
      )}
    </div>
  );
}
