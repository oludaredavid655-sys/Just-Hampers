(function () {
  const seenKey = 'just-hampers-intro-seen';
  const navigationType = performance.getEntriesByType('navigation')[0]?.type;
  try {
    if (sessionStorage.getItem(seenKey) && navigationType !== 'reload') return;
    sessionStorage.setItem(seenKey, 'true');
  } catch {
    // Continue with the intro if session storage is unavailable.
  }

  const dialog = document.createElement('dialog');
  dialog.className = 'site-preloader';
  dialog.setAttribute('aria-labelledby', 'preloader-title');
  dialog.innerHTML = `
    <div class="preloader-content">
      <p class="preloader-overline">A THOUGHTFUL GIFTING HOUSE</p>
      <img class="preloader-logo" src="justhamperlogo.jpeg" alt="Just Hampers">
      <h1 id="preloader-title">Just Hampers</h1>
      <p class="preloader-tagline">A little joy, all wrapped up.</p>
      <div class="preloader-progress" aria-hidden="true"><span></span></div>
      <div class="preloader-actions">
        <button class="preloader-music" type="button" aria-pressed="false">Enable welcome music</button>
        <button class="preloader-enter" type="button">Enter site <span aria-hidden="true">→</span></button>
      </div>
      <p class="preloader-hint" aria-live="polite">Your thoughtful moment is almost ready.</p>
    </div>
  `;
  document.body.prepend(dialog);

  const musicButton = dialog.querySelector('.preloader-music');
  const enterButton = dialog.querySelector('.preloader-enter');
  const hint = dialog.querySelector('.preloader-hint');
  let audioContext = null;
  let musicTimer = null;
  let dismissed = false;

  function playPhrase() {
    if (!audioContext || audioContext.state !== 'running') return;
    const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 783.99];
    const start = audioContext.currentTime + 0.03;

    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const volume = audioContext.createGain();
      const noteStart = start + index * 0.3;
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      volume.gain.setValueAtTime(0.0001, noteStart);
      volume.gain.exponentialRampToValueAtTime(0.035, noteStart + 0.025);
      volume.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.25);
      oscillator.connect(volume);
      volume.connect(audioContext.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + 0.27);
    });
  }

  async function stopMusic() {
    window.clearInterval(musicTimer);
    musicTimer = null;
    musicButton.setAttribute('aria-pressed', 'false');
    musicButton.textContent = 'Enable welcome music';
    if (audioContext) {
      const context = audioContext;
      audioContext = null;
      await context.close().catch(() => {});
    }
  }

  async function closeIntro() {
    if (dismissed) return;
    dismissed = true;
    window.clearTimeout(autoCloseTimer);
    try {
      sessionStorage.setItem(seenKey, 'true');
    } catch {
      // The intro still closes when session storage is unavailable.
    }
    await stopMusic();
    if (dialog.open) dialog.close();
    dialog.remove();
  }

  async function startMusic(fromUserGesture) {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) {
      musicButton.disabled = true;
      hint.textContent = 'Welcome music is unavailable in this browser.';
      return;
    }

    try {
      audioContext = new AudioContextConstructor();
      const resumePromise = audioContext.resume();
      if (!fromUserGesture && audioContext.state !== 'running') {
        resumePromise.catch(() => {});
        await stopMusic();
        hint.textContent = 'Your browser needs a tap before it can play sound.';
        return;
      }
      await resumePromise;
      if (!audioContext || audioContext.state !== 'running') throw new Error('Audio is not running.');
      musicButton.setAttribute('aria-pressed', 'true');
      musicButton.textContent = 'Turn music off';
      hint.textContent = 'Welcome music is playing.';
      playPhrase();
      musicTimer = window.setInterval(playPhrase, 3400);
    } catch {
      await stopMusic();
      hint.textContent = fromUserGesture
        ? 'Welcome music could not start.'
        : 'Your browser needs a tap before it can play sound.';
    }
  }

  musicButton.addEventListener('click', async () => {
    if (audioContext) {
      await stopMusic();
      hint.textContent = 'Welcome music is off.';
      return;
    }
    await startMusic(true);
  });

  enterButton.addEventListener('click', closeIntro);
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeIntro();
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeIntro();
  });

  dialog.showModal();
  startMusic(false);
  const autoCloseTimer = window.setTimeout(closeIntro, 2600);
})();