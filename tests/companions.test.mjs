import { expect, test } from 'bun:test';
import { Window } from 'happy-dom';

// A DOM test, not a browser visual check. Pointer capture is not implemented by happy-dom.
const win = new Window({
  url: 'http://localhost:3000',
  width: 1280,
  height: 800,
});
for (const name of [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'HTMLButtonElement',
  'HTMLDialogElement',
  'Event',
  'CustomEvent',
  'MouseEvent',
  'PointerEvent',
  'KeyboardEvent',
  'localStorage',
])
  Object.defineProperty(globalThis, name, {
    value: name === 'window' ? win : win[name],
    configurable: true,
    writable: true,
  });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
if (!win.HTMLElement.prototype.setPointerCapture) {
  win.HTMLElement.prototype.setPointerCapture = function (id) {
    this.captured = id;
  };
  win.HTMLElement.prototype.hasPointerCapture = function (id) {
    return this.captured === id;
  };
  win.HTMLElement.prototype.releasePointerCapture = function () {
    this.captured = null;
  };
}
const React = await import('react');
const { createRoot } = await import('react-dom/client');
const { default: NekoFriends } = await import(
  '../src/components/portfolio/NekoFriends.tsx'
);
const { default: CommandPalette } = await import(
  '../src/components/portfolio/CommandPalette.tsx'
);
const { act } = React;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const dispatch = (el, type, init) =>
  el.dispatchEvent(
    new win.PointerEvent(type, {
      bubbles: true,
      isPrimary: true,
      button: 0,
      pointerId: 1,
      ...init,
    }),
  );

test('legacy all-six preferences migrate to one companion and switching never duplicates it', async () => {
  win.localStorage.setItem(
    'morewithmanthan-companions-v1',
    JSON.stringify({ active: 'kritika', all: true, paused: false }),
  );
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  await act(async () => root.render(React.createElement(NekoFriends)));
  expect(document.querySelectorAll('.neko-companion').length).toBe(1);
  await act(async () =>
    document
      .getElementById('neko-kritika')
      .dispatchEvent(
        new win.MouseEvent('contextmenu', { bubbles: true, cancelable: true }),
      ),
  );
  expect(document.querySelector('.neko-picker').open).toBe(true);
  const manthan = [...document.querySelectorAll('.neko-option')].find((el) =>
    el.textContent.includes('Manthan'),
  );
  await act(async () => manthan.click());
  expect(document.querySelectorAll('.neko-companion').length).toBe(1);
  expect(document.querySelector('.neko-companion').id).toBe('neko-manthan');
  expect(
    JSON.parse(localStorage.getItem('morewithmanthan-companions-v1')).active,
  ).toBe('manthan');
  await act(async () =>
    window.dispatchEvent(new win.Event('neko-picker-open')),
  );
  expect(document.querySelector('.neko-picker').textContent).not.toContain(
    'Show all six',
  );
  expect(document.querySelectorAll('.neko-option').length).toBe(6);
  expect(document.querySelectorAll('.neko-companion').length).toBe(1);
  await act(async () => root.unmount());
  host.remove();
});

test('dragging parks a companion and suppresses the click that would open chat', async () => {
  localStorage.setItem(
    'morewithmanthan-companions-v1',
    '{"active":"kritika","all":false,"paused":true}',
  );
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  await act(async () => root.render(React.createElement(NekoFriends)));
  const cat = document.getElementById('neko-kritika');
  let chats = 0;
  const chat = () => chats++;
  window.addEventListener('kittu-open', chat);
  const x = parseFloat(cat.style.left),
    y = parseFloat(cat.style.top);
  await act(async () => {
    dispatch(cat, 'pointerdown', {
      clientX: x + 10,
      clientY: y + 10,
      pointerType: 'mouse',
    });
    dispatch(cat, 'pointermove', {
      clientX: 190,
      clientY: 210,
      pointerType: 'mouse',
    });
    dispatch(cat, 'pointerup', {
      clientX: 190,
      clientY: 210,
      pointerType: 'mouse',
    });
    cat.click();
  });
  expect(parseFloat(cat.style.left)).toBe(180);
  expect(parseFloat(cat.style.top)).toBe(200);
  expect(chats).toBe(0);
  await act(async () => {
    await wait(500);
    cat.click();
  });
  expect(chats).toBe(1);
  window.removeEventListener('kittu-open', chat);
  await act(async () => root.unmount());
  host.remove();
});

test('a touch hold opens the chooser, and movement cancels a hold', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  await act(async () => root.render(React.createElement(NekoFriends)));
  const cat = document.querySelector('.neko-companion');
  await act(async () => {
    dispatch(cat, 'pointerdown', {
      clientX: 100,
      clientY: 100,
      pointerType: 'touch',
    });
    await wait(600);
  });
  expect(document.querySelector('.neko-picker').open).toBe(true);
  await act(async () => {
    dispatch(cat, 'pointerup', {
      clientX: 100,
      clientY: 100,
      pointerType: 'touch',
    });
    document.querySelector('[aria-label="Close companion picker"]').click();
  });
  await act(async () => {
    dispatch(cat, 'pointerdown', {
      clientX: 100,
      clientY: 100,
      pointerType: 'touch',
    });
    dispatch(cat, 'pointermove', {
      clientX: 150,
      clientY: 150,
      pointerType: 'touch',
    });
    await wait(600);
    dispatch(cat, 'pointerup', {
      clientX: 150,
      clientY: 150,
      pointerType: 'touch',
    });
  });
  expect(document.querySelector('.neko-picker')).toBeNull();
  await act(async () => root.unmount());
  host.remove();
});

