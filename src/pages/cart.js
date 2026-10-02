// ═══════════════════════════════════════════════════
// VetaDoc — Cart Page
// ═══════════════════════════════════════════════════

import { getState, removeFromCart, updateCartQty, clearCart, getCartTotal, placeOrder, addPrescription } from '../store.js';
import { uploadPrescriptionFile, createPaymentOrder } from '../utils/api.js';
import { collectPayment } from '../utils/payments.js';

// The prescription attached to this checkout (id of a store prescription).
let attachedRxId = null;
import { products } from '../data/products.js';
import { formatPrice, generateId } from '../utils/helpers.js';
import { navigate } from '../router.js';
import { showToast } from '../components/toast.js';
import { openModal, closeModal } from '../components/modal.js';
import { renderProductCard } from '../components/productCard.js';
import { addToCart } from '../store.js';

export default function renderCart(container) {
    function render() {
        const state = getState();
        const items = state.cart;
        const total = getCartTotal();
        const hasRx = items.some(i => i.prescriptionRequired);
        const usableRx = (state.prescriptions || []).filter(r => ['issued', 'verified', 'uploaded'].includes(r.status));
        if (attachedRxId && !usableRx.some(r => r.id === attachedRxId)) attachedRxId = null;
        const attached = usableRx.find(r => r.id === attachedRxId);

        // Smart recommendations based on cart items
        const cartSpecies = new Set();
        items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) product.species.forEach(s => cartSpecies.add(s));
        });
        const recommended = products
            .filter(p => !items.find(i => i.productId === p.id) && p.species.some(s => cartSpecies.has(s)) && p.stock > 0)
            .slice(0, 4);

        container.innerHTML = `
      <div class="page-container">
        <h1 style="font-size:var(--text-2xl);margin-bottom:var(--space-6);display:flex;align-items:center;gap:var(--space-3)">
          <span class="material-icons-round" style="color:var(--color-primary)">shopping_cart</span>
          Shopping Cart
          <span class="badge badge-neutral">${items.length} items</span>
        </h1>

        ${items.length === 0 ? `
          <div class="empty-state">
            <span class="material-icons-round">remove_shopping_cart</span>
            <h3>Your cart is empty</h3>
            <p>Browse our products and add items to get started!</p>
            <button class="btn btn-primary btn-lg" id="empty-cart-shop">
              <span class="material-icons-round">storefront</span>
              Start Shopping
            </button>
          </div>
        ` : `
          <div style="display:grid;grid-template-columns:1fr 380px;gap:var(--space-8);align-items:start">
            <div class="cart-items">
              ${items.map(item => `
                <div class="cart-item">
                  <div class="cart-item-image">${item.emoji}</div>
                  <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-brand">${item.brand}</div>
                    ${item.prescriptionRequired ? '<span class="rx-badge" style="margin-top:4px"><span class="material-icons-round">medication</span> Rx Required</span>' : ''}
                  </div>
                  <div class="qty-control">
                    <button data-qty-minus="${item.productId}"><span class="material-icons-round" style="font-size:14px">remove</span></button>
                    <span>${item.qty}</span>
                    <button data-qty-plus="${item.productId}"><span class="material-icons-round" style="font-size:14px">add</span></button>
                  </div>
                  <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
                  <button class="btn-icon btn-ghost" data-remove-item="${item.productId}" title="Remove">
                    <span class="material-icons-round" style="font-size:18px;color:var(--color-error)">delete</span>
                  </button>
                </div>
              `).join('')}
            </div>

            <div class="cart-summary">
              <h3>Order Summary</h3>
              <div class="cart-summary-row">
                <span>Subtotal</span>
                <span>${formatPrice(total)}</span>
              </div>
              <div class="cart-summary-row">
                <span>Delivery</span>
                <span style="color:var(--color-success)">${total >= 499 ? 'FREE' : formatPrice(49)}</span>
              </div>
              ${hasRx ? `
                <div class="cart-summary-row" style="color:var(--color-secondary)">
                  <span>⚕️ Prescription verification</span>
                  <span>Required</span>
                </div>
              ` : ''}
              <div class="cart-summary-total">
                <span>Total</span>
                <span>${formatPrice(total + (total >= 499 ? 0 : 49))}</span>
              </div>

              <div style="margin:var(--space-4) 0">
                <div class="input-with-icon" style="margin-bottom:var(--space-3)">
                  <span class="material-icons-round">local_offer</span>
                  <input type="text" class="input" placeholder="Enter coupon code" id="coupon-input" />
                </div>
                <button class="btn btn-secondary w-full btn-sm" id="apply-coupon">Apply Coupon</button>
              </div>

              ${hasRx ? `
                <div class="rx-attach" style="border:1px solid var(--border-color);border-radius:14px;padding:var(--space-3);margin-bottom:var(--space-3)">
                  <div style="font-weight:600;font-size:var(--text-sm);margin-bottom:6px;display:flex;align-items:center;gap:6px">
                    <span class="material-icons-round" style="color:var(--color-coral);font-size:18px">medication</span> Prescription for Rx items
                  </div>
                  ${usableRx.length ? `
                    <select class="select" id="cart-rx-select" style="margin-bottom:8px">
                      <option value="">Choose a prescription…</option>
                      ${usableRx.map(r => `<option value="${r.id}" ${r.id === attachedRxId ? 'selected' : ''}>${r.id} · ${r.petName || 'Pet'} · ${r.vetName || 'Uploaded'} (${r.status})</option>`).join('')}
                    </select>` : ''}
                  <button class="btn btn-secondary w-full btn-sm" id="cart-upload-rx">
                    <span class="material-icons-round">upload_file</span> Upload from my vet
                  </button>
                  <p style="font-size:var(--text-xs);color:var(--text-tertiary);margin-top:8px">
                    ${attached ? `Attached ${attached.id}. A pharmacist checks it before we pack your order.` : 'Rx items ship only after a licensed pharmacist checks a valid prescription.'}
                  </p>
                </div>
              ` : ''}

              <button class="btn btn-primary w-full btn-lg" id="checkout-btn">
                <span class="material-icons-round">shopping_bag</span>
                Place Order
              </button>

              <button class="btn btn-ghost w-full" id="clear-cart-btn" style="margin-top:var(--space-2);color:var(--color-error)">
                <span class="material-icons-round">delete_sweep</span>
                Clear Cart
              </button>
            </div>
          </div>
        `}

        ${recommended.length > 0 && items.length > 0 ? `
          <section style="margin-top:var(--space-12)">
            <div class="section-header">
              <h2><span class="material-icons-round">auto_awesome</span> Recommended for You</h2>
            </div>
            <div class="product-grid">
              ${recommended.map(p => renderProductCard(p)).join('')}
            </div>
          </section>
        ` : ''}
      </div>
    `;

        // Events
        document.getElementById('empty-cart-shop')?.addEventListener('click', () => navigate('/catalog'));

        document.querySelectorAll('[data-qty-minus]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.qtyMinus);
                const item = getState().cart.find(i => i.productId === id);
                if (item) { updateCartQty(id, item.qty - 1); render(); }
            });
        });
        document.querySelectorAll('[data-qty-plus]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.qtyPlus);
                const item = getState().cart.find(i => i.productId === id);
                if (item) { updateCartQty(id, item.qty + 1); render(); }
            });
        });
        document.querySelectorAll('[data-remove-item]').forEach(btn => {
            btn.addEventListener('click', () => {
                removeFromCart(parseInt(btn.dataset.removeItem));
                showToast('Removed', 'Item removed from cart', 'info');
                render();
            });
        });

        document.getElementById('clear-cart-btn')?.addEventListener('click', () => {
            clearCart();
            showToast('Cart Cleared', 'All items removed', 'info');
            render();
        });

        document.getElementById('apply-coupon')?.addEventListener('click', () => {
            const code = document.getElementById('coupon-input')?.value;
            if (code) {
                showToast('Invalid Coupon', 'This coupon code is not valid', 'warning');
            }
        });

        document.getElementById('cart-rx-select')?.addEventListener('change', (e) => {
            attachedRxId = e.target.value || null;
            render();
        });

        document.getElementById('checkout-btn')?.addEventListener('click', async () => {
            const state = getState();
            const needsRx = state.cart.some(i => i.prescriptionRequired);
            if (needsRx && !attachedRxId) {
                showToast('Prescription needed', 'Choose or upload a prescription for the Rx items', 'warning');
                return;
            }
            const subtotal = getCartTotal();
            const payable = subtotal + (subtotal >= 499 ? 0 : 49);
            const btn = document.getElementById('checkout-btn');
            btn.disabled = true;
            let paid;
            try {
                const payOrder = await createPaymentOrder({ amount: payable, purpose: 'order' });
                if (payOrder?.error) throw new Error(payOrder.error);
                paid = await collectPayment(payOrder, 'Medicines order');
            } catch (err) {
                btn.disabled = false;
                showToast('Payment not completed', err.message, 'warning');
                return;
            }
            const order = {
                id: 'VD-' + Date.now().toString(36).toUpperCase(),
                date: new Date().toISOString().split('T')[0],
                status: needsRx ? 'awaiting_rx' : 'processing',
                total: subtotal,
                payable,
                paymentId: paid.paymentId,
                paymentStatus: paid.demo ? 'demo' : 'paid',
                rxId: needsRx ? attachedRxId : null,
                items: state.cart.map(i => ({ productId: i.productId, name: i.name, emoji: i.emoji, qty: i.qty, price: i.price, rxRequired: Boolean(i.prescriptionRequired) })),
                prescriptionUploaded: needsRx,
                tracking: [
                    { status: 'Order Placed', time: new Date().toLocaleString('en-IN'), detail: 'Your order has been placed successfully', completed: true },
                    ...(needsRx ? [{ status: 'Prescription check', time: '', detail: 'A pharmacist is verifying your prescription', completed: false }] : []),
                    { status: 'Processing', time: '', detail: 'Your order will be processed shortly', completed: false },
                    { status: 'Shipped', time: '', detail: '', completed: false },
                    { status: 'Delivered', time: '', detail: '', completed: false },
                ],
                address: state.user.address
            };
            placeOrder(order);
            attachedRxId = null;
            showToast('Order placed', needsRx ? `${order.id} · waiting for prescription check` : `Order ${order.id} placed successfully`, 'success');
            navigate('/orders');
        });

        document.getElementById('cart-upload-rx')?.addEventListener('click', () => {
            const pets = getState().pets || [];
            openModal('Upload prescription', `
        <div style="display:flex;flex-direction:column;gap:var(--space-4)">
          <p style="font-size:var(--text-sm);color:var(--text-secondary)">Upload a clear photo or PDF of a prescription signed by a registered veterinarian. It must show the vet's name, registration number, date, the animal and the medicine with dose.</p>
          <div class="input-group">
            <label>For which animal?</label>
            <select class="select" id="rx-pet">${pets.map(p => `<option value="${p.id}">${p.emoji || '🐾'} ${p.name}</option>`).join('')}<option value="">Other</option></select>
          </div>
          <div class="input-group">
            <label>Prescribing vet (name and registration no.)</label>
            <input class="input" id="rx-vet" placeholder="e.g., Dr. K. Rao, TSVC/2011/0456" />
          </div>
          <label style="border:2px dashed var(--border-color);border-radius:var(--radius-xl);padding:var(--space-6);text-align:center;cursor:pointer;display:block">
            <span class="material-icons-round" style="font-size:40px;color:var(--text-tertiary)">cloud_upload</span>
            <p style="margin-top:var(--space-2);font-weight:var(--font-medium)" id="rx-file-label">Choose file</p>
            <p style="font-size:var(--text-xs);color:var(--text-tertiary)">JPG, PNG or PDF, up to 5 MB</p>
            <input type="file" id="rx-file" accept="image/jpeg,image/png,application/pdf" hidden />
          </label>
        </div>
      `, `
        <button class="btn btn-ghost" onclick="document.getElementById('modal-close-btn').click()">Cancel</button>
        <button class="btn btn-primary" id="submit-cart-rx-btn"><span class="material-icons-round">check</span> Attach prescription</button>
      `);
            setTimeout(() => {
                const input = document.getElementById('rx-file');
                input?.addEventListener('change', () => {
                    const f = input.files?.[0];
                    document.getElementById('rx-file-label').textContent = f ? f.name : 'Choose file';
                });
                document.getElementById('submit-cart-rx-btn')?.addEventListener('click', async () => {
                    const file = input?.files?.[0];
                    if (!file) { showToast('No file', 'Choose a photo or PDF of the prescription', 'warning'); return; }
                    if (file.size > 5 * 1024 * 1024) { showToast('File too large', 'Maximum size is 5 MB', 'warning'); return; }
                    const btn = document.getElementById('submit-cart-rx-btn');
                    btn.disabled = true; btn.textContent = 'Uploading…';
                    try {
                        const uploaded = await uploadPrescriptionFile(file);
                        const pet = pets.find(p => p.id === document.getElementById('rx-pet')?.value);
                        const rx = {
                            id: 'RX-' + Date.now().toString(36).toUpperCase(),
                            petId: pet?.id || null,
                            petName: pet?.name || 'Other',
                            source: 'upload',
                            vetName: document.getElementById('rx-vet')?.value.trim() || '',
                            date: new Date().toISOString().slice(0, 10),
                            file: uploaded,
                            items: getState().cart.filter(i => i.prescriptionRequired).map(i => ({ name: i.name })),
                            status: 'uploaded',
                        };
                        addPrescription(rx);
                        attachedRxId = rx.id;
                        closeModal();
                        showToast('Prescription attached', 'A pharmacist will verify it before dispatch', 'success');
                        render();
                    } catch (err) {
                        btn.disabled = false; btn.textContent = 'Attach prescription';
                        showToast('Upload failed', err.message, 'error');
                    }
                });
            }, 100);
        });

        // Recommended product events
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('[data-add-cart]')) return;
                navigate('/product/' + card.dataset.productId);
            });
        });
        document.querySelectorAll('[data-add-cart]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const p = products.find(p => p.id === parseInt(btn.dataset.addCart));
                if (p) { addToCart(p); showToast('Added', p.name, 'success'); render(); }
            });
        });
    }

    render();
}
