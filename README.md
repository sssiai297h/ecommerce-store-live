# متجر المنتجات الإلكترونية 🛍️

متجر إلكتروني متكامل لبيع المنتجات الإلكترونية مع تكامل كامل مع بوابة الدفع **PayPal** وقاعدة بيانات **Supabase**.

## الميزات الرئيسية ✨

- ✅ نظام تسجيل وتسجيل دخول آمن
- ✅ إدارة المنتجات والفئات
- ✅ سلة تسوق متقدمة
- ✅ نظام طلبات شامل
- ✅ دفع آمن عبر PayPal
- ✅ واجهة مستخدم حديثة وسهلة الاستخدام
- ✅ تصميم استجابي (Responsive)
- ✅ دعم اللغة العربية

## المتطلبات 📋

- Node.js (v14 أو أحدث)
- npm أو pnpm
- حساب Supabase
- حساب PayPal Developer

## التثبيت والإعداد 🚀

### 1. استنساخ المشروع

```bash
git clone <repository-url>
cd ecommerce-final
```

### 2. تثبيت المكتبات

```bash
pnpm install
# أو
npm install
```

### 3. إعداد Supabase

1. اذهب إلى [Supabase](https://supabase.com)
2. أنشئ حساباً جديداً
3. أنشئ مشروعاً جديداً
4. احصل على `SUPABASE_URL` و `SUPABASE_KEY`

### 4. إنشاء جداول قاعدة البيانات

في لوحة تحكم Supabase، قم بتنفيذ الاستعلامات التالية:

```sql
-- جدول المستخدمين
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول المنتجات
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  image VARCHAR(500),
  stock INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول السلة
CREATE TABLE cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول الطلبات
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  items JSONB,
  total_amount DECIMAL(10, 2),
  shipping_address JSONB,
  payment_status VARCHAR(50) DEFAULT 'pending',
  order_status VARCHAR(50) DEFAULT 'pending',
  paypal_transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. إعداد ملف .env

أنشئ ملف `.env` في جذر المشروع:

```env
PORT=3000
NODE_ENV=production

# PayPal
PAYPAL_CLIENT_ID=ATiPDy_Ttg-pmyMxwU_39stpjJo_Dt8Lwi2LJdXpwq0MxfGXicP3lBy2FEcR8u8Ntt-DTK8Zj1glEHU1
PAYPAL_CLIENT_SECRET=EJ0O68o8ss8-eoGQkSPrv8Bt-A85W46ngs4T0f1PJUWNvfrCSJYdAJkF80qAvJ_nTEb7JGGnKrBqkm9a
PAYPAL_MODE=sandbox

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# JWT
JWT_SECRET=your-secret-key-change-in-production

# Frontend
FRONTEND_URL=http://localhost:3000
```

### 6. إضافة بيانات تجريبية

في لوحة تحكم Supabase، أضف بعض المنتجات:

```sql
INSERT INTO products (name, description, price, category, stock, rating) VALUES
('لابتوب HP Pavilion', 'لابتوب قوي للعمل والألعاب', 899.99, 'الحواسيب المحمولة', 15, 4.5),
('سماعات Sony WH-1000XM4', 'سماعات بلوتوث عالية الجودة', 349.99, 'الصوتيات', 20, 4.8),
('كاميرا Canon EOS M50', 'كاميرا احترافية للتصوير', 749.99, 'الكاميرات', 10, 4.6),
('هاتف Samsung Galaxy S24', 'هاتف ذكي متقدم', 1199.99, 'الهواتف الذكية', 25, 4.7),
('iPad Pro 12.9 inch', 'جهاز لوحي قوي', 1099.99, 'الأجهزة اللوحية', 12, 4.9);
```

## التشغيل 🏃

```bash
pnpm start
# أو
npm start
```

الخادم سيعمل على: `http://localhost:3000`

## الاستخدام 💻

### التسجيل والدخول

1. انقر على **تسجيل** أو **دخول**
2. أدخل بيانات الحساب
3. سيتم إنشاء حساب جديد أو تسجيل الدخول

### التسوق

1. انقر على **المنتجات**
2. استعرض المنتجات المتاحة
3. استخدم البحث والتصفية للعثور على ما تريد
4. انقر **أضف للسلة**

### الدفع

1. انقر على **السلة**
2. تحقق من المنتجات
3. انقر **إتمام الشراء**
4. أدخل عنوان الشحن
5. انقر **المتابعة للدفع**
6. ستنتقل إلى PayPal لإكمال الدفع

## نقاط نهاية API 🔌

### المصادقة
- `POST /api/auth/register` - التسجيل
- `POST /api/auth/login` - الدخول

### المنتجات
- `GET /api/products` - الحصول على المنتجات
- `GET /api/products/:id` - الحصول على منتج واحد

### السلة
- `GET /api/cart` - عرض السلة
- `POST /api/cart/add` - إضافة منتج
- `PUT /api/cart/update/:productId` - تحديث الكمية
- `DELETE /api/cart/remove/:productId` - حذف منتج

### الطلبات
- `POST /api/orders/create` - إنشاء طلب
- `GET /api/orders` - عرض الطلبات
- `POST /api/orders/paypal/create-payment` - إنشاء عملية دفع
- `POST /api/orders/paypal/capture-payment` - تأكيد الدفع

## الأمان 🔒

- ✅ تشفير كلمات المرور باستخدام bcryptjs
- ✅ مصادقة JWT آمنة
- ✅ التحقق من صحة المدخلات
- ✅ حماية CORS
- ✅ متغيرات بيئة آمنة

## استكشاف الأخطاء 🐛

### خطأ: "Cannot connect to Supabase"
- تحقق من `SUPABASE_URL` و `SUPABASE_KEY`
- تأكد من أن المشروع نشط في Supabase

### خطأ: "PayPal authentication failed"
- تحقق من `PAYPAL_CLIENT_ID` و `PAYPAL_CLIENT_SECRET`
- تأكد من أنك في بيئة Sandbox

### خطأ: "Port 3000 is already in use"
- غير المنفذ في `.env`
- أو أغلق التطبيق الذي يستخدم المنفذ

## النشر 🌐

### نشر على Vercel

1. أنشئ حساب على [Vercel](https://vercel.com)
2. ربط مستودع GitHub
3. أضف متغيرات البيئة
4. انقر Deploy

### نشر على Heroku

```bash
heroku login
heroku create your-app-name
heroku config:set SUPABASE_URL=your-url
heroku config:set SUPABASE_KEY=your-key
heroku config:set PAYPAL_CLIENT_ID=your-id
heroku config:set PAYPAL_CLIENT_SECRET=your-secret
git push heroku main
```

## الدعم والمساعدة 📞

إذا واجهت أي مشاكل:
1. تحقق من ملف README
2. اقرأ رسائل الخطأ بعناية
3. تحقق من ملف السجل (logs)
4. افتح issue في المستودع

## الترخيص 📜

هذا المشروع مرخص تحت MIT License

## المساهمون 👥

تم تطوير هذا المشروع بواسطة فريق التطوير.

---

**شكراً لاستخدامك متجرنا الإلكتروني!** 🎉