test('portfolio search filters destinations and opens a selected security tool', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  let selected = '';
  await act(async () =>
    root.render(
      React.createElement(CommandPalette, {
        onClose: () => {},
        onLab: (tab) => (selected = tab),
      }),
    ),
  );
  const input = document.querySelector('.command-input input');
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      win.HTMLInputElement.prototype,
      'value',
    ).set.call(input, 'hash');
    input.dispatchEvent(new win.Event('input', { bubbles: true }));
  });
  expect(document.querySelectorAll('[role="option"]').length).toBe(1);
  await act(async () =>
    input.dispatchEvent(
      new win.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    ),
  );
  expect(selected).toBe('hash');
  await act(async () => root.unmount());
  host.remove();
});

test('CTF abbreviation finds the challenge from search', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  let selected = '';
  await act(async () =>
    root.render(
      React.createElement(CommandPalette, {
        onClose: () => {},
        onLab: (tab) => (selected = tab),
      }),
    ),
  );
  const input = document.querySelector('.command-input input');
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      win.HTMLInputElement.prototype,
      'value',
    ).set.call(input, 'CTF');
    input.dispatchEvent(new win.Event('input', { bubbles: true }));
  });
  const choices = [...document.querySelectorAll('[role="option"]')];
  expect(choices.length).toBe(1);
  await act(async () => choices[0].click());
  expect(selected).toBe('ctf');
  await act(async () => root.unmount());
  host.remove();
});

test('the chat resume event clears the saved pause preference', async () => {
  localStorage.setItem(
    'morewithmanthan-companions-v1',
    '{"active":"kritika","all":false,"paused":true}',
  );
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  await act(async () => root.render(React.createElement(NekoFriends)));
  await act(async () => window.dispatchEvent(new win.Event('kittu-roam')));
  expect(
    JSON.parse(localStorage.getItem('morewithmanthan-companions-v1')).paused,
  ).toBe(false);
  await act(async () => root.unmount());
  host.remove();
});

test('Manthan uses distinct walking frames and changes direction while moving', async () => {
  localStorage.setItem(
    'morewithmanthan-companions-v1',
    JSON.stringify({ active: 'manthan', paused: false }),
  );
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  await act(async () => root.render(React.createElement(NekoFriends)));
  const sprite = host.querySelector('.neko-human');
  expect(sprite.tagName).toBe('SPAN');
  await act(async () => {
    dispatch(window, 'pointermove', {
      clientX: 1000,
      clientY: 140,
      pointerType: 'mouse',
    });
    await wait(120);
  });
  const first = sprite.style.backgroundPosition;
  await act(async () => {
    await wait(120);
  });
  expect(sprite.style.backgroundPosition).not.toBe(first);
  expect(sprite.dataset.motion).toBe('walk');
  await act(async () => {
    dispatch(window, 'pointermove', {
      clientX: 0,
      clientY: 180,
      pointerType: 'mouse',
    });
    await wait(120);
  });
  expect(sprite.style.transform).toBe('scaleX(-1)');
  await act(async () => root.unmount());
  host.remove();
});

test('Manthan resumes following after selection transfers focus to him', async () => {
  localStorage.setItem(
    'morewithmanthan-companions-v1',
    JSON.stringify({ active: 'kritika', paused: false }),
  );
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(React.createElement(NekoFriends)));
    await act(async () =>
      window.dispatchEvent(new win.Event('neko-picker-open')),
    );
    await act(async () =>
      [...host.querySelectorAll('.neko-option')]
        .find((el) => el.textContent.includes('Manthan'))
        .click(),
    );
    await act(async () => {
      await wait(20);
    });
    const pet = host.querySelector('#neko-manthan');
    expect(document.activeElement).toBe(pet);
    const start = parseFloat(pet.style.left);
    await act(async () => {
      dispatch(window, 'pointermove', {
        clientX: 1000,
        clientY: 250,
        pointerType: 'mouse',
      });
      await wait(220);
    });
    expect(parseFloat(pet.style.left)).toBeGreaterThan(start);
    expect(pet.querySelector('.neko-human').dataset.motion).toBe('walk');
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});

test('Manthan stops walking after reaching the viewport edge', async () => {
  localStorage.setItem(
    'morewithmanthan-companions-v1',
    JSON.stringify({ active: 'manthan', paused: false }),
  );
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(React.createElement(NekoFriends)));
    await act(async () => {
      dispatch(window, 'pointermove', {
        clientX: 0,
        clientY: 0,
        pointerType: 'mouse',
      });
      await wait(3400);
    });
    expect(host.querySelector('.neko-human').dataset.motion).toBe('idle');
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});

test('Spotify row stays hidden without data and links the real returned song', async () => {
  const { default: SpotifyLastPlayed } = await import(
    '../src/components/portfolio/SpotifyLastPlayed.tsx'
  );
  const originalFetch = globalThis.fetch;
  let payload = { track: null };
  globalThis.fetch = async () => Response.json(payload);
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => {
      root.render(React.createElement(SpotifyLastPlayed));
      await wait(20);
    });
    expect(host.querySelector('.spotify-last-played')).toBeNull();
    payload = {
      track: {
        title: 'Fixture song',
        artists: 'Fixture artist',
        url: 'https://open.spotify.com/track/fixture',
      },
    };
    await act(async () => {
      document.dispatchEvent(new win.Event('visibilitychange'));
      await wait(20);
    });
    expect(host.textContent).toContain('Last played');
    expect(host.textContent).toContain('Fixture song');
    expect(host.querySelector('a').href).toBe(
      'https://open.spotify.com/track/fixture',
    );
  } finally {
    await act(async () => root.unmount());
    host.remove();
    globalThis.fetch = originalFetch;
  }
});
