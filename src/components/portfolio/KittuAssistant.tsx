'use client';

import { type KittuReply, kittuReply, readCtfStage } from '@/lib/kittu';
import { ArrowUpRight, RotateCcw, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Message = {
  role: 'kittu' | 'visitor';
  text: string;
  action?: KittuReply['action'];
};
export default function KittuAssistant({
  onOpenLab,
}: {
  onOpenLab: (tab: 'ctf' | 'terminal' | 'hash') => void;
}) {
  const [open, setOpen] = useState(false),
    [value, setValue] = useState(''),
    [messages, setMessages] = useState<Message[]>([
      {
        role: 'kittu',
        text: 'Hi, I’m Kittu! 🐾 I can help you get started, give hints for your current CTF stage, and explain the evidence. What are we investigating?',
      },
    ]);
  const [name, setName] = useState('Kritika');
  const input = useRef<HTMLInputElement>(null),
    log = useRef<HTMLDivElement>(null),
    previous = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const show = (event: Event) => {
      const requested = (event as CustomEvent).detail?.name;
      if (
        ['Manthan', 'Kritika', 'Savy', 'Garisha', 'Jiya', 'Krish'].includes(
          requested,
        )
      )
        setName(requested);
      previous.current = document.activeElement as HTMLElement;
      setOpen(true);
    };
    window.addEventListener('kittu-open', show);
    return () => window.removeEventListener('kittu-open', show);
  }, []);
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('kittu-chat-state', { detail: { open } }),
    );
    if (open) input.current?.focus();
  }, [open]);
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages, open]);
  const close = () => {
    setOpen(false);
    if (previous.current?.isConnected) previous.current.focus();
    else document.querySelector<HTMLButtonElement>('.neko-companion')?.focus();
  };
  const send = (text: string) => {
    if (!text.trim()) return;
    const reply = kittuReply(text, readCtfStage());
    setMessages((m) =>
      [
        ...m,
        { role: 'visitor' as const, text: text.trim() },
        { role: 'kittu' as const, ...reply },
      ].slice(-60),
    );
    setValue('');
  };
  if (!open) return null;
  return (
    <aside
      className="kittu-chat"
      role="dialog"
      aria-modal="false"
      aria-labelledby="kittu-title"
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          close();
        }
      }}
    >
      <header className="kittu-chat-header">
        <span className="kittu-mini" aria-hidden />
        <div>
          <h2 id="kittu-title">{name}</h2>
          <p>Your CTF guide</p>
        </div>
        <button
          className="icon-button"
          aria-label="Close companion chat"
          onClick={close}
        >
          <X size={18} />
        </button>
      </header>
      <div
        className="kittu-chat-log"
        role="log"
        aria-live="polite"
        aria-label={`Conversation with ${name}`}
        ref={log}
      >
        {messages.map((m, i) => (
          <div key={i} className={'kittu-message ' + m.role}>
            <span className="sr-only">
              {m.role === 'kittu' ? name : 'You'}:{' '}
            </span>
            <p>
              {m.role === 'kittu' ? m.text.replaceAll('Kittu', name) : m.text}
            </p>
            {m.action && (
              <button
                className="kittu-action"
                onClick={() => {
                  setOpen(false);
                  onOpenLab(m.action!);
                }}
              >
                Open{' '}
                {m.action === 'ctf'
                  ? 'CTF'
                  : m.action === 'hash'
                    ? 'hash calculator'
                    : 'terminal'}
                <ArrowUpRight size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="kittu-suggestions">
        {['Give me a hint', 'Explain this clue', 'My progress'].map((q) => (
          <button key={q} onClick={() => send(q)}>
            {q}
          </button>
        ))}
      </div>
      <form
        className="kittu-input-row"
        onSubmit={(e) => {
          e.preventDefault();
          send(value);
        }}
      >
        <input
          ref={input}
          aria-label={`Message ${name}`}
          placeholder="Ask about the CTF…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={500}
          autoComplete="off"
        />
        <button
          aria-label="Send message"
          className="icon-button"
          type="submit"
          disabled={!value.trim()}
        >
          <Send size={17} />
        </button>
      </form>
      <div className="kittu-chat-footer">
        <button
          onClick={() => {
            window.dispatchEvent(new Event('kittu-roam'));
            setOpen(false);
            document
              .querySelector<HTMLAnchorElement>('.reference-nav-links a')
              ?.focus();
          }}
        >
          <RotateCcw size={12} />
          Let companions roam
        </button>
        <span>Hints from the CTF notebook</span>
      </div>
    </aside>
  );
}
