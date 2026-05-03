export function initLayout(overlay, titlebar, closeBtn, reopenBtn) {
  let isDragging = false;
  let isResizing = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let overlayStartLeft = null;
  let overlayStartTop = 0;
  let overlayStartWidth = 0;

  // Insert resize handle on the left edge
  const resizeHandle = document.createElement('div');
  resizeHandle.id = 'resize-handle';
  overlay.appendChild(resizeHandle);

  function isMobile() {
    return window.innerWidth <= 480;
  }

  function isDesktopOrTablet() {
    return window.innerWidth > 480;
  }

  function resetToDefault() {
    overlay.style.removeProperty('left');
    overlay.style.removeProperty('top');
    overlay.style.removeProperty('width');
    overlay.style.removeProperty('height');
    overlay.style.removeProperty('right');
  }

  // Dragging
  titlebar.addEventListener('mousedown', e => {
    if (!isDesktopOrTablet()) return;
    if (e.target === closeBtn) return;
    isDragging = true;

    const rect = overlay.getBoundingClientRect();
    dragStartX = e.clientX - rect.left;
    dragStartY = e.clientY - rect.top;
    overlayStartLeft = rect.left;
    overlayStartTop = rect.top;

    // Switch from right-anchored to left-anchored positioning
    overlay.style.right = 'auto';
    overlay.style.left = rect.left + 'px';
    overlay.style.top = rect.top + 'px';
    overlay.style.width = rect.width + 'px';

    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (isDragging) {
      const newLeft = e.clientX - dragStartX;
      const newTop = e.clientY - dragStartY;
      overlay.style.left = Math.max(0, Math.min(newLeft, window.innerWidth - 100)) + 'px';
      overlay.style.top = Math.max(0, Math.min(newTop, window.innerHeight - 50)) + 'px';
    }

    if (isResizing) {
      const rect = overlay.getBoundingClientRect();
      const newWidth = overlayStartWidth + (overlayStartLeft - e.clientX);
      const clampedWidth = Math.max(300, Math.min(newWidth, window.innerWidth - 50));
      overlay.style.width = clampedWidth + 'px';
      overlay.style.left = (window.innerWidth - clampedWidth) + 'px';
      overlay.style.right = 'auto';
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    isResizing = false;
  });

  // Resize from left edge
  resizeHandle.addEventListener('mousedown', e => {
    if (!isDesktopOrTablet()) return;
    isResizing = true;

    const rect = overlay.getBoundingClientRect();
    overlayStartLeft = rect.left;
    overlayStartWidth = rect.width;

    overlay.style.right = 'auto';
    overlay.style.left = rect.left + 'px';
    overlay.style.top = rect.top + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = '100dvh';

    e.preventDefault();
    e.stopPropagation();
  });

  // Touch drag for tablets
  let touchStartX = 0;
  let touchStartY = 0;
  let touchOverlayLeft = 0;
  let touchOverlayTop = 0;

  titlebar.addEventListener('touchstart', e => {
    if (isMobile()) return;
    const touch = e.touches[0];
    const rect = overlay.getBoundingClientRect();
    touchStartX = touch.clientX - rect.left;
    touchStartY = touch.clientY - rect.top;
    touchOverlayLeft = rect.left;
    touchOverlayTop = rect.top;

    overlay.style.right = 'auto';
    overlay.style.left = rect.left + 'px';
    overlay.style.top = rect.top + 'px';
    overlay.style.width = rect.width + 'px';
  }, { passive: true });

  titlebar.addEventListener('touchmove', e => {
    if (isMobile()) return;
    const touch = e.touches[0];
    const newLeft = touch.clientX - touchStartX;
    const newTop = touch.clientY - touchStartY;
    overlay.style.left = Math.max(0, Math.min(newLeft, window.innerWidth - 100)) + 'px';
    overlay.style.top = Math.max(0, Math.min(newTop, window.innerHeight - 50)) + 'px';
    e.preventDefault();
  }, { passive: false });

  // Close / reopen
  closeBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
    reopenBtn.style.display = 'flex';
  });

  reopenBtn.addEventListener('click', () => {
    overlay.style.display = 'flex';
    reopenBtn.style.display = 'none';
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key === 'e') {
      e.preventDefault();
      if (overlay.style.display === 'none') {
        overlay.style.display = 'flex';
        reopenBtn.style.display = 'none';
      } else {
        overlay.style.display = 'none';
        reopenBtn.style.display = 'flex';
      }
    }
    if (e.key === 'Escape' && document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }
  });

  // Responsive: reset on resize if mobile
  window.addEventListener('resize', () => {
    if (isMobile()) {
      resetToDefault();
    }
  });
}
