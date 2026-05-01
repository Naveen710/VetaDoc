// ═══════════════════════════════════════════════════
// VetaDoc — Modal Component
// ═══════════════════════════════════════════════════

let currentModal = null;

export function openModal(title, bodyHTML, footerHTML = '') {
    closeModal();
    const overlay = document.getElementById('modal-overlay');
    overlay.className = 'modal-overlay open';
    overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="btn-icon btn-ghost" id="modal-close-btn">
          <span class="material-icons-round">close</span>
        </button>
      </div>
      <div class="modal-body">${bodyHTML}</div>
      ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}
    </div>
  `;

    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    currentModal = overlay;
    document.body.style.overflow = 'hidden';
}

export function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.className = 'modal-overlay';
        overlay.innerHTML = '';
    }
    currentModal = null;
    document.body.style.overflow = '';
}

export function getModalBody() {
    return document.querySelector('.modal-body');
}
