const API_URL = '/api';
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('App initialized');
    updateAuthUI();
    loadCategories();
    if (authToken) {
        loadCartCount();
    }
});

// Navigation
function showPage(pageId) {
    console.log('Showing page:', pageId);
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('active');
        window.scrollTo(0, 0);
    } else {
        console.error('Page not found:', pageId);
    }
}

function showHome() { 
    showPage('home'); 
    return false;
}

function showProducts() { 
    showPage('products'); 
    loadProducts(); 
    return false;
}

function showCart() {
    if (!authToken) {
        alert('يجب تسجيل الدخول أولاً');
        showLogin();
        return false;
    }
    showPage('cart');
    loadCart();
    return false;
}

function showOrders() {
    if (!authToken) {
        alert('يجب تسجيل الدخول أولاً');
        showLogin();
        return false;
    }
    showPage('orders');
    loadOrders();
    return false;
}

function showLogin() { 
    showPage('login'); 
    return false;
}

function showRegister() { 
    showPage('register'); 
    return false;
}

function showCheckout() {
    if (!authToken) {
        alert('يجب تسجيل الدخول أولاً');
        showLogin();
        return false;
    }
    showPage('checkout');
    loadCheckout();
    return false;
}

// Auth
function updateAuthUI() {
    const authMenu = document.getElementById('auth-menu');
    const userMenu = document.getElementById('user-menu');

    if (authToken && currentUser) {
        if (authMenu) authMenu.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) userNameEl.textContent = `مرحباً ${currentUser.name}`;
    } else {
        if (authMenu) authMenu.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        alert('الرجاء ملء جميع الحقول');
        return false;
    }

    try {
        console.log('Attempting login...');
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log('Login response:', response.status, data);

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateAuthUI();
            loadCartCount();
            alert('تم تسجيل الدخول بنجاح');
            showHome();
        } else {
            alert(data.message || 'فشل تسجيل الدخول');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('حدث خطأ في الاتصال. تأكد من أن الخادم يعمل.');
    }
    return false;
}

async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;

    if (!name || !email || !password || !confirmPassword) {
        alert('الرجاء ملء جميع الحقول');
        return false;
    }

    if (password !== confirmPassword) {
        alert('كلمات المرور غير متطابقة');
        return false;
    }

    if (password.length < 6) {
        alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return false;
    }

    try {
        console.log('Attempting registration...');
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, confirmPassword })
        });

        const data = await response.json();
        console.log('Register response:', response.status, data);

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateAuthUI();
            loadCartCount();
            alert('تم التسجيل بنجاح');
            showHome();
        } else {
            alert(data.message || 'فشل التسجيل');
        }
    } catch (error) {
        console.error('Register error:', error);
        alert('حدث خطأ في الاتصال. تأكد من أن الخادم يعمل.');
    }
    return false;
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    updateAuthUI();
    showHome();
    return false;
}

// Products
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        const categories = [...new Set(products.map(p => p.category))];
        const select = document.getElementById('category');
        if (select) {
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function loadProducts(filters = {}) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    grid.innerHTML = '<div class="loading">جاري التحميل...</div>';

    try {
        let url = `${API_URL}/products`;
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.search) params.append('search', filters.search);
        if (filters.sort) params.append('sort', filters.sort);
        if (params.toString()) url += '?' + params.toString();

        const response = await fetch(url);
        const products = await response.json();

        grid.innerHTML = '';
        if (products.length === 0) {
            grid.innerHTML = '<div class="empty-state"><h3>لا توجد منتجات</h3></div>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${product.image || 'https://via.placeholder.com/300'}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">${product.price} دولار</div>
                    <div class="product-actions">
                        <button onclick="addToCart('${product.id}'); return false;" class="btn btn-primary">أضف للسلة</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        grid.innerHTML = '<div class="empty-state">حدث خطأ في تحميل المنتجات</div>';
    }
}

function searchProducts() {
    const search = document.getElementById('search').value;
    const category = document.getElementById('category').value;
    const sort = document.getElementById('sort').value;
    loadProducts({ search, category, sort });
}

function filterByCategory() {
    const search = document.getElementById('search').value;
    const category = document.getElementById('category').value;
    const sort = document.getElementById('sort').value;
    loadProducts({ search, category, sort });
}

function sortProducts() {
    const search = document.getElementById('search').value;
    const category = document.getElementById('category').value;
    const sort = document.getElementById('sort').value;
    loadProducts({ search, category, sort });
}

