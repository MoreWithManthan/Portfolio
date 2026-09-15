'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function CommandPalette({
  onClose,
  onLab,
}: {
  onClose: () => void;
  onLab: (tab: 'terminal' | 'ctf' | 'hash') => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(''),
    [index, setIndex] = useState(0);
  const items = [
    { label: 'Home', href: '#home' },
    { label: 'Experience & education', href: '#journey' },
    {
      label: 'Projects · SENTRA CORE, NeuroSole, NervoStep',
      href: '#projects',
    },
    { label: 'About Manthan', href: '#about' },
    { label: 'Technical stack', href: '#skills' },
    { label: 'Certifications', href: '#certifications' },
    { label: 'Contact', href: '#contact' },
    { label: 'Resume / CV', href: '/assets/Manthan_Garg_Resume.pdf' },
    { label: 'Terminal', tab: 'terminal' as const },
    { label: 'Capture the flag · CTF', tab: 'ctf' as const },
    { label: 'Hash calculator', tab: 'hash' as const },
    { label: 'Choose a companion', companion: true },
  ].filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase().trim()),
  );
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    dialog.current?.showModal();
    input.current?.focus();
    return () => {
      previous?.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    document
      .getElementById(`command-${index}`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [index, query]);
  function choose(i: number) {
    const item = items[i];
    if (!item) return;
    onClose();
    if ('tab' in item && item.tab) onLab(item.tab);
    else if ('companion' in item)
      setTimeout(() => window.dispatchEvent(new Event('neko-picker-open')), 0);
    else if (item.href?.startsWith('#'))
      document.querySelector(item.href)?.scrollIntoView();
    else if (item.href) window.open(item.href, '_blank', 'noopener,noreferrer');
  }
  return (
    <dialog
      ref={dialog}
      className="command-palette"
      aria-label="Search portfolio"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="command-input">
        <Search size={20} />
        <input
          ref={input}
          placeholder="Find a section or tool…"
          aria-label="Search sections and tools"
          role="combobox"
          aria-expanded="true"
          aria-controls="command-results"
          aria-autocomplete="list"
          aria-activedescendant={items.length ? `command-${index}` : undefined}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIndex(0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
              setIndex((n) =>
                items.length
                  ? (n + (e.key === 'ArrowDown' ? 1 : -1) + items.length) %
                    items.length
                  : 0,
              );
            }
            if (e.key === 'Enter') {
              e.preventDefault();
              choose(index);
            }
          }}
        />
        <button
          className="icon-button"
          aria-label="Close search"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>
      <div
        id="command-results"
        role="listbox"
        aria-label="Matching destinations"
      >
        {items.map((item, i) => (
          <button
            key={item.label}
            role="option"
            aria-selected={i === index}
            id={`command-${i}`}
            onPointerMove={() => setIndex(i)}
            onClick={() => choose(i)}
          >
            {item.label}
            <span>↵</span>
          </button>
        ))}
        {!items.length && (
          <p className="command-empty" role="status">
            No matching section. Try “projects” or “CTF”.
          </p>
        )}
      </div>
      <p className="command-hint">↑ ↓ Navigate · Enter Open · Esc Close</p>
    </dialog>
  );
}
