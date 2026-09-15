export type Point = { x: number; y: number };
export type Size = { width: number; height: number };
export type Preferences = { active: string; paused: boolean };
export const characters = [
  { id: 'manthan', name: 'Manthan', kind: 'Human', color: '#8cbdf4' },
  { id: 'kritika', name: 'Kritika', kind: 'Female cat', color: '#e5a9bd' },
  { id: 'savy', name: 'Savy', kind: 'Female cat', color: '#bca4e3' },
  { id: 'garisha', name: 'Garisha', kind: 'Female cat', color: '#8cc8b2' },
  { id: 'jiya', name: 'Jiya', kind: 'Female cat', color: '#ebbb79' },
  { id: 'krish', name: 'Krish', kind: 'Male cat', color: '#8aafda' },
] as const;
export type Character = (typeof characters)[number];
export const preferenceKey = 'morewithmanthan-companions-v1';
const defaults: Preferences = { active: 'manthan', paused: false };
export function readPreferences(raw: string | null): Preferences {
  try {
    const value = JSON.parse(raw || 'null');
    if (!value || typeof value !== 'object') return { ...defaults };
    return {
      active: characters.some((c) => c.id === value.active)
        ? value.active
        : defaults.active,
      paused:
        typeof value.paused === 'boolean' ? value.paused : defaults.paused,
    };
  } catch {
    return { ...defaults };
  }
}
export function switchCharacter(value: Preferences, id: string): Preferences {
  return characters.some((c) => c.id === id) ? { ...value, active: id } : value;
}
function clamp(value: number, max: number) {
  return Math.max(
    8,
    Math.min(Number.isFinite(value) ? value : 8, Math.max(8, max)),
  );
}
export function clampPet(point: Point, viewport: Size): Point {
  return {
    x: clamp(point.x, viewport.width - 56),
    y: clamp(point.y, viewport.height - 78),
  };
}
export function clampPicker(point: Point, viewport: Size, panel: Size): Point {
  return {
    x: clamp(point.x, viewport.width - panel.width - 8),
    y: clamp(point.y, viewport.height - panel.height - 8),
  };
}
