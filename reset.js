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

  const state = parseResetState();

  if (!state.isRecoveryLink) {
    finishWithError(
      'This link is not a password reset link.',
      `We received type “${state.linkType}”. Please request a new reset email from AuraBean.`
    );
    return;
  }

  if (!state.code) {
    finishWithError(
      'We could not read your reset code.',
      'Copy the entire URL from this tab and send it to AuraBean support so we can investigate.'
    );
    return;
  }

  showCode(state);
  openAppButtonEl.classList.remove('hidden');
  openAppButtonEl.addEventListener('click', () => {
    statusTextEl.textContent = 'Trying to open AuraBean…';
    statusSubtextEl.textContent = 'Return to this tab if the app does not pick up the code.';
    launchApp(state.code);
  });

  statusTextEl.textContent = 'Reset link verified.';
  statusSubtextEl.textContent = 'If AuraBean stays closed, tap “Open AuraBean” below.';
  stopSpinner();

  window.setTimeout(() => launchApp(state.code), AUTO_OPEN_DELAY);
  window.setTimeout(() => {
    statusSubtextEl.textContent = 'Tap “Open AuraBean” if nothing happened automatically.';
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

    const code = getFirst(['code', 'token_hash', 'access_token', 'recovery_token']);
    const email = getFirst(['email', 'user_email', 'email_address']);
    const linkType = (getFirst(['type', 'event_type']) || 'recovery').toLowerCase();

    return {
      code,
      email,
      linkType,
      isRecoveryLink: linkType === 'recovery',
    };
  }

  function showCode({ code, email }) {
    codeCardEl.classList.remove('hidden');
    codeValueEl.textContent = code;
    copyButtonEl.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code);
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
      emailHintEl.textContent = `We detected this link belongs to ${email}.`;
    } else {
      emailHintEl.textContent = '';
    }
  }

  function launchApp(code) {
    const target = `${APP_SCHEME_URL}?code=${encodeURIComponent(code)}`;
    window.location.assign(target);
  }

  function finishWithError(message, subtext) {
    stopSpinner();
    statusTextEl.textContent = message;
    statusSubtextEl.textContent = subtext;
    codeCardEl.classList.add('hidden');
    openAppButtonEl.classList.add('hidden');
  }

  function stopSpinner() {
    if (spinnerEl) {
      spinnerEl.classList.add('hidden');
    }
  }
})();
