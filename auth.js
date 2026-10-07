(function () {
  window.JustHampersSiteConfig = window.JustHampersSiteConfig || {};

  function getRuntimeSiteConfig() {
    return window.JustHampersSiteConfig || {};
  }

  function getSupabaseConfig() {
    const authConfig = getRuntimeSiteConfig().auth || {};
    const url = String(authConfig.supabaseUrl || authConfig.url || '').trim();
    const key = String(authConfig.supabasePublishableKey || authConfig.publishableKey || '').trim();
    return { url, key };
  }

  async function hydrateSiteConfig() {
    if (window.JustHampersSiteConfig && Object.keys(window.JustHampersSiteConfig).length) {
      return getRuntimeSiteConfig();
    }

    try {
      const response = await fetch('/api/site-config', { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) return getRuntimeSiteConfig();
      const payload = await response.json();
      if (payload && typeof payload === 'object') {
        window.JustHampersSiteConfig = payload;
      }
    } catch (error) {
      console.warn('Just Hampers could not load runtime site config.', error);
    }

    return getRuntimeSiteConfig();
  }

  let supabasePromise = null;
  let supabaseClient = null;
  let currentUser = null;
  let profileDialog = null;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[character]));
  }

  function readStoredUser() {
    return currentUser;
  }

  function mapSupabaseUser(user) {
    if (!user) return null;
    const metadata = user.user_metadata || {};
    const googleIdentity = user.identities?.find((identity) => identity.provider === 'google')?.identity_data || {};
    const givenName = metadata.given_name || googleIdentity.given_name || '';
    const familyName = metadata.family_name || googleIdentity.family_name || '';
    const name = (metadata.full_name || metadata.name || googleIdentity.full_name || googleIdentity.name || [givenName, familyName].filter(Boolean).join(' ')).trim();
    return {
      name,
      given_name: givenName || name.split(' ')[0] || '',
      family_name: familyName || name.split(' ').slice(1).join(' '),
      email: user.email || '',
      picture: metadata.avatar_url || metadata.picture || googleIdentity.avatar_url || googleIdentity.picture || '',
      sub: user.id
    };
  }

  function attachAvatarFallbacks(container) {
    container.querySelectorAll('[data-auth-avatar]').forEach((image) => {
      image.addEventListener('error', () => {
        const fallback = document.createElement('span');
        fallback.className = image.dataset.fallbackClass;
        fallback.setAttribute('aria-hidden', 'true');
        fallback.textContent = image.dataset.initial || 'G';
        image.replaceWith(fallback);
      }, { once: true });
    });
  }

  function setCurrentUser(user) {
    currentUser = mapSupabaseUser(user);
    renderAuthWidget();
    renderProfileCard();
    document.dispatchEvent(new CustomEvent('justHampers:auth-change', { detail: currentUser }));
  }

  async function refreshAuthUser() {
    if (!supabaseClient) return;

    const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
    if (!sessionError && sessionData?.session?.user) {
      setCurrentUser(sessionData.session.user);
      return;
    }

    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (!userError && userData?.user) {
      setCurrentUser(userData.user);
      return;
    }

    setCurrentUser(null);
  }

  async function initializeSupabase() {
    await hydrateSiteConfig();
    const { url, key } = getSupabaseConfig();
    if (!url || !key) {
      throw new Error('Supabase auth is not configured for this deployment.');
    }

    if (supabasePromise) return supabasePromise;

    supabasePromise = new Promise((resolve, reject) => {
      if (window.supabase?.createClient) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Supabase client failed to load.'));
      document.head.appendChild(script);
    }).then(async () => {
      if (!window.supabase?.createClient) throw new Error('Supabase client is unavailable.');
      supabaseClient = window.supabase.createClient(url, key);
      supabaseClient.auth.onAuthStateChange((_event, session) => {
        setCurrentUser(session?.user || null);
      });
      await refreshAuthUser();
      return supabaseClient;
    }).catch((error) => {
      supabasePromise = null;
      throw error;
    });

    return supabasePromise;
  }

  
    
  function getDisplayName(user) {
    if (!user) return 'Guest';
    const names = [user.given_name, user.family_name].filter(Boolean);
    if (user.name) return user.name;
    if (names.length) return names.join(' ');
    return 'Google user';
  }

  function getFirstName(user) {
    if (!user) return 'there';
    return user.given_name || user.name?.split(' ')[0] || 'there';
  }

  function renderAuthWidget() {
    const roots = document.querySelectorAll('[data-auth-root]');
    const user = readStoredUser();

    roots.forEach((root) => {
      if (user) {
        root.innerHTML = `
          <div class="auth-chip is-signed-in" aria-live="polite">
            <button class="auth-profile-trigger" type="button" data-auth-action="open-profile" aria-label="${escapeHtml(getDisplayName(user))} is signed in. Open profile.">
              ${user.picture ? `<img class="auth-avatar" data-auth-avatar data-fallback-class="auth-avatar auth-avatar-fallback" data-initial="${escapeHtml(getDisplayName(user).charAt(0).toUpperCase())}" src="${escapeHtml(user.picture)}" alt="">` : `<span class="auth-avatar auth-avatar-fallback" aria-hidden="true">${escapeHtml(getDisplayName(user).charAt(0).toUpperCase())}</span>`}
              <span class="auth-copy"><span>Signed in</span><strong>${escapeHtml(getDisplayName(user))}</strong></span>
            </button>
            <button class="auth-signout" type="button" data-auth-action="signout">Sign out</button>
          </div>
        `;
      } else {
        root.innerHTML = '<button class="auth-button" type="button" data-auth-action="open-profile"><span aria-hidden="true">G</span>Sign in with Google</button>';
      }
      attachAvatarFallbacks(root);
    });

    const welcomeTargets = document.querySelectorAll('[data-auth-welcome]');
    welcomeTargets.forEach((element) => {
      if (user) {
        element.textContent = `Welcome, ${getDisplayName(user)}`;
      } else {
        element.textContent = 'Welcome, guest';
      }
    });
  }

  function ensureProfileDialog() {
    if (profileDialog) return profileDialog;

    profileDialog = document.createElement('dialog');
    profileDialog.className = 'profile-dialog';
    profileDialog.setAttribute('aria-labelledby', 'profile-dialog-title');
    profileDialog.innerHTML = `
      <button class="profile-dialog-close" type="button" data-auth-action="close-profile" aria-label="Close profile">×</button>
      <div class="profile-dialog-content" data-profile-content></div>
    `;
    document.body.appendChild(profileDialog);
    return profileDialog;
  }

  function renderProfileCard(errorMessage = '') {
    if (!profileDialog?.open) return;

    const content = profileDialog.querySelector('[data-profile-content]');
    const user = readStoredUser();
    if (user) {
      content.innerHTML = `
        <img class="profile-brand-mark" src="justhamperlogo.jpeg" alt="Just Hampers logo">
        <p class="profile-card-eyebrow">JUST HAMPERS PROFILE</p>
        ${user.picture ? `<img class="profile-google-avatar" data-auth-avatar data-fallback-class="profile-google-avatar profile-avatar-fallback" data-initial="${escapeHtml(getDisplayName(user).charAt(0).toUpperCase())}" src="${escapeHtml(user.picture)}" alt="${escapeHtml(getDisplayName(user))} Google profile picture">` : `<span class="profile-google-avatar profile-avatar-fallback" aria-hidden="true">${escapeHtml(getDisplayName(user).charAt(0).toUpperCase())}</span>`}
        <h2 id="profile-dialog-title">${escapeHtml(getDisplayName(user))}</h2>
        <p class="profile-card-copy" role="status">Signed in successfully with Google.</p>
        <button class="profile-signout-button" type="button" data-auth-action="signout">Sign out</button>
      `;
      attachAvatarFallbacks(content);
      return;
    }

    content.innerHTML = `
      <img class="profile-brand-mark" src="justhamperlogo.jpeg" alt="Just Hampers logo">
      <p class="profile-card-eyebrow">YOUR JUST HAMPERS PROFILE</p>
      <h2 id="profile-dialog-title">Sign in with Google</h2>
      <p class="profile-card-copy">Use your Google account to save your profile and continue with your hamper.</p>
      <button class="auth-button" type="button" data-auth-action="signin"><span aria-hidden="true">G</span>Continue with Google</button>
      <p class="profile-card-status" data-profile-status role="status" aria-live="polite">${escapeHtml(errorMessage || 'Your Google account will open securely.')}</p>
    `;
  }

  async function signInWithGoogle() {
    const dialog = ensureProfileDialog();
    if (!dialog.open) dialog.showModal();
    renderProfileCard();

    try {
      await initializeSupabase();
      await refreshAuthUser();
      renderProfileCard();
    } catch (error) {
      renderProfileCard('Google sign-in is not configured for this deployment. Add your Supabase auth keys and try again.');
    }
  }

  async function startGoogleSignIn() {
    try {
      const client = await initializeSupabase();
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google sign-in error:', error);
      renderProfileCard('Google sign-in could not start. Please try again.');
    }
  }

  async function signOut() {
    if (supabaseClient) {
      const { error } = await supabaseClient.auth.signOut();
      if (error) console.warn('Just Hampers could not sign out from Supabase.', error);
    }
    setCurrentUser(null);
  }

  document.addEventListener('click', (event) => {
    const actionTarget = event.target.closest('[data-auth-action]');
    if (!actionTarget) return;

    const action = actionTarget.dataset.authAction;
    if (action === 'signin') startGoogleSignIn();
    if (action === 'open-profile') signInWithGoogle();
    if (action === 'close-profile') profileDialog?.close();
    if (action === 'signout') signOut();
  });

  renderAuthWidget();
  initializeSupabase().catch((error) => console.warn('Just Hampers could not initialize Supabase auth.', error));
  window.addEventListener('pageshow', () => {
    initializeSupabase().then(() => refreshAuthUser()).catch((error) => console.warn('Just Hampers could not refresh auth state.', error));
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((error) => {
        console.warn('Just Hampers could not register the service worker.', error);
      });
    });
  }

  window.JustHampersAuth = {
    getCurrentUser: readStoredUser,
    isSignedIn: () => Boolean(readStoredUser()),
    getDisplayName,
    getFirstName,
    renderAuthWidget,
    signInWithGoogle,
    signOut,
    initializeSupabase
  };
})();
