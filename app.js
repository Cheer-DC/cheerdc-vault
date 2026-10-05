/**
 * ==============================================================================
 * CHEER DC - APPLICATION LOGIC
 * ==============================================================================
 * Minimalist reference list for Motion Drills, Cheers, Dances, and Stunts.
 * Supports both Video Tutorials (with slow-mo playback) and Text/Count popups.
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof CHEER_DC_DATA === 'undefined') {
    console.error('CHEER_DC_DATA not found. Please ensure data.js is loaded.');
    return;
  }

  initCategoryPills();
  initSearch();
  initNavigation();
  initModal();
  renderReferenceList();
});

let currentCategory = 'all';
let searchQuery = '';
let activeModalItemId = null;

const SECTION_ICONS = {
  zap: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
  mic: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>`,
  music: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>`,
  shield: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`
};

/**
 * Initialize Category Filter Pills
 */
function initCategoryPills() {
  const container = document.getElementById('category-pills');
  if (!container) return;

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.pill-btn');
    if (!btn) return;
    setCategory(btn.dataset.category);
  });
}

/**
 * Set active category across pills, desktop nav, and mobile nav
 */
function setCategory(catId) {
  currentCategory = catId;

  // Update Category Pills
  document.querySelectorAll('#category-pills .pill-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.category === catId);
  });

  // Update Desktop Nav
  document.querySelectorAll('#desktop-nav-links .nav-link[data-category]').forEach(b => {
    b.classList.toggle('active', b.dataset.category === catId);
  });

  // Update Mobile Nav
  document.querySelectorAll('#mobile-bottom-nav .bottom-nav-item[data-category]').forEach(b => {
    b.classList.toggle('active', b.dataset.category === catId);
  });

  renderReferenceList();
}

/**
 * Initialize Navigation Click Handlers
 */
