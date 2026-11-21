/**
 * Ritesh Kumar Portfolio Script
 * Handles:
 * 1. Accessible tabs (AI and ML, Full-stack, Leadership) with arrow-key navigation.
 * 2. Sticky header active anchor tracking.
 * 3. Theme switching (dark / light) with local persistence and system preference support.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ------------------------------------------------------------------------
  // 1. Accessible Tabs with Arrow-Key Support
  // ------------------------------------------------------------------------
  const tabList = document.querySelector('[role="tablist"]');
  const tabs = document.querySelectorAll('[role="tab"]');

  if (tabList && tabs.length > 0) {
    const activateTab = (tabToActivate, setFocus = true) => {
      tabs.forEach((tab) => {
        const isSelected = tab === tabToActivate;
        tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        tab.setAttribute('tabindex', isSelected ? '0' : '-1');
        tab.classList.toggle('active', isSelected);

        const targetPanelId = tab.getAttribute('aria-controls');
        const targetPanel = document.getElementById(targetPanelId);

        if (targetPanel) {
          if (isSelected) {
            targetPanel.removeAttribute('hidden');
            targetPanel.classList.add('active');
          } else {
            targetPanel.setAttribute('hidden', '');
            targetPanel.classList.remove('active');
          }
        }
      });

      if (setFocus) {
        tabToActivate.focus();
      }
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        activateTab(tab, false);
      });
    });

    tabList.addEventListener('keydown', (e) => {
      const tabArray = Array.from(tabs);
      const currentIndex = tabArray.indexOf(document.activeElement);

      if (currentIndex === -1) return;

      let targetIndex = null;

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          targetIndex = (currentIndex - 1 + tabArray.length) % tabArray.length;
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          targetIndex = (currentIndex + 1) % tabArray.length;
          break;
        case 'Home':
          e.preventDefault();
          targetIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          targetIndex = tabArray.length - 1;
          break;
        default:
          return;
      }

      if (targetIndex !== null) {
        activateTab(tabArray[targetIndex], true);
      }
    });
  }

  // ------------------------------------------------------------------------
  // 2. Active Anchor Link Highlight on Scroll
  // ------------------------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const handleScrollActiveLink = () => {
    const scrollY = window.pageYOffset + 140;

    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop;
      const sectionId = current.getAttribute('id');
      const correspondingLink = document.querySelector(`.nav-links a[href*="#${sectionId}"]`);

      if (correspondingLink) {
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          correspondingLink.classList.add('active');
        } else {
          correspondingLink.classList.remove('active');
        }
      }
    });
  };

  window.addEventListener('scroll', handleScrollActiveLink, { passive: true });
  handleScrollActiveLink();

  // ------------------------------------------------------------------------
  // 3. Theme Toggle Logic
  // ------------------------------------------------------------------------
  const themeToggle = document.getElementById('themeToggle');
  const htmlElement = document.documentElement;

  // Check saved theme or leave it unset to respect prefers-color-scheme
  const savedTheme = localStorage.getItem('ritesh-theme');
  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = htmlElement.getAttribute('data-theme');
      let nextTheme;

      if (!currentTheme) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        nextTheme = prefersDark ? 'light' : 'dark';
      } else {
        nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      }

      htmlElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('ritesh-theme', nextTheme);
    });
  }

  // ------------------------------------------------------------------------
  // 4. Interactive 3D Card Tilt Engine
  // ------------------------------------------------------------------------
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const applyTilt = (card) => {
    if (prefersReducedMotion.matches || !card) return;
    let isHovered = false;

    card.addEventListener('mouseenter', () => {
      isHovered = true;
    });

    card.addEventListener('mousemove', (e) => {
      if (!isHovered) return;
      const rect = card.getBoundingClientRect();
      const cardWidth = rect.width;
      const cardHeight = rect.height;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Smooth rotation between -6deg and 6deg
      const rotateX = ((y / cardHeight) - 0.5) * -12;
      const rotateY = ((x / cardWidth) - 0.5) * 12;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      isHovered = false;
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  };

  const tiltCards = document.querySelectorAll('[data-tilt]');
  tiltCards.forEach(applyTilt);

  // ------------------------------------------------------------------------
  // 5. Interactive Certificate Manager (Add, Modify & Local Persistence)
  // ------------------------------------------------------------------------
  const certDialog = document.getElementById('certDialog');
  const certForm = document.getElementById('certForm');
  const openAddCertBtn = document.getElementById('openAddCertBtn');
  const closeCertModalBtn = document.getElementById('closeCertModalBtn');
  const cancelCertBtn = document.getElementById('cancelCertBtn');
  const copyCertHtmlBtn = document.getElementById('copyCertHtmlBtn');
  const certsGrid = document.getElementById('certsGrid');
  const certModalFeedback = document.getElementById('certModalFeedback');

  const certEditId = document.getElementById('certEditId');
  const certTitleInput = document.getElementById('certTitleInput');
  const certIssuerInput = document.getElementById('certIssuerInput');
  const certDateInput = document.getElementById('certDateInput');
  const certBadgeInput = document.getElementById('certBadgeInput');
  const certFileInput = document.getElementById('certFileInput');
  const certPathInput = document.getElementById('certPathInput');
  const modalActionBadge = document.getElementById('modalActionBadge');
  const certModalHeading = document.getElementById('certModalHeading');
  const saveBtnText = document.getElementById('saveBtnText');

  // Load custom/modified certs from localStorage
  const loadStoredCerts = () => {
    try {
      const modifiedCerts = JSON.parse(localStorage.getItem('ritesh-modified-certs') || '{}');
      Object.keys(modifiedCerts).forEach((certId) => {
        const card = document.querySelector(`.cert-card[data-cert-id="${certId}"]`);
        if (card) {
          const data = modifiedCerts[certId];
          const titleEl = card.querySelector('.cert-title');
          const subEl = card.querySelector('.cert-sub');
          const badgeEl = card.querySelector('.cert-badge');
          const viewLink = card.querySelector('.cert-view-link');
          const downloadLink = card.querySelector('.cert-download-link');

          if (titleEl) titleEl.textContent = data.title;
          if (subEl) subEl.innerHTML = `${data.issuer} &bull; ${data.date}`;
          if (badgeEl) badgeEl.textContent = data.badge;
          if (viewLink && data.fileUrl) viewLink.setAttribute('href', data.fileUrl);
          if (downloadLink && data.fileUrl) downloadLink.setAttribute('href', data.fileUrl);
        }
      });

      const customCerts = JSON.parse(localStorage.getItem('ritesh-custom-certs') || '[]');
      customCerts.forEach((data) => {
        if (!document.querySelector(`.cert-card[data-cert-id="${data.id}"]`)) {
          createAndAppendCertCard(data, false);
        }
      });
    } catch (e) {
      console.warn('Failed to load certificates from storage:', e);
    }
  };

  const createAndAppendCertCard = (data, isNew = true) => {
    const article = document.createElement('article');
    article.className = 'cert-card tilt-card';
    article.setAttribute('data-tilt', '');
    article.setAttribute('data-cert-id', data.id);

    article.innerHTML = `
      <div class="cert-header">
        <span class="cert-badge" aria-hidden="true">${data.badge || 'CERT'}</span>
        <div class="cert-details">
          <strong class="cert-title">${data.title}</strong>
          <div class="cert-sub">${data.issuer} &bull; ${data.date}</div>
        </div>
      </div>
      <div class="cert-actions">
        <a href="${data.fileUrl || '#'}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm cert-btn cert-view-link" aria-label="View ${data.title} certificate">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          <span>View</span>
        </a>
        <a href="${data.fileUrl || '#'}" download class="btn btn-primary btn-sm cert-btn cert-download-link" aria-label="Download ${data.title} certificate">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span>Download</span>
        </a>
        <button type="button" class="btn btn-secondary btn-sm cert-btn cert-modify-btn" data-cert-id="${data.id}" aria-label="Modify ${data.title} certificate">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          <span>Modify</span>
        </button>
      </div>
    `;

    certsGrid.prepend(article);
    applyTilt(article);

    const newModifyBtn = article.querySelector('.cert-modify-btn');
    if (newModifyBtn) {
      newModifyBtn.addEventListener('click', () => openModifyModal(newModifyBtn));
    }

    if (isNew) {
      try {
        const customCerts = JSON.parse(localStorage.getItem('ritesh-custom-certs') || '[]');
        customCerts.unshift(data);
        localStorage.setItem('ritesh-custom-certs', JSON.stringify(customCerts));
      } catch (e) {
        console.warn('Storage save failed:', e);
      }
    }
  };

  const openModifyModal = (btn) => {
    const certId = btn.getAttribute('data-cert-id');
    const card = btn.closest('.cert-card');
    if (!card || !certDialog) return;

    const title = card.querySelector('.cert-title')?.textContent?.trim() || '';
    const subText = card.querySelector('.cert-sub')?.textContent?.trim() || '';
    const badge = card.querySelector('.cert-badge')?.textContent?.trim() || '';
    const viewHref = card.querySelector('.cert-view-link')?.getAttribute('href') || '';

    let issuer = '';
    let date = '';
    if (subText.includes('•')) {
      const parts = subText.split('•');
      issuer = parts[0].trim();
      date = parts[1].trim();
    } else {
      issuer = subText;
    }

    certEditId.value = certId;
    certTitleInput.value = title;
    certIssuerInput.value = issuer;
    certDateInput.value = date;
    certBadgeInput.value = badge;
    certPathInput.value = viewHref;
    certFileInput.value = '';

    modalActionBadge.textContent = 'EDIT';
    certModalHeading.textContent = 'Modify certificate';
    saveBtnText.textContent = 'Update certificate';
    certModalFeedback.textContent = '';

    certDialog.showModal();
  };

  const openAddModal = () => {
    if (!certDialog) return;
    certEditId.value = '';
    certForm.reset();
    modalActionBadge.textContent = 'NEW';
    certModalHeading.textContent = 'Add certificate';
    saveBtnText.textContent = 'Save certificate';
    certModalFeedback.textContent = '';
    certDialog.showModal();
  };

  if (openAddCertBtn) {
    openAddCertBtn.addEventListener('click', openAddModal);
  }

  if (closeCertModalBtn) {
    closeCertModalBtn.addEventListener('click', () => certDialog.close());
  }

  if (cancelCertBtn) {
    cancelCertBtn.addEventListener('click', () => certDialog.close());
  }

  // Backdrop click to close dialog
  if (certDialog) {
    certDialog.addEventListener('click', (e) => {
      const rect = certDialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        certDialog.close();
      }
    });
  }

  // Delegate modify buttons
  document.querySelectorAll('.cert-modify-btn').forEach((btn) => {
    btn.addEventListener('click', () => openModifyModal(btn));
  });

  // Handle form submit
  if (certForm) {
    certForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const id = certEditId.value || `cert-custom-${Date.now()}`;
      const title = certTitleInput.value.trim();
      const issuer = certIssuerInput.value.trim();
      const date = certDateInput.value.trim();
      const badge = certBadgeInput.value.trim().toUpperCase() || 'CERT';
      let pathVal = certPathInput.value.trim() || 'assets/certificates/aws-cloud-foundations.pdf';

      const file = certFileInput.files && certFileInput.files[0];
      const processSave = (fileUrl) => {
        const certData = { id, title, issuer, date, badge, fileUrl };

        if (certEditId.value) {
          // Modify existing card
          const card = document.querySelector(`.cert-card[data-cert-id="${id}"]`);
          if (card) {
            const titleEl = card.querySelector('.cert-title');
            const subEl = card.querySelector('.cert-sub');
            const badgeEl = card.querySelector('.cert-badge');
            const viewLink = card.querySelector('.cert-view-link');
            const downloadLink = card.querySelector('.cert-download-link');

            if (titleEl) titleEl.textContent = title;
            if (subEl) subEl.innerHTML = `${issuer} &bull; ${date}`;
            if (badgeEl) badgeEl.textContent = badge;
            if (viewLink) viewLink.setAttribute('href', fileUrl);
            if (downloadLink) downloadLink.setAttribute('href', fileUrl);

            try {
              const modifiedCerts = JSON.parse(localStorage.getItem('ritesh-modified-certs') || '{}');
              modifiedCerts[id] = certData;
              localStorage.setItem('ritesh-modified-certs', JSON.stringify(modifiedCerts));
            } catch (err) {
              console.warn(err);
            }
          }
          certModalFeedback.textContent = 'Certificate updated successfully!';
        } else {
          // Add new card
          createAndAppendCertCard(certData, true);
          certModalFeedback.textContent = 'Certificate added successfully!';
        }

        setTimeout(() => {
          certDialog.close();
        }, 800);
      };

      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          processSave(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        processSave(pathVal);
      }
    });
  }

  // Copy HTML Snippet
  if (copyCertHtmlBtn) {
    copyCertHtmlBtn.addEventListener('click', () => {
      const title = certTitleInput.value.trim() || 'Certificate Title';
      const issuer = certIssuerInput.value.trim() || 'Issuer Name';
      const date = certDateInput.value.trim() || 'Year';
      const badge = certBadgeInput.value.trim().toUpperCase() || 'CERT';
      const fileUrl = certPathInput.value.trim() || 'assets/certificates/my-certificate.pdf';

      const snippet = `<!-- ${title} -->
<article class="cert-card tilt-card" data-tilt>
  <div class="cert-header">
    <span class="cert-badge" aria-hidden="true">${badge}</span>
    <div class="cert-details">
      <strong class="cert-title">${title}</strong>
      <div class="cert-sub">${issuer} &bull; ${date}</div>
    </div>
  </div>
  <div class="cert-actions">
    <a href="${fileUrl}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm cert-btn cert-view-link" aria-label="View ${title} certificate">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
      <span>View</span>
    </a>
    <a href="${fileUrl}" download class="btn btn-primary btn-sm cert-btn cert-download-link" aria-label="Download ${title} certificate">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
      <span>Download</span>
    </a>
  </div>
</article>`;

      navigator.clipboard.writeText(snippet).then(() => {
        certModalFeedback.textContent = 'HTML snippet copied to clipboard!';
      }).catch(() => {
        certModalFeedback.textContent = 'Clipboard write failed. Please copy manually.';
      });
    });
  }

  // Load stored certs on startup
  loadStoredCerts();
});