// Cart
async function addToCart(productId) {
    if (!authToken) {
        alert('يجب تسجيل الدخول أولاً');
        showLogin();
        return false;
    }

    try {
        const response = await fetch(`${API_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });

        const data = await response.json();
        if (response.ok) {
            alert('تمت إضافة المنتج إلى السلة');
            loadCartCount();
        } else {
            alert(data.message || 'فشل إضافة المنتج');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('حدث خطأ');
    }
    return false;
}

async function loadCartCount() {
    try {
        const response = await fetch(`${API_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            const cart = await response.json();
            const count = cart.reduce((sum, item) => sum + item.quantity, 0);
            const countEl = document.getElementById('cart-count');
            if (countEl) countEl.textContent = count;
        }
    } catch (error) {
        console.error('Error loading cart count:', error);
    }
}

async function loadCart() {
    const container = document.getElementById('cart-content');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">جاري التحميل...</div>';

    try {
        const response = await fetch(`${API_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const cart = await response.json();

        if (cart.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>السلة فارغة</h3>
                    <button onclick="showProducts(); return false;" class="btn btn-primary">تسوق الآن</button>
                </div>
            `;
            return;
        }

        let total = 0;
        let tableHTML = `
            <table class="cart-table">
                <thead>
                    <tr>
                        <th>المنتج</th>
                        <th>السعر</th>
                        <th>الكمية</th>
                        <th>الإجمالي</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
        `;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            tableHTML += `
                <tr>
                    <td>${item.products?.name || 'منتج'}</td>
                    <td>${item.price} دولار</td>
                    <td>${item.quantity}</td>
                    <td>${itemTotal} دولار</td>
                    <td>
                        <button onclick="removeFromCart('${item.product_id}'); return false;" class="btn btn-danger">حذف</button>
                    </td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
            <div class="cart-summary">
                <div class="cart-summary-row">
                    <span>الإجمالي:</span>
                    <span>${total.toFixed(2)} دولار</span>
                </div>
                <button onclick="showCheckout(); return false;" class="btn btn-primary btn-large" style="width: 100%; margin-top: 20px;">إتمام الشراء</button>
            </div>
        `;

        container.innerHTML = tableHTML;
    } catch (error) {
        console.error('Error loading cart:', error);
        container.innerHTML = '<div class="empty-state">حدث خطأ</div>';
    }
}

async function removeFromCart(productId) {
    try {
        const response = await fetch(`${API_URL}/cart/remove/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            loadCart();
            loadCartCount();
        } else {
            alert('فشل حذف المنتج');
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
        alert('حدث خطأ');
    }
    return false;
}

// Checkout
async function loadCheckout() {
    const container = document.getElementById('checkout-content');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">جاري التحميل...</div>';

    try {
        const response = await fetch(`${API_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const cart = await response.json();

        if (cart.length === 0) {
            container.innerHTML = '<div class="empty-state">السلة فارغة</div>';
            return;
        }

        let total = 0;
        let itemsHTML = '';

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            itemsHTML += `
                <div class="cart-summary-row">
                    <span>${item.products?.name} x${item.quantity}</span>
                    <span>${itemTotal} دولار</span>
                </div>
            `;
        });

        const checkoutHTML = `
            <div class="checkout-container">
                <div class="checkout-form">
                    <h3>عنوان الشحن</h3>
                    <form onsubmit="submitOrder(event, ${total}); return false;">
                        <div class="form-group">
                            <label>الشارع</label>
                            <input type="text" id="street" required>
                        </div>
                        <div class="form-group">
                            <label>المدينة</label>
                            <input type="text" id="city" required>
                        </div>
                        <div class="form-group">
                            <label>الولاية</label>
                            <input type="text" id="state" required>
                        </div>
                        <div class="form-group">
                            <label>الرمز البريدي</label>
                            <input type="text" id="zipCode" required>
                        </div>
                        <div class="form-group">
                            <label>الدولة</label>
                            <input type="text" id="country" required>
                        </div>
                        <button type="submit" class="btn btn-primary btn-large" style="width: 100%;">المتابعة للدفع</button>
                    </form>
                </div>
                <div class="checkout-order-summary">
                    <h3>ملخص الطلب</h3>
                    ${itemsHTML}
                    <div class="cart-summary-row" style="margin-top: 20px; font-weight: bold;">
                        <span>الإجمالي:</span>
                        <span>${total.toFixed(2)} دولار</span>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = checkoutHTML;
    } catch (error) {
        console.error('Error loading checkout:', error);
        container.innerHTML = '<div class="empty-state">حدث خطأ</div>';
    }
}

async function submitOrder(event, total) {
    event.preventDefault();

    const shippingAddress = {
        street: document.getElementById('street').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipCode: document.getElementById('zipCode').value,
        country: document.getElementById('country').value
    };

    try {
        const response = await fetch(`${API_URL}/orders/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ shippingAddress })
        });

        const data = await response.json();

        if (response.ok) {
            proceedToPayPal(data.orderId, total);
        } else {
            alert(data.message || 'فشل إنشاء الطلب');
        }
    } catch (error) {
        console.error('Error submitting order:', error);
        alert('حدث خطأ');
    }
    return false;
}

async function proceedToPayPal(orderId, total) {
    try {
        const response = await fetch(`${API_URL}/orders/paypal/create-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ orderId })
        });

        const data = await response.json();

        if (response.ok) {
            window.location.href = data.approvalUrl;
        } else {
            alert(data.message || 'فشل في إنشاء عملية الدفع');
        }
    } catch (error) {
        console.error('Error in PayPal payment:', error);
        alert('حدث خطأ في الدفع');
    }
}

// Orders
async function loadOrders() {
    const container = document.getElementById('orders-content');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">جاري التحميل...</div>';

    try {
        const response = await fetch(`${API_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const orders = await response.json();

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>لا توجد طلبات</h3>
                    <button onclick="showProducts(); return false;" class="btn btn-primary">ابدأ التسوق</button>
                </div>
            `;
            return;
        }

        let ordersHTML = '';

        orders.forEach(order => {
            const date = new Date(order.created_at).toLocaleDateString('ar-SA');
            ordersHTML += `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <div style="font-weight: bold;">الطلب #${order.id.substring(0, 8)}</div>
                            <div style="font-size: 12px; color: #666;">التاريخ: ${date}</div>
                        </div>
                        <span class="order-status">${order.order_status}</span>
                    </div>
                    <div style="margin: 15px 0;">
                        <strong>الإجمالي:</strong> ${order.total_amount.toFixed(2)} دولار
                    </div>
                    <div>
                        <strong>حالة الدفع:</strong> ${order.payment_status}
                    </div>
                </div>
            `;
        });

        container.innerHTML = ordersHTML;
    } catch (error) {
        console.error('Error loading orders:', error);
        container.innerHTML = '<div class="empty-state">حدث خطأ</div>';
    }
}

