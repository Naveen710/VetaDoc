// ═══════════════════════════════════════════════════
// VetaDoc — Footer Component
// ═══════════════════════════════════════════════════

export function renderFooter() {
    return `
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="logo-text">Veta<span>Doc</span></div>
          <p>Your trusted partner for veterinary medicines, supplements, and pet care. Quality products delivered to your doorstep with prescription verification.</p>
          <div style="margin-top:var(--space-3)">
            <a href="tel:+919876543210" style="display:inline-flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--color-error);font-weight:var(--font-semibold);text-decoration:none">
              <span class="material-icons-round" style="font-size:16px">emergency</span>
              Emergency: +91 98765 43210
            </a>
          </div>
          <div class="footer-social">
            <a href="#" title="Facebook"><span class="material-icons-round">facebook</span></a>
            <a href="#" title="Twitter"><span class="material-icons-round">tag</span></a>
            <a href="#" title="Instagram"><span class="material-icons-round">photo_camera</span></a>
            <a href="#" title="YouTube"><span class="material-icons-round">play_circle</span></a>
          </div>
        </div>
        <div class="footer-section">
          <h4>Quick Links</h4>
          <div class="footer-links">
            <a href="#/">Home</a>
            <a href="#/catalog">Shop All</a>
            <a href="#/consultation">Vet Consultation</a>
            <a href="#/samples">Lab Tests</a>
            <a href="#/followups">Follow-ups</a>
            <a href="#/orders">Track Orders</a>
            <a href="#/pets">My Pets</a>
          </div>
        </div>
        <div class="footer-section">
          <h4>Categories</h4>
          <div class="footer-links">
            <a href="#/catalog">Antibiotics</a>
            <a href="#/catalog">Vaccines</a>
            <a href="#/catalog">Supplements</a>
            <a href="#/catalog">Dewormers</a>
            <a href="#/catalog">Skin & Coat</a>
          </div>
        </div>
        <div class="footer-section">
          <h4>Support</h4>
          <div class="footer-links">
            <a href="#">Help Center</a>
            <a href="#">Shipping Policy</a>
            <a href="#">Returns & Refunds</a>
            <a href="#">Prescription Info</a>
            <a href="#">Contact Us</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 VetaDoc. All rights reserved. Licensed Veterinary Pharmacy.</p>
        <p>Made with ❤️ for pets</p>
      </div>
    </footer>
  `;
}
