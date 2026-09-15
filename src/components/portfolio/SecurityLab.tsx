'use client';

import {
  evaluateCommand,
  flag,
  hashText,
  incident,
  stages,
} from '@/lib/security';
import {
  Check,
  ChevronRight,
  Code2,
  Copy,
  RotateCcw,
  ShieldCheck,
  Terminal,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Tab = 'terminal' | 'hash' | 'ctf';
const COMMANDS = [
  'help',
  'whoami',
  'about',
  'projects',
  'skills',
  'contact',
  'cv',
  'ls',
  'pwd',
  'cat',
  'investigate',
  'logs',
  'hash',
  'base64',
  'decode',
  'nmap',
  'ping',
  'clear',
  'exit',
  'ctf',
  'hint',
  'answer',
  'banner',
];
export default function SecurityLab({
  initialTab,
  onClose,
  onAskKittu,
}: {
  initialTab: Tab;
  onClose: () => void;
  onAskKittu: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    output = useRef<HTMLDivElement>(null),
    input = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>(initialTab),
    [lines, setLines] = useState([
      'Manthan’s shell · browser sandbox',
      'Type help to explore. There may be a flag hiding here.',
    ]),
    [value, setValue] = useState(''),
    [history, setHistory] = useState<string[]>([]),
    [cursor, setCursor] = useState(-1),
    [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0),
    [answer, setAnswer] = useState(''),
    [feedback, setFeedback] = useState(''),
    [showHint, setShowHint] = useState(false),
    [storageReady, setStorageReady] = useState(false);
  const [text, setText] = useState(''),
    [algorithm, setAlgorithm] = useState('SHA-256'),
    [digest, setDigest] = useState(''),
    [hashError, setHashError] = useState(''),
    [hashBusy, setHashBusy] = useState(false),
    [copied, setCopied] = useState(false),
    [fileName, setFileName] = useState('');
  const hashVersion = useRef(0);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    dialog.current?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    try {
      const v = Number(localStorage.getItem('manthan-sleek-ctf'));
      if (Number.isInteger(v) && v >= 0 && v <= stages.length) setStage(v);
    } catch {}
    setStorageReady(true);
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  useEffect(() => {
    if (storageReady)
      try {
        localStorage.setItem('manthan-sleek-ctf', String(stage));
      } catch {}
  }, [stage, storageReady]);
  useEffect(() => {
    if (output.current) output.current.scrollTop = output.current.scrollHeight;
  }, [lines]);
  useEffect(() => {
    if (tab === 'terminal') input.current?.focus();
  }, [tab]);
  const verify = (submission: string) => {
    if (stage >= stages.length) return 'Challenge already complete: ' + flag;
    if (submission.trim().toLowerCase() !== stages[stage].answer)
      return 'Not quite. Recheck the evidence or use a hint.';
    const next = stage + 1;
    setStage(next);
    setAnswer('');
    setShowHint(false);
    return next === stages.length
      ? 'All five stages solved! ' + flag
      : `Correct — ${next * 20}/100 points. Next: ${stages[next].prompt}`;
  };
  const submit = async (raw: string) => {
    if (busy || !raw.trim()) return;
    setBusy(true);
    setValue('');
    setCursor(-1);
    setHistory((h) => [raw, ...h].slice(0, 50));
    setLines((l) => [...l, 'visitor@manthan:~$ ' + raw]);
    let result = '';
    const lower = raw.trim().toLowerCase();
    try {
      if (lower === 'clear') {
        setLines([]);
        return;
      }
      if (lower === 'exit' || lower === 'quit') {
        onClose();
        return;
      }
      if (lower.startsWith('ctf')) {
        if (lower === 'ctf reset') {
          setStage(0);
          setFeedback('');
          result = 'Progress reset. ' + stages[0].prompt;
        } else {
          setTab('ctf');
          result = stage === 5 ? flag : stages[stage].prompt;
        }
      } else if (lower === 'hint') {
        result = stage === 5 ? 'All stages complete.' : stages[stage].hint;
      } else if (lower.startsWith('answer ')) {
        result = verify(raw.trim().slice(7));
      } else result = await evaluateCommand(raw);
      setLines((l) => [...l, result].slice(-150));
    } catch (e) {
      setLines((l) => [
        ...l,
        e instanceof Error ? e.message : 'Command failed.',
      ]);
    } finally {
      setBusy(false);
    }
  };
  const calculate = async () => {
    setFileName('');
    const version = ++hashVersion.current;
    setHashBusy(true);
    setHashError('');
    setDigest('');
    setCopied(false);
    try {
      const result = await hashText(text, algorithm);
      if (version === hashVersion.current) setDigest(result);
    } catch (e) {
      if (version === hashVersion.current)
        setHashError(
          e instanceof Error ? e.message : 'Could not calculate hash.',
        );
    } finally {
      if (version === hashVersion.current) setHashBusy(false);
    }
  };
  const clearDigest = () => {
    hashVersion.current++;
    setDigest('');
    setHashBusy(false);
    setCopied(false);
    setHashError('');
  };
  return (
    <dialog
      ref={dialog}
      className="security-dialog"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === dialog.current) onClose();
      }}
      aria-labelledby="lab-title"
    >
      <div className="lab-header">
        <span id="lab-title">The curious corner</span>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close security lab"
        >
          <X size={20} />
        </button>
      </div>
      <div className="lab-tabs" role="tablist" aria-label="Security tools">
        {(
          [
            ['terminal', 'Terminal', Terminal],
            ['ctf', 'CTF', ShieldCheck],
            ['hash', 'Hash calculator', Code2],
          ] as const
        ).map(([id, label, Icon], i) => (
          <button
            key={id}
            role="tab"
            id={'tab-' + id}
            aria-controls={'panel-' + id}
            aria-selected={tab === id}
            tabIndex={tab === id ? 0 : -1}
            onClick={() => setTab(id)}
            onKeyDown={(e) => {
              const ids: Tab[] = ['terminal', 'ctf', 'hash'];
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const next = ids[(i + (e.key === 'ArrowRight' ? 1 : 2)) % 3];
                setTab(next);
                document.getElementById('tab-' + next)?.focus();
              }
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>
      {tab === 'terminal' && (
        <div id="panel-terminal" role="tabpanel" aria-labelledby="tab-terminal">
          <div
            ref={output}
            className="shell-output"
            role="log"
            aria-label="Terminal output"
            aria-live="polite"
          >
            {lines.map((line, i) => (
              <p
                key={i}
                className={line.startsWith('visitor@') ? 'command-line' : ''}
              >
                {line}
              </p>
            ))}
          </div>
          <form
            className="shell-input"
            onSubmit={(e) => {
              e.preventDefault();
              void submit(value);
            }}
          >
            <span aria-hidden>❯</span>
            <input
              ref={input}
              aria-label="Terminal command"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={1000}
              autoComplete="off"
              spellCheck={false}
              placeholder="Type help…"
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  const next = Math.min(cursor + 1, history.length - 1);
                  setCursor(next);
                  setValue(history[next] || '');
                }
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  const next = Math.max(-1, cursor - 1);
                  setCursor(next);
                  setValue(history[next] || '');
                }
                if (e.key === 'Tab' && value) {
                  const matches = COMMANDS.filter((c) => c.startsWith(value));
                  if (matches.length === 1) {
                    e.preventDefault();
                    setValue(matches[0] + ' ');
                  }
                }
              }}
            />
            <button
              type="submit"
              className="icon-button"
              aria-label="Run command"
              disabled={busy}
            >
              <ChevronRight size={19} />
            </button>
          </form>
          <p className="lab-footnote">
            No commands execute on your device. Network output is simulated.
          </p>
        </div>
      )}
      {tab === 'ctf' && (
        <div
          className="lab-panel"
          id="panel-ctf"
          role="tabpanel"
          aria-labelledby="tab-ctf"
        >
          <div className="ctf-heading">
            <span>Incident response track</span>
            <strong>{stage * 20} / 100</strong>
          </div>
          <div
            className="ctf-progress"
            aria-label={`${stage} of 5 challenges solved`}
          >
            {stages.map((s, i) => (
              <span className={i < stage ? 'complete' : ''} key={s.name} />
            ))}
          </div>
          <p className="lab-footnote">
            Five stages · synthetic evidence · progress saved on this browser
          </p>
          {stage < 5 ? (
            <>
              <p className="metadata">STAGE {stage + 1} / 5</p>
              <h3>{stages[stage].name}</h3>
              <p className="challenge-prompt">{stages[stage].prompt}</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setFeedback(verify(answer));
                }}
              >
                <label htmlFor="ctf-answer">Your answer</label>
                <div className="answer-row">
                  <input
                    id="ctf-answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    required
                    autoComplete="off"
                    placeholder="Follow the clue…"
                  />
                  <button className="button primary" type="submit">
                    Submit
                  </button>
                </div>
              </form>
              <div className="ctf-actions">
                <button onClick={() => setShowHint(!showHint)}>
                  {showHint ? 'Hide hint' : 'Need a hint?'}
                </button>
                <button onClick={() => setTab('terminal')}>
                  Open terminal <ChevronRight size={14} />
                </button>
              </div>
              {showHint && <p className="hint">{stages[stage].hint}</p>}
              <details>
                <summary>
                  Synthetic case notes <ChevronRight size={15} />
                </summary>
                <pre className="case-notes">{incident}</pre>
              </details>
            </>
          ) : (
            <div className="ctf-complete">
              <Check size={35} />
              <h3>Evidence followed. Flag captured.</h3>
              <code>{flag}</code>
              <p>All five challenges solved. Nicely investigated.</p>
            </div>
          )}
          <p role="status" className="feedback">
            {feedback}
          </p>
          <button className="ask-kittu-button" onClick={onAskKittu}>
            <span className="kittu-mini" aria-hidden />
            Ask a companion about this clue
          </button>
          <button
            className="reset-button"
            onClick={() => {
              setStage(0);
              setFeedback('Progress reset.');
              setAnswer('');
              setShowHint(false);
            }}
          >
            <RotateCcw size={13} /> Reset challenge
          </button>
        </div>
      )}
      {tab === 'hash' && (
        <div
          className="lab-panel"
          id="panel-hash"
          role="tabpanel"
          aria-labelledby="tab-hash"
        >
          <h3>Hash calculator</h3>
          <p className="challenge-prompt">
            Compute a hash from text or a file. Your input stays on this device.
          </p>
          <label htmlFor="hash-algorithm">Algorithm</label>
          <select
            id="hash-algorithm"
            value={algorithm}
            onChange={(e) => {
              setAlgorithm(e.target.value);
              clearDigest();
              setFileName('');
            }}
          >
            {['SHA-256', 'SHA-384', 'SHA-512', 'SHA-1'].map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
          {algorithm === 'SHA-1' && (
            <p className="lab-footnote">
              SHA-1 is included for legacy comparison; it is not
              collision-resistant.
            </p>
          )}
          <label htmlFor="hash-text">Text to hash</label>
          <textarea
            id="hash-text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setFileName('');
              clearDigest();
            }}
            rows={4}
            placeholder="Type anything — even an empty string has a hash."
          />
          <div className="hash-actions">
            <button
              className="button primary"
              onClick={() => void calculate()}
              disabled={hashBusy}
            >
              {hashBusy ? 'Calculating…' : 'Calculate hash'}
            </button>
            <label className="button file-button">
              Choose file
              <input
                type="file"
                aria-label="Choose a file to hash"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  clearDigest();
                  setFileName(file.name);
                  const version = ++hashVersion.current;
                  setHashBusy(true);
                  try {
                    if (file.size > 25 * 1024 * 1024)
                      throw new Error('Choose a file smaller than 25 MB.');
                    const bytes = await file.arrayBuffer();
                    const result = Array.from(
                      new Uint8Array(
                        await crypto.subtle.digest(algorithm, bytes),
                      ),
                      (b) => b.toString(16).padStart(2, '0'),
                    ).join('');
                    if (version === hashVersion.current) setDigest(result);
                  } catch (err) {
                    if (version === hashVersion.current)
                      setHashError(
                        err instanceof Error
                          ? err.message
                          : 'Could not read file.',
                      );
                  } finally {
                    if (version === hashVersion.current) setHashBusy(false);
                    e.target.value = '';
                  }
                }}
              />
            </label>
          </div>
          {fileName && <p className="lab-footnote">File: {fileName}</p>}
          {hashError && (
            <p role="alert" className="feedback">
              {hashError}
            </p>
          )}
          {digest && (
            <div className="hash-result">
              <div>
                <span>
                  {algorithm} · {digest.length} hex characters
                </span>
                <button
                  className="icon-button"
                  aria-label="Copy hash"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(digest);
                      setCopied(true);
                    } catch {
                      setHashError(
                        'Copy unavailable. Select and copy the hash below.',
                      );
                    }
                  }}
                >
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                </button>
              </div>
              <output>{digest}</output>
              {copied && <span role="status">Copied</span>}
            </div>
          )}
          <p className="lab-footnote">
            UTF-8 text · native Web Crypto · whitespace is significant
          </p>
        </div>
      )}
    </dialog>
  );
}