function initNavigation() {
  // Desktop navigation
  const desktopContainer = document.getElementById('desktop-nav-links');
  if (desktopContainer) {
    desktopContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.nav-link[data-category]');
      if (!btn) return;
      setCategory(btn.dataset.category);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Mobile bottom navigation
  const mobileContainer = document.getElementById('mobile-bottom-nav');
  if (mobileContainer) {
    mobileContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.bottom-nav-item[data-category]');
      if (!btn) return;
      setCategory(btn.dataset.category);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/**
 * Initialize Search
 */
function initSearch() {
  const searchInput = document.getElementById('global-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderReferenceList();
  });
}

/**
 * Render Minimalist Reference List
 */
function renderReferenceList() {
  const container = document.getElementById('reference-list-container');
  const countEl = document.getElementById('results-count');
  if (!container) return;

  let totalVisibleItems = 0;
  const sectionsHtml = [];

  CHEER_DC_DATA.sections.forEach(section => {
    // If filtering by specific category and this isn't it, skip
    if (currentCategory !== 'all' && section.id !== currentCategory) {
      return;
    }

    // Filter items in section
    const filteredItems = section.items.filter(item => {
      if (!searchQuery) return true;
      return item.title.toLowerCase().includes(searchQuery) ||
             item.detail.toLowerCase().includes(searchQuery) ||
             (item.text && item.text.toLowerCase().includes(searchQuery));
    });

    const iconSvg = SECTION_ICONS[section.icon] || '';

    // If section has no items
    if (filteredItems.length === 0) {
      if (!searchQuery) {
        sectionsHtml.push(`
          <section class="list-section" id="section-${section.id}">
            <div class="list-section-header">
              <h2 class="list-section-title">
                ${iconSvg}
                ${escapeHTML(section.title)}
              </h2>
              <span class="list-section-count">0 items</span>
            </div>
            <div class="list-items-table">
              <div class="empty-section-hint">No items added to this section yet.</div>
            </div>
          </section>
        `);
      }
      return;
    }

    totalVisibleItems += filteredItems.length;

    const itemsRows = filteredItems.map(item => {
      const isTextItem = Boolean(item.text);

      return `
        <div class="list-item-row" data-id="${item.id}">
          <div class="item-info">
            <div class="item-title">${escapeHTML(item.title)}</div>
            <div class="item-detail">${escapeHTML(item.detail)}</div>
          </div>
          <div class="item-actions">
            ${isTextItem ? `
              <button class="btn btn-primary btn-open-item" data-id="${item.id}" aria-label="View counts for ${escapeHTML(item.title)}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                View Counts
              </button>
            ` : `
              <button class="btn btn-primary btn-open-item" data-id="${item.id}" aria-label="Watch video for ${escapeHTML(item.title)}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Watch Video
              </button>
              ${item.videoUrl ? `
                <a href="${escapeHTML(item.videoUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" title="Open in new tab (YouTube / Drive)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </a>
              ` : ''}
            `}
          </div>
        </div>
      `;
    }).join('');

    sectionsHtml.push(`
      <section class="list-section" id="section-${section.id}">
        <div class="list-section-header">
          <h2 class="list-section-title">
            ${iconSvg}
            ${escapeHTML(section.title)}
          </h2>
          <span class="list-section-count">${filteredItems.length} item${filteredItems.length === 1 ? '' : 's'}</span>
        </div>
        <div class="list-items-table">
          ${itemsRows}
        </div>
      </section>
    `);
  });

  // Update Status Count
  if (countEl) {
    if (searchQuery) {
      countEl.textContent = `Found ${totalVisibleItems} result${totalVisibleItems === 1 ? '' : 's'} matching "${searchQuery}"`;
    } else {
      countEl.textContent = `Showing ${totalVisibleItems} item${totalVisibleItems === 1 ? '' : 's'}`;
    }
  }

  // Handle empty state across search
  if (totalVisibleItems === 0 && searchQuery) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto 0.5rem auto; display:block; opacity:0.6;">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <h3>No matching material found</h3>
        <p>Try searching for a different motion, chant, or count.</p>
        <button class="btn btn-outline" style="margin-top:0.75rem;" onclick="document.getElementById('global-search').value=''; searchQuery=''; setCategory('all');">
          Clear Filter & Show All
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = sectionsHtml.join('');

  // Attach click listeners to open modal buttons
  container.querySelectorAll('.btn-open-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.id;
      let foundItem = null;
      let foundSection = null;

      for (const sec of CHEER_DC_DATA.sections) {
        const item = sec.items.find(i => i.id === itemId);
        if (item) {
          foundItem = item;
          foundSection = sec;
          break;
        }
      }

      if (foundItem) {
        openModal(foundItem, foundSection);
      }
    });
  });
}

/**
 * Modal & Speed Playback Controls / Text Viewer
 */
let currentVideoElement = null;
let currentIframeElement = null;

function initModal() {
  const backdrop = document.getElementById('video-modal');
  const closeBtn = document.getElementById('close-modal-btn');
  if (!backdrop || !closeBtn) return;

  const closeModal = () => {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
    
    // Stop video / remove source
    const target = document.getElementById('modal-video-target');
    if (target) {
      target.innerHTML = '';
      target.className = 'video-player-container';
    }
    currentVideoElement = null;
    currentIframeElement = null;
    activeModalItemId = null;
  };

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('open')) {
      closeModal();
    }
  });

  // Speed Playback Buttons (0.5x, 0.75x, 1x, 1.25x)
  const speedContainer = document.getElementById('speed-controls-row');
  if (speedContainer) {
    speedContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.speed-btn');
      if (!btn) return;

      const rate = parseFloat(btn.dataset.speed);
      speedContainer.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      setPlaybackRate(rate);
    });
  }
}

