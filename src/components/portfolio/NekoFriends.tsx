'use client';

import {
  type Character,
  type Point,
  characters,
  clampPet,
  clampPicker,
  preferenceKey,
  readPreferences,
  switchCharacter,
} from '@/lib/neko-state';
import { Check, RotateCcw, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const sprites: Record<string, number[][]> = {
  idle: [[-3, -3]],
  sleeping: [
    [-2, 0],
    [-2, -1],
  ],
  alert: [[-7, -3]],
  N: [
    [-1, -2],
    [-1, -3],
  ],
  NE: [
    [0, -2],
    [0, -3],
  ],
  E: [
    [-3, 0],
    [-3, -1],
  ],
  SE: [
    [-5, -1],
    [-5, -2],
  ],
  S: [
    [-6, -3],
    [-7, -2],
  ],
  SW: [
    [-5, -3],
    [-6, -1],
  ],
  W: [
    [-4, -2],
    [-4, -3],
  ],
  NW: [
    [-1, 0],
    [-1, -1],
  ],
};
const viewport = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

export function CompanionSprite({ character }: { character: Character }) {
  return character.id === 'manthan' ? (
    <span className="neko-human" aria-hidden="true" />
  ) : (
    <span
      className="neko-sprite"
      style={{ filter: `url(#tint-${character.id})` }}
    />
  );
}

function Neko({
  character,
  paused,
  onPicker,
}: {
  character: Character;
  paused: boolean;
  onPicker: (point: Point, id: string) => void;
}) {
  const button = useRef<HTMLButtonElement>(null);
  const position = useRef<Point>({ x: 8, y: 120 });
  const pointer = useRef<Point>({ x: 8, y: 120 });
  const flags = useRef({
    dragging: false,
    hovered: false,
    parked: false,
    moved: false,
    suppress: 0,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelHold = () => {
    if (hold.current) clearTimeout(hold.current);
    hold.current = null;
  };
  const paint = () => {
    position.current = clampPet(position.current, viewport());
    if (button.current) {
      button.current.style.left = `${position.current.x}px`;
      button.current.style.top = `${position.current.y}px`;
    }
  };
  const picker = () => {
    cancelHold();
    flags.current.suppress = performance.now() + 700;
    onPicker(
      { x: position.current.x, y: position.current.y + 50 },
      character.id,
    );
  };
  useEffect(() => {
    position.current = clampPet(
      {
        x: Math.max(10, (window.innerWidth - 816) / 2 - 50),
        y: 180,
      },
      viewport(),
    );
    pointer.current = { ...position.current };
    paint();
    const resize = () => {
      pointer.current = clampPet(pointer.current, viewport());
      paint();
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      // Follow slightly behind the pointer so links remain easy to reach.
      pointer.current = clampPet(
        {
          x: event.clientX - 48,
          y: event.clientY - 48,
        },
        viewport(),
      );
    };
    const roam = () => {
      flags.current.parked = false;
      flags.current.hovered = false;
      pointer.current = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };
    };
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', move);
    window.addEventListener('neko-roam', roam);
    window.addEventListener('kittu-roam', roam);
    return () => {
      cancelHold();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('neko-roam', roam);
      window.removeEventListener('kittu-roam', roam);
    };
  }, []);
  useEffect(() => {
    let frame = 0,
      idle = 0;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sprite = button.current?.querySelector<HTMLElement>(
      '.neko-sprite, .neko-human',
    );
    if (!sprite) return;
    const tick = () => {
      if (document.hidden) return;
      const state = flags.current;
      frame++;
      const stopped =
        paused ||
        media.matches ||
        state.hovered ||
        state.parked ||
        state.dragging ||
        !!document.querySelector('dialog[open]');
      if (
        !stopped &&
        window.matchMedia('(pointer: coarse)').matches &&
        frame % 70 === 0
      )
        pointer.current = clampPet(
          {
            x: Math.random() * window.innerWidth,
            y: 90 + Math.random() * (window.innerHeight - 160),
          },
          viewport(),
        );
      const dx = pointer.current.x - position.current.x,
        dy = pointer.current.y - position.current.y;
      const distance = Math.hypot(dx, dy);
      let animation = 'idle';
      if (stopped || distance < 12) {
        idle++;
        animation = idle > 50 ? 'sleeping' : 'idle';
      } else {
        idle = 0;
        animation =
          (dy / distance < -0.4 ? 'N' : dy / distance > 0.4 ? 'S' : '') +
          (dx / distance < -0.4 ? 'W' : dx / distance > 0.4 ? 'E' : '');
        const speed = Math.min(distance, 8);
        position.current = {
          x: position.current.x + (dx / distance) * speed,
          y: position.current.y + (dy / distance) * speed,
        };
        paint();
      }
      if (character.id === 'manthan') {
        const walking = !stopped && distance >= 12;
        const row = walking
          ? animation.includes('E') || animation.includes('W')
            ? 1
            : animation === 'N'
              ? 2
              : 0
          : 3;
        const column =
          media.matches || paused
            ? 0
            : walking
              ? frame % 4
              : idle > 50
                ? 3
                : frame % 40 === 0
                  ? 1
                  : state.hovered
                    ? 2
                    : 0;
        sprite.style.backgroundPosition = `${column * -48}px ${row * -48}px`;
        sprite.style.transform =
          walking && animation.includes('W') ? 'scaleX(-1)' : 'none';
        sprite.dataset.motion = walking ? 'walk' : animation;
      } else {
        const set = sprites[animation] || sprites.idle;
        const cell =
          set[
            (media.matches || paused
              ? 0
              : Math.floor(frame / (animation === 'sleeping' ? 4 : 1))) %
              set.length
          ];
        sprite.style.backgroundPosition = `${cell[0] * 32}px ${cell[1] * 32}px`;
      }
    };
    tick();
    const timer = setInterval(tick, 100);
    return () => clearInterval(timer);
  }, [character.id, paused]);
  return (
    <button
      ref={button}
      type="button"
      id={`neko-${character.id}`}
      className="neko-companion"
      aria-label={`${character.name}, ${character.kind.toLowerCase()}. Click for CTF help. Right-click or long-press to choose a companion. Drag or use arrow keys to move.`}
      aria-haspopup="dialog"
      onContextMenu={(e) => {
        e.preventDefault();
        picker();
      }}
      onPointerEnter={() => {
        flags.current.hovered = true;
      }}
      onPointerLeave={() => {
        flags.current.hovered = false;
      }}
      onPointerDown={(e) => {
        if (!e.isPrimary || e.button !== 0) return;
        const f = flags.current;
        Object.assign(f, {
          dragging: true,
          moved: false,
          startX: e.clientX,
          startY: e.clientY,
          offsetX: position.current.x - e.clientX,
          offsetY: position.current.y - e.clientY,
        });
        e.currentTarget.setPointerCapture(e.pointerId);
        if (e.pointerType === 'touch' || e.pointerType === 'pen')
          hold.current = setTimeout(picker, 550);
      }}
      onPointerMove={(e) => {
        const f = flags.current;
        if (!f.dragging) return;
        if (Math.hypot(e.clientX - f.startX, e.clientY - f.startY) > 7) {
          f.moved = true;
          cancelHold();
        }
        if (f.moved) {
          position.current = {
            x: e.clientX + f.offsetX,
            y: e.clientY + f.offsetY,
          };
          paint();
        }
      }}
      onPointerUp={(e) => {
        cancelHold();
        const f = flags.current;
        if (f.moved) {
          f.parked = true;
          f.suppress = performance.now() + 450;
        }
        f.dragging = false;
        if (e.pointerType === 'touch') f.hovered = false;
        if (e.currentTarget.hasPointerCapture(e.pointerId))
          e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      onPointerCancel={() => {
        cancelHold();
        flags.current.dragging = false;
        flags.current.suppress = performance.now() + 450;
      }}
      onLostPointerCapture={() => {
        cancelHold();
        flags.current.dragging = false;
      }}
      onClick={(e) => {
        if (performance.now() < flags.current.suppress) {
          e.preventDefault();
          return;
        }
        window.dispatchEvent(
          new CustomEvent('kittu-open', { detail: { name: character.name } }),
        );
      }}
      onKeyDown={(e) => {
        if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
          e.preventDefault();
          picker();
          return;
        }
        const delta: Record<string, Point> = {
          ArrowLeft: { x: -16, y: 0 },
          ArrowRight: { x: 16, y: 0 },
          ArrowUp: { x: 0, y: -16 },
          ArrowDown: { x: 0, y: 16 },
        };
        if (!delta[e.key]) return;
        e.preventDefault();
        flags.current.parked = true;
        position.current = {
          x: position.current.x + delta[e.key].x,
          y: position.current.y + delta[e.key].y,
        };
        paint();
      }}
    >
      <CompanionSprite character={character} />
      <span className="neko-label">{character.name}</span>
    </button>
  );
}

export default function NekoFriends() {
  const [preferences, setPreferences] = useState(() => readPreferences(null));
  const [ready, setReady] = useState(false),
    [chatOpen, setChatOpen] = useState(false);
  const [picker, setPicker] = useState<{ point: Point; id: string } | null>(
    null,
  );
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    try {
      setPreferences(readPreferences(localStorage.getItem(preferenceKey)));
    } catch {}
    setReady(true);
    const show = () => {
      returnFocus.current = document.activeElement as HTMLElement;
      setPicker({ point: { x: window.innerWidth - 310, y: 90 }, id: '' });
    };
    const resume = () => setPreferences((p) => ({ ...p, paused: false }));
    window.addEventListener('kittu-roam', resume);
    const chat = (e: Event) => setChatOpen(!!(e as CustomEvent).detail?.open);
    window.addEventListener('neko-picker-open', show);
    window.addEventListener('kittu-chat-state', chat);
    return () => {
      window.removeEventListener('kittu-roam', resume);
      window.removeEventListener('neko-picker-open', show);
      window.removeEventListener('kittu-chat-state', chat);
    };
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(preferenceKey, JSON.stringify(preferences));
      } catch {}
  }, [ready, preferences]);
  useEffect(() => {
    if (!picker || !dialog.current) return;
    const el = dialog.current;
    el.showModal();
    const place = () => {
      const p = clampPicker(picker.point, viewport(), {
        width: el.offsetWidth,
        height: el.offsetHeight,
      });
      el.style.left = `${p.x}px`;
      el.style.top = `${p.y}px`;
    };
    place();
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('resize', place);
      el.close();
    };
  }, [picker]);
  const close = (focusId?: string) => {
    setPicker(null);
    setTimeout(() => {
      const target = focusId
        ? document.getElementById(`neko-${focusId}`)
        : returnFocus.current;
      if (target?.isConnected) target.focus({ preventScroll: true });
    }, 0);
  };
  if (!ready) return null;
  const visible = characters.filter((c) => c.id === preferences.active);
  return (
    <>
      <svg className="neko-filters" width="0" height="0" aria-hidden>
        <defs>
          {characters
            .filter((c) => c.id !== 'manthan')
            .map((c) => {
              const rgb = [1, 3, 5].map(
                (i) => parseInt(c.color.slice(i, i + 2), 16) / 255,
              );
              return (
                <filter
                  key={c.id}
                  id={`tint-${c.id}`}
                  colorInterpolationFilters="sRGB"
                >
                  <feColorMatrix
                    type="matrix"
                    values={`${rgb[0]} 0 0 0 0 0 ${rgb[1]} 0 0 0 0 0 ${rgb[2]} 0 0 0 0 0 1 0`}
                  />
                </filter>
              );
            })}
        </defs>
      </svg>
      {visible.map((c) => (
        <Neko
          key={c.id}
          character={c}
          paused={preferences.paused || !!picker || chatOpen}
          onPicker={(point, id) => {
            returnFocus.current = document.getElementById(`neko-${id}`);
            setPicker({ point, id });
          }}
        />
      ))}
      {picker && (
        <dialog
          ref={dialog}
          className="neko-picker"
          aria-labelledby="neko-picker-title"
          onCancel={(e) => {
            e.preventDefault();
            close();
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              const r = e.currentTarget.getBoundingClientRect();
              if (
                e.clientX < r.left ||
                e.clientX > r.right ||
                e.clientY < r.top ||
                e.clientY > r.bottom
              )
                close();
            }
          }}
        >
          <div className="neko-picker-heading">
            <h2 id="neko-picker-title">Choose a companion</h2>
            <button
              className="icon-button"
              aria-label="Close companion picker"
              onClick={() => close()}
            >
              <X size={18} />
            </button>
          </div>
          <div className="neko-options" aria-label="Characters">
            {characters.map((c) => (
              <button
                type="button"
                key={c.id}
                className="neko-option"
                aria-pressed={preferences.active === c.id}
                onClick={() => {
                  setPreferences((p) => switchCharacter(p, c.id));
                  close(c.id);
                }}
              >
                <CompanionSprite character={c} />
                <span>
                  <strong>{c.name}</strong>
                  <small>{c.kind}</small>
                </span>
                {preferences.active === c.id && <Check size={16} aria-hidden />}
              </button>
            ))}
          </div>
          <div className="neko-picker-settings">
            <label>
              <input
                type="checkbox"
                checked={preferences.paused}
                onChange={(e) =>
                  setPreferences((p) => ({ ...p, paused: e.target.checked }))
                }
              />
              Pause movement
            </label>
            <button
              onClick={() => {
                setPreferences((p) => ({ ...p, paused: false }));
                window.dispatchEvent(new Event('neko-roam'));
                close();
              }}
            >
              <RotateCcw size={15} />
              Resume movement
            </button>
          </div>
          <p className="neko-picker-hint">Drag to move · Click for CTF help</p>
        </dialog>
      )}
    </>
  );
}
