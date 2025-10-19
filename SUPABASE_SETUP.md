# إعداد Supabase - خطوة بخطوة 🗄️

## الخطوة 1: إنشاء حساب Supabase

1. اذهب إلى: https://supabase.com
2. انقر **Sign Up**
3. استخدم البريد: **allsuu279@gmail.com**
4. أنشئ كلمة مرور قوية
5. تحقق من بريدك الإلكتروني

## الخطوة 2: إنشاء مشروع جديد

1. في لوحة التحكم، انقر **New Project**
2. أدخل اسم المشروع: `ecommerce-store`
3. اختر كلمة مرور قوية للقاعدة
4. اختر المنطقة الأقرب (مثل: Europe - Ireland)
5. انقر **Create new project**
6. انتظر 2-3 دقائق حتى ينتهي الإنشاء

## الخطوة 3: الحصول على بيانات الاتصال

1. بعد إنشاء المشروع، اذهب إلى **Settings**
2. انقر **API**
3. انسخ:
   - **Project URL** (SUPABASE_URL)
   - **anon public** key (SUPABASE_KEY)

## الخطوة 4: إنشاء الجداول

1. اذهب إلى **SQL Editor**
2. انقر **New Query**
3. انسخ والصق الكود التالي:

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

4. انقر **Run**

## الخطوة 5: إضافة البيانات التجريبية

1. في **SQL Editor**، انقر **New Query**
2. انسخ والصق الكود التالي:

```sql
INSERT INTO products (name, description, price, category, stock, rating, image) VALUES
('لابتوب HP Pavilion', 'لابتوب قوي للعمل والألعاب', 899.99, 'الحواسيب المحمولة', 15, 4.5, 'https://via.placeholder.com/300?text=HP+Pavilion'),
('سماعات Sony WH-1000XM4', 'سماعات بلوتوث عالية الجودة', 349.99, 'الصوتيات', 20, 4.8, 'https://via.placeholder.com/300?text=Sony+Headphones'),
('كاميرا Canon EOS M50', 'كاميرا احترافية للتصوير', 749.99, 'الكاميرات', 10, 4.6, 'https://via.placeholder.com/300?text=Canon+Camera'),
('هاتف Samsung Galaxy S24', 'هاتف ذكي متقدم', 1199.99, 'الهواتف الذكية', 25, 4.7, 'https://via.placeholder.com/300?text=Samsung+S24'),
('iPad Pro 12.9 inch', 'جهاز لوحي قوي', 1099.99, 'الأجهزة اللوحية', 12, 4.9, 'https://via.placeholder.com/300?text=iPad+Pro'),
('ساعة Apple Watch Series 9', 'ساعة ذكية متقدمة', 399.99, 'الساعات الذكية', 18, 4.8, 'https://via.placeholder.com/300?text=Apple+Watch'),
('جهاز MacBook Pro 14', 'لابتوب احترافي قوي', 1999.99, 'الحواسيب المحمولة', 8, 4.9, 'https://via.placeholder.com/300?text=MacBook+Pro'),
('لوحة مفاتيح Corsair K95', 'لوحة مفاتيح ميكانيكية', 199.99, 'الملحقات', 30, 4.7, 'https://via.placeholder.com/300?text=Corsair+Keyboard'),
('ماوس Logitech MX Master 3S', 'ماوس احترافي لاسلكي', 99.99, 'الملحقات', 40, 4.8, 'https://via.placeholder.com/300?text=Logitech+Mouse'),
('شاشة LG UltraWide 34', 'شاشة عريضة احترافية', 699.99, 'الشاشات', 12, 4.6, 'https://via.placeholder.com/300?text=LG+UltraWide');
```

3. انقر **Run**

## الخطوة 6: حفظ البيانات

احفظ هذه البيانات في مكان آمن:

```
البريد الإلكتروني: allsuu279@gmail.com
SUPABASE_URL: [انسخها من Settings > API]
SUPABASE_KEY: [انسخها من Settings > API]
```

## الخطوة 7: النشر على Vercel

1. اذهب إلى: https://vercel.com
2. انقر **Sign Up** واختر **Continue with GitHub**
3. انقر **Add New Project**
4. اختر `ecommerce-store-live`
5. في **Environment Variables**، أضف:

```
PAYPAL_CLIENT_ID = ATiPDy_Ttg-pmyMxwU_39stpjJo_Dt8Lwi2LJdXpwq0MxfGXicP3lBy2FEcR8u8Ntt-DTK8Zj1glEHU1

PAYPAL_CLIENT_SECRET = EJ0O68o8ss8-eoGQkSPrv8Bt-A85W46ngs4T0f1PJUWNvfrCSJYdAJkF80qAvJ_nTEb7JGGnKrBqkm9a

PAYPAL_MODE = sandbox

SUPABASE_URL = [من Supabase]

SUPABASE_KEY = [من Supabase]

JWT_SECRET = ecommerce_super_secret_key_2024

FRONTEND_URL = https://your-app.vercel.app
```

6. انقر **Deploy**

## انتهى! 🎉

بعد النشر، ستحصل على رابط دائم مثل:
```
https://ecommerce-store-live.vercel.app
```

---

**ملاحظات:**
- الموقع سيعمل بدون قاعدة بيانات في البداية (لكن التسجيل والدخول لن يعملا)
- بعد إنشاء جداول Supabase، كل شيء سيعمل بشكل مثالي
- يمكنك تغيير البيانات التجريبية لاحقاً