function openModal(item, section) {
  const backdrop = document.getElementById('video-modal');
  const target = document.getElementById('modal-video-target');
  const titleEl = document.getElementById('modal-video-title');
  const badgeEl = document.getElementById('modal-category-badge');
  const externalLinkEl = document.getElementById('modal-external-link');
  const speedContainer = document.getElementById('speed-controls-row');
  const playbackControls = document.getElementById('modal-playback-controls');

  if (!backdrop || !target) return;

  activeModalItemId = item.id;
  titleEl.textContent = item.title;

  if (badgeEl && section) {
    badgeEl.textContent = section.title;
  }

  // Check if item is text-based (e.g. Stunt Counts) or video-based
  if (item.text) {
    // Hide video-specific controls
    if (externalLinkEl) externalLinkEl.style.display = 'none';
    if (playbackControls) playbackControls.style.display = 'none';

    // Render Text Card inside Modal with Cornero styling
    target.className = 'modal-text-container';
    target.innerHTML = `
      <div class="modal-text-display">${escapeHTML(item.text)}</div>
    `;

    currentVideoElement = null;
    currentIframeElement = null;
  } else {
    // Show video playback controls
    if (playbackControls) playbackControls.style.display = 'flex';
    if (externalLinkEl) {
      externalLinkEl.style.display = 'inline-flex';
      externalLinkEl.href = item.videoUrl || '#';
    }

    // Reset speed buttons to 1x
    if (speedContainer) {
      speedContainer.querySelectorAll('.speed-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.speed === '1');
      });
    }

    target.className = 'video-player-container';

    // Embed video based on URL
    let embedHtml = '';
    const url = item.videoUrl || '';

    if (url.endsWith('.mp4') || url.endsWith('.webm')) {
      embedHtml = `
        <video id="active-html5-video" controls playsinline autoplay style="width:100%; height:100%; object-fit:contain;">
          <source src="${escapeHTML(url)}" type="video/mp4">
          Your browser does not support HTML5 video.
        </video>
      `;
    } else {
      let embedSrc = url;
      if (url.includes('youtube.com/watch?v=')) {
        const vidId = url.split('v=')[1]?.split('&')[0];
        embedSrc = `https://www.youtube.com/embed/${vidId}?autoplay=1&enablejsapi=1&rel=0`;
      } else if (url.includes('youtu.be/')) {
        const vidId = url.split('youtu.be/')[1]?.split('?')[0];
        embedSrc = `https://www.youtube.com/embed/${vidId}?autoplay=1&enablejsapi=1&rel=0`;
      } else if (url.includes('youtube.com/shorts/')) {
        const vidId = url.split('shorts/')[1]?.split('?')[0];
        embedSrc = `https://www.youtube.com/embed/${vidId}?autoplay=1&enablejsapi=1&rel=0`;
      } else if (url.includes('drive.google.com')) {
        embedSrc = url.replace(/\/view(\?.*)?$/, '/preview');
        if (!embedSrc.includes('/preview')) {
          embedSrc = embedSrc.replace(/\/edit(\?.*)?$/, '/preview');
        }
      } else if (url.includes('vimeo.com/')) {
        const vimeoId = url.split('vimeo.com/')[1]?.split('?')[0];
        embedSrc = `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
      } else if (!url.includes('enablejsapi=1') && url.includes('youtube.com/embed/')) {
        embedSrc += (url.includes('?') ? '&' : '?') + 'autoplay=1&enablejsapi=1&rel=0';
      }

      embedHtml = `
        <iframe 
          id="active-iframe-video"
          src="${escapeHTML(embedSrc)}" 
          title="${escapeHTML(item.title)}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen>
        </iframe>
      `;
    }

    target.innerHTML = embedHtml;
    currentVideoElement = document.getElementById('active-html5-video');
    currentIframeElement = document.getElementById('active-iframe-video');
  }

  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function setPlaybackRate(rate) {
  if (currentVideoElement) {
    currentVideoElement.playbackRate = rate;
  } else if (currentIframeElement) {
    try {
      currentIframeElement.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setPlaybackRate', args: [rate, true] }),
        '*'
      );
    } catch (err) {
      console.warn('Could not postMessage to iframe for playback rate:', err);
    }
  }
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
