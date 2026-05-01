// ═══════════════════════════════════════════════════
// VetaDoc — Toast Notification System
// ═══════════════════════════════════════════════════

const TOAST_DURATION = 3500;

export function showToast(title, message = '', type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
    <span class="material-icons-round toast-icon">${icons[type] || icons.info}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
    <span class="material-icons-round toast-close" onclick="this.closest('.toast').remove()">close</span>
  `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, TOAST_DURATION);
}
