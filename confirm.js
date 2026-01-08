// Simple script for email confirmation page
// Just shows success message, no deep linking needed
(function () {
  console.log('Email confirmation page loaded');

  // Optional: Parse URL to show user email if available
  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(
    window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
  );

  const getParam = (key) => {
    return searchParams.get(key) || hashParams.get(key);
  };

  const email = getParam('email') || getParam('user_email');

  if (email) {
    const statusSubtext = document.getElementById('statusSubtext');
    if (statusSubtext) {
      statusSubtext.textContent = `Email confirmed for ${email}. You can now sign in.`;
    }
  }
})();
