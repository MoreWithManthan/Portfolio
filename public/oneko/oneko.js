// oneko.js: https://github.com/adryd325/oneko.js

(function oneko() {
  const isReducedMotion =
    window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

  if (document.getElementById('oneko')) return;

  const nekoEl = document.createElement('button');
  const spriteEl = document.createElement('span');

  let nekoPosX = window.innerWidth - 64;
  let nekoPosY = window.innerHeight - 92;

  let mousePosX = nekoPosX;
  let mousePosY = nekoPosY;

  let dragging = false,
    hovered = false,
    parked = false,
    chatOpen = false;
  let startX = 0,
    startY = 0,
    offsetX = 0,
    offsetY = 0,
    moved = false;
  let suppressClickUntil = 0;
  function updatePosition() {
    nekoPosX = Math.min(
      Math.max(24, nekoPosX),
      Math.max(24, window.innerWidth - 24),
    );
    nekoPosY = Math.min(
      Math.max(24, nekoPosY),
      Math.max(24, window.innerHeight - 48),
    );
    nekoEl.style.left = `${nekoPosX - 22}px`;
    nekoEl.style.top = `${nekoPosY - 22}px`;
  }
  let frameCount = 0;
  let idleTime = 0;
  let idleAnimation = null;
  let idleAnimationFrame = 0;

  const nekoSpeed = 10;
  const spriteSets = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratchSelf: [
      [-5, 0],
      [-6, 0],
      [-7, 0],
    ],
    scratchWallN: [
      [0, 0],
      [0, -1],
    ],
    scratchWallS: [
      [-7, -1],
      [-6, -2],
    ],
    scratchWallE: [
      [-2, -2],
      [-2, -3],
    ],
    scratchWallW: [
      [-4, 0],
      [-4, -1],
    ],
    tired: [[-3, -2]],
    sleeping: [
      [-2, 0],
      [-2, -1],
    ],
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

  function init() {
    nekoEl.id = 'oneko';
    nekoEl.type = 'button';
    nekoEl.className = 'kittu-cat';
    nekoEl.setAttribute(
      'aria-label',
      'Kittu, your CTF guide. Click to chat. Drag or use arrow keys to move.',
    );
    nekoEl.setAttribute('aria-haspopup', 'dialog');
    nekoEl.title = 'Kittu · click to chat, drag to move';
    spriteEl.className = 'kittu-sprite';
    spriteEl.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.className = 'kittu-name';
    label.textContent = 'Kittu';
    label.setAttribute('aria-hidden', 'true');
    nekoEl.appendChild(spriteEl);
    nekoEl.appendChild(label);
    updatePosition();

    let nekoFile = '/oneko/oneko.gif';
    const curScript = document.currentScript;
    if (curScript && curScript.dataset.cat) {
      nekoFile = curScript.dataset.cat;
    }
    spriteEl.style.backgroundImage = `url(${nekoFile})`;

    document.body.appendChild(nekoEl);

    document.addEventListener('pointermove', function (event) {
      if (dragging || event.pointerType === 'touch') return;
      mousePosX = event.clientX;
      mousePosY = event.clientY;
    });
    nekoEl.addEventListener('pointerenter', () => {
      hovered = true;
    });
    nekoEl.addEventListener('pointerleave', () => {
      hovered = false;
    });
    nekoEl.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      dragging = true;
      moved = false;
      startX = event.clientX;
      startY = event.clientY;
      offsetX = nekoPosX - startX;
      offsetY = nekoPosY - startY;
      nekoEl.setPointerCapture(event.pointerId);
      nekoEl.classList.add('dragging');
      setSprite('alert', 0);
    });
    nekoEl.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      if (Math.hypot(event.clientX - startX, event.clientY - startY) > 5)
        moved = true;
      if (moved) {
        nekoPosX = event.clientX + offsetX;
        nekoPosY = event.clientY + offsetY;
        updatePosition();
      }
    });
    function finishDrag(event) {
      if (!dragging) return;
      dragging = false;
      nekoEl.classList.remove('dragging');
      if (nekoEl.hasPointerCapture(event.pointerId))
        nekoEl.releasePointerCapture(event.pointerId);
      if (moved) {
        parked = true;
        suppressClickUntil = performance.now() + 400;
      }
      mousePosX = nekoPosX;
      mousePosY = nekoPosY;
      setSprite('idle', 0);
    }
    nekoEl.addEventListener('pointerup', finishDrag);
    nekoEl.addEventListener('pointercancel', finishDrag);
    nekoEl.addEventListener('lostpointercapture', finishDrag);
    nekoEl.addEventListener('click', (event) => {
      if (performance.now() < suppressClickUntil) {
        event.preventDefault();
        return;
      }
      window.dispatchEvent(new Event('kittu-open'));
    });
    nekoEl.addEventListener('keydown', (event) => {
      const steps = {
        ArrowLeft: [-16, 0],
        ArrowRight: [16, 0],
        ArrowUp: [0, -16],
        ArrowDown: [0, 16],
      };
      if (!steps[event.key]) return;
      event.preventDefault();
      parked = true;
      nekoPosX += steps[event.key][0];
      nekoPosY += steps[event.key][1];
      updatePosition();
    });
    window.addEventListener('resize', updatePosition);
    window.addEventListener('kittu-chat-state', (event) => {
      chatOpen = !!event.detail.open;
      nekoEl.setAttribute('aria-expanded', String(chatOpen));
    });
    window.addEventListener('kittu-roam', () => {
      parked = false;
      hovered = false;
      idleTime = 0;
      mousePosX = window.innerWidth / 2;
      mousePosY = window.innerHeight / 2;
    });
    setSprite('idle', 0);

    if (isReducedMotion) {
      setSprite('idle', 0);
      return;
    }
    window.requestAnimationFrame(onAnimationFrame);
  }

  let lastFrameTimestamp;

  function onAnimationFrame(timestamp) {
    // Stops execution if the neko element is removed from DOM
    if (!nekoEl.isConnected) {
      return;
    }
    if (!lastFrameTimestamp) {
      lastFrameTimestamp = timestamp;
    }
    if (timestamp - lastFrameTimestamp > 100) {
      lastFrameTimestamp = timestamp;
      frame();
    }
    window.requestAnimationFrame(onAnimationFrame);
  }

  function setSprite(name, frame) {
    const sprite = spriteSets[name][frame % spriteSets[name].length];
    spriteEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
  }

  function resetIdleAnimation() {
    idleAnimation = null;
    idleAnimationFrame = 0;
  }

  function idle() {
    idleTime += 1;

    // every ~ 20 seconds
    if (
      idleTime > 10 &&
      Math.floor(Math.random() * 200) == 0 &&
      idleAnimation == null
    ) {
      let avalibleIdleAnimations = ['sleeping', 'scratchSelf'];
      if (nekoPosX < 32) {
        avalibleIdleAnimations.push('scratchWallW');
      }
      if (nekoPosY < 32) {
        avalibleIdleAnimations.push('scratchWallN');
      }
      if (nekoPosX > window.innerWidth - 32) {
        avalibleIdleAnimations.push('scratchWallE');
      }
      if (nekoPosY > window.innerHeight - 32) {
        avalibleIdleAnimations.push('scratchWallS');
      }
      idleAnimation =
        avalibleIdleAnimations[
          Math.floor(Math.random() * avalibleIdleAnimations.length)
        ];
    }

    switch (idleAnimation) {
      case 'sleeping':
        if (idleAnimationFrame < 8) {
          setSprite('tired', 0);
          break;
        }
        setSprite('sleeping', Math.floor(idleAnimationFrame / 4));
        if (idleAnimationFrame > 192) {
          resetIdleAnimation();
        }
        break;
      case 'scratchWallN':
      case 'scratchWallS':
      case 'scratchWallE':
      case 'scratchWallW':
      case 'scratchSelf':
        setSprite(idleAnimation, idleAnimationFrame);
        if (idleAnimationFrame > 9) {
          resetIdleAnimation();
        }
        break;
      default:
        setSprite('idle', 0);
        return;
    }
    idleAnimationFrame += 1;
  }

  function frame() {
    if (
      dragging ||
      hovered ||
      parked ||
      chatOpen ||
      document.activeElement === nekoEl
    ) {
      if (!dragging) idle();
      return;
    }
    frameCount += 1;
    if (
      window.matchMedia('(pointer: coarse)').matches &&
      frameCount % 70 === 0
    ) {
      mousePosX = 32 + Math.random() * Math.max(1, window.innerWidth - 64);
      mousePosY = 100 + Math.random() * Math.max(1, window.innerHeight - 150);
    }
    const diffX = nekoPosX - mousePosX;
    const diffY = nekoPosY - mousePosY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (distance < nekoSpeed || distance < 48) {
      idle();
      return;
    }

    idleAnimation = null;
    idleAnimationFrame = 0;

    if (idleTime > 1) {
      setSprite('alert', 0);
      // count down after being alerted before moving
      idleTime = Math.min(idleTime, 7);
      idleTime -= 1;
      return;
    }

    let direction;
    direction = diffY / distance > 0.5 ? 'N' : '';
    direction += diffY / distance < -0.5 ? 'S' : '';
    direction += diffX / distance > 0.5 ? 'W' : '';
    direction += diffX / distance < -0.5 ? 'E' : '';
    setSprite(direction, frameCount);

    nekoPosX -= (diffX / distance) * nekoSpeed;
    nekoPosY -= (diffY / distance) * nekoSpeed;

    updatePosition();
  }

  init();
})();
