(function () {
  const APP_SCHEME_URL = 'aurabean://auth-reset';
  const AUTO_OPEN_DELAY = 800;
  const REMINDER_DELAY = 2200;

  const statusTextEl = document.getElementById('statusText');
  const statusSubtextEl = document.getElementById('statusSubtext');
  const codeCardEl = document.getElementById('codeCard');
  const codeValueEl = document.getElementById('codeValue');
  const copyButtonEl = document.getElementById('copyButton');
  const emailHintEl = document.getElementById('emailHint');
  const openAppButtonEl = document.getElementById('openAppButton');
  const spinnerEl = document.querySelector('.spinner');
  const statusBlockEl = document.getElementById('statusBlock');

  const state = parseResetState();

  // Validate we have reset credentials
  if (!(state.code || state.token || state.tokenHash || state.accessToken)) {
    finishWithError(
      'Could not read reset credentials.',
      'Copy the entire URL and contact support if you need help.'
    );
    return;
  }

  // Show the reset code
  showCode(state);
  openAppButtonEl.classList.remove('hidden');
  openAppButtonEl.addEventListener('click', () => {
    statusTextEl.textContent = 'Opening app…';
    statusSubtextEl.textContent = 'Return to this tab if the app does not open.';
    launchApp(state);
  });

  statusTextEl.textContent = 'Reset link verified.';
  statusSubtextEl.textContent = 'Opening the app automatically…';
  stopSpinner();

  // Try to open mobile app automatically
  window.setTimeout(() => launchApp(state), AUTO_OPEN_DELAY);
  window.setTimeout(() => {
    statusSubtextEl.textContent = 'Tap "Open App" below if nothing happened.';
  }, REMINDER_DELAY);

  function parseResetState() {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(
      window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
    );

    const getFirst = (keys) => {
      for (const params of [searchParams, hashParams]) {
        for (const key of keys) {
          const value = params.get(key);
          if (value) {
            return value;
          }
        }
      }
      return null;
    };

    const code = getFirst(['code']);
    const token = getFirst(['token', 'recovery_token']);
    const tokenHash = getFirst(['token_hash']);
    const accessToken = getFirst(['access_token']);
    const refreshToken = getFirst(['refresh_token']);
    const tokenType = getFirst(['token_type']);
    const expiresIn = getFirst(['expires_in']);
    const email = getFirst(['email', 'user_email', 'email_address']);

    return {
      code,
      tokenHash,
      token,
      email,
      accessToken,
      refreshToken,
      tokenType,
      expiresIn,
    };
  }

  function showCode({ tokenHash, code, token, email }) {
    codeCardEl.classList.remove('hidden');
    const displayCode = tokenHash || code || token || 'Unknown';
    codeValueEl.textContent = displayCode;
    copyButtonEl.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(displayCode);
        const original = copyButtonEl.textContent;
        copyButtonEl.textContent = 'Copied';
        copyButtonEl.disabled = true;
        window.setTimeout(() => {
          copyButtonEl.textContent = original;
          copyButtonEl.disabled = false;
        }, 1500);
      } catch {
        copyButtonEl.textContent = 'Copy manually';
      }
    });

    if (email) {
      emailHintEl.textContent = `For account: ${email}`;
    } else {
      emailHintEl.textContent = '';
    }
  }

  function launchApp({ code, token, email, tokenHash, accessToken, refreshToken, tokenType, expiresIn }) {
    const target = new URL(APP_SCHEME_URL);
    if (code) target.searchParams.set('code', code);
    if (token) target.searchParams.set('token', token);
    if (email) target.searchParams.set('email', email);
    if (tokenHash) target.searchParams.set('token_hash', tokenHash);
    if (accessToken) target.searchParams.set('access_token', accessToken);
    if (refreshToken) target.searchParams.set('refresh_token', refreshToken);
    if (tokenType) target.searchParams.set('token_type', tokenType);
    if (expiresIn) target.searchParams.set('expires_in', expiresIn);
    window.location.assign(target.toString());
  }

  function finishWithError(message, subtext) {
    stopSpinner();
    statusTextEl.textContent = message;
    statusSubtextEl.textContent = subtext;
    codeCardEl.classList.add('hidden');
    openAppButtonEl.classList.add('hidden');
    if (statusBlockEl) {
      statusBlockEl.classList.add('error');
    }
  }

  function stopSpinner() {
    if (spinnerEl) {
      spinnerEl.classList.add('hidden');
    }
  }
})();
