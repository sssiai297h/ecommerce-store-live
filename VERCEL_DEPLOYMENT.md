# نشر الموقع على Vercel 🚀

تم إعداد المشروع للنشر على Vercel. اتبع الخطوات التالية:

## الخطوة 1: الذهاب إلى Vercel

1. اذهب إلى: https://vercel.com
2. انقر **Sign Up** (إنشاء حساب)
3. اختر **Continue with GitHub**
4. وافق على الأذونات

## الخطوة 2: استيراد المشروع

1. في لوحة تحكم Vercel، انقر **Add New Project**
2. اختر **Import Git Repository**
3. ابحث عن `ecommerce-store-live`
4. انقر **Import**

## الخطوة 3: إضافة متغيرات البيئة

في صفحة الإعدادات، اذهب إلى **Environment Variables** وأضف:

```
PAYPAL_CLIENT_ID = ATiPDy_Ttg-pmyMxwU_39stpjJo_Dt8Lwi2LJdXpwq0MxfGXicP3lBy2FEcR8u8Ntt-DTK8Zj1glEHU1

PAYPAL_CLIENT_SECRET = EJ0O68o8ss8-eoGQkSPrv8Bt-A85W46ngs4T0f1PJUWNvfrCSJYdAJkF80qAvJ_nTEb7JGGnKrBqkm9a

PAYPAL_MODE = sandbox

SUPABASE_URL = https://your-project.supabase.co

SUPABASE_KEY = your-anon-key

JWT_SECRET = ecommerce_super_secret_key_2024_change_in_production

FRONTEND_URL = https://your-app.vercel.app
```

## الخطوة 4: النشر

1. انقر **Deploy**
2. انتظر حتى ينتهي النشر (عادة 2-3 دقائق)
3. ستحصل على رابط دائم مثل: `https://ecommerce-store-live.vercel.app`

## الخطوة 5: إعداد Supabase

### إنشاء الجداول

في لوحة تحكم Supabase، قم بتنفيذ:

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

### إضافة بيانات تجريبية

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

## الخطوة 6: الاختبار

بعد النشر:

1. افتح الرابط الدائم
2. اختبر التسجيل والدخول
3. اختبر إضافة المنتجات إلى السلة
4. اختبر عملية الشراء

## معلومات مهمة

### رابط المستودع:
```
https://github.com/sssiai297h/ecommerce-store-live
```

### رابط Vercel:
```
سيكون متاحاً بعد النشر
```

### متغيرات البيئة المطلوبة:
- ✅ PAYPAL_CLIENT_ID
- ✅ PAYPAL_CLIENT_SECRET
- ✅ PAYPAL_MODE
- ✅ SUPABASE_URL
- ✅ SUPABASE_KEY
- ✅ JWT_SECRET
- ✅ FRONTEND_URL

## استكشاف الأخطاء

### إذا حدث خطأ في النشر:

1. **تحقق من السجلات**
   - في Vercel: انقر على المشروع ثم "Deployments"
   - ابحث عن الخطأ في السجل

2. **تحقق من متغيرات البيئة**
   - تأكد من أن جميع المتغيرات موجودة
   - تأكد من عدم وجود مسافات إضافية

3. **تحقق من Supabase**
   - تأكد من أن الجداول موجودة
   - تأكد من أن البيانات صحيحة

## الخطوات التالية

بعد النشر الناجح:

1. **تخصيص الموقع**
   - غيّر الألوان والتصميم
   - أضف شعارك الخاص

2. **إضافة نطاق مخصص**
   - في Vercel: اذهب إلى Settings > Domains
   - أضف نطاقك الخاص

3. **تحسين الأداء**
   - استخدم CDN
   - أضف التخزين المؤقت

4. **زيادة الأمان**
   - غيّر JWT_SECRET
   - استخدم HTTPS (مدمج في Vercel)

---

**تهانينا! موقعك الآن منشور بشكل دائم!** 🎉

