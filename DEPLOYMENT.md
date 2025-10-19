# دليل النشر والتشغيل الدائم

## 🎉 المتجر الإلكتروني جاهز للنشر!

تم إنشاء متجر إلكتروني متكامل مع جميع الميزات المطلوبة. الآن يمكنك نشره بشكل دائم على الإنترنت.

## الرابط المؤقت للاختبار

```
https://3000-i0plgvw1cn89afwpqexd8-9bf3acd2.manusvm.computer
```

**ملاحظة:** هذا الرابط مؤقت للاختبار فقط. للنشر الدائم، اتبع الخطوات أدناه.

## خيارات النشر الدائم 🚀

### الخيار 1: Vercel (الأفضل والأسهل)

Vercel هي منصة نشر متخصصة في تطبيقات Node.js وتوفر:
- نشر مجاني
- أداء عالي جداً
- دعم متغيرات البيئة
- نطاق مجاني

#### الخطوات:

1. **إنشاء حساب Vercel**
   - اذهب إلى https://vercel.com
   - انقر "Sign Up"
   - استخدم حساب GitHub أو البريد الإلكتروني

2. **ربط مستودع GitHub**
   - ادفع المشروع إلى GitHub
   - في Vercel، انقر "New Project"
   - اختر المستودع

3. **إضافة متغيرات البيئة**
   - في إعدادات المشروع، اذهب إلى "Environment Variables"
   - أضف:
     ```
     PAYPAL_CLIENT_ID = ATiPDy_Ttg-pmyMxwU_39stpjJo_Dt8Lwi2LJdXpwq0MxfGXicP3lBy2FEcR8u8Ntt-DTK8Zj1glEHU1
     PAYPAL_CLIENT_SECRET = EJ0O68o8ss8-eoGQkSPrv8Bt-A85W46ngs4T0f1PJUWNvfrCSJYdAJkF80qAvJ_nTEb7JGGnKrBqkm9a
     PAYPAL_MODE = sandbox
     SUPABASE_URL = [رابط Supabase]
     SUPABASE_KEY = [مفتاح Supabase]
     JWT_SECRET = [مفتاح سري قوي]
     FRONTEND_URL = [رابط التطبيق على Vercel]
     ```

4. **النشر**
   - انقر "Deploy"
   - سينتظر حتى يكتمل النشر
   - ستحصل على رابط دائم مثل: `https://your-app.vercel.app`

### الخيار 2: Heroku

Heroku توفر نشر سهل لكن قد تكون أبطأ قليلاً:

#### الخطوات:

1. **إنشاء حساب Heroku**
   - اذهب إلى https://www.heroku.com
   - انقر "Sign Up"

2. **تثبيت Heroku CLI**
   ```bash
   # على Mac
   brew tap heroku/brew && brew install heroku

   # على Windows
   # حمّل من: https://devcenter.heroku.com/articles/heroku-cli

   # على Linux
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

3. **تسجيل الدخول**
   ```bash
   heroku login
   ```

4. **إنشاء التطبيق**
   ```bash
   heroku create your-app-name
   ```

5. **إضافة متغيرات البيئة**
   ```bash
   heroku config:set PAYPAL_CLIENT_ID=ATiPDy_Ttg-pmyMxwU_39stpjJo_Dt8Lwi2LJdXpwq0MxfGXicP3lBy2FEcR8u8Ntt-DTK8Zj1glEHU1
   heroku config:set PAYPAL_CLIENT_SECRET=EJ0O68o8ss8-eoGQkSPrv8Bt-A85W46ngs4T0f1PJUWNvfrCSJYdAJkF80qAvJ_nTEb7JGGnKrBqkm9a
   heroku config:set PAYPAL_MODE=sandbox
   heroku config:set SUPABASE_URL=[رابط Supabase]
   heroku config:set SUPABASE_KEY=[مفتاح Supabase]
   heroku config:set JWT_SECRET=[مفتاح سري]
   ```

6. **النشر**
   ```bash
   git push heroku main
   ```

### الخيار 3: Railway

Railway توفر نشر سهل وسريع:

#### الخطوات:

1. **إنشاء حساب Railway**
   - اذهب إلى https://railway.app
   - انقر "Start Project"

2. **ربط GitHub**
   - اختر "Deploy from GitHub"
   - اختر المستودع

3. **إضافة متغيرات البيئة**
   - في لوحة التحكم، اذهب إلى "Variables"
   - أضف جميع متغيرات البيئة

4. **النشر**
   - سينشر تلقائياً عند كل push إلى GitHub

## إعداد Supabase للإنتاج 🗄️

### إنشاء جداول قاعدة البيانات

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

### إضافة بيانات تجريبية

```sql
INSERT INTO products (name, description, price, category, stock, rating, image) VALUES
('لابتوب HP Pavilion', 'لابتوب قوي للعمل والألعاب', 899.99, 'الحواسيب المحمولة', 15, 4.5, 'https://via.placeholder.com/300?text=HP+Pavilion'),
('سماعات Sony WH-1000XM4', 'سماعات بلوتوث عالية الجودة', 349.99, 'الصوتيات', 20, 4.8, 'https://via.placeholder.com/300?text=Sony+Headphones'),
('كاميرا Canon EOS M50', 'كاميرا احترافية للتصوير', 749.99, 'الكاميرات', 10, 4.6, 'https://via.placeholder.com/300?text=Canon+Camera'),
('هاتف Samsung Galaxy S24', 'هاتف ذكي متقدم', 1199.99, 'الهواتف الذكية', 25, 4.7, 'https://via.placeholder.com/300?text=Samsung+S24'),
('iPad Pro 12.9 inch', 'جهاز لوحي قوي', 1099.99, 'الأجهزة اللوحية', 12, 4.9, 'https://via.placeholder.com/300?text=iPad+Pro');
```

## تحديث PayPal للإنتاج 💳

عندما تكون جاهزاً للإنتاج الحقيقي:

1. اذهب إلى [PayPal Developer](https://developer.paypal.com)
2. انتقل من Sandbox إلى Live
3. احصل على Client ID و Secret الحقيقيين
4. غيّر `PAYPAL_MODE` من `sandbox` إلى `live`
5. حدّث متغيرات البيئة

## اختبار التطبيق 🧪

بعد النشر، اختبر:

1. **التسجيل والدخول**
   - سجل حساباً جديداً
   - سجل الدخول

2. **التسوق**
   - استعرض المنتجات
   - أضف منتجات إلى السلة
   - تحقق من السلة

3. **الدفع**
   - أكمل عملية الشراء
   - اختبر الدفع عبر PayPal

## الأداء والأمان 🔒

### نصائح الأداء:

1. **استخدم CDN**
   - Vercel و Railway يوفران CDN مدمج

2. **تحسين الصور**
   - استخدم صور مضغوطة
   - استخدم Webp format

3. **التخزين المؤقت**
   - أضف caching headers
   - استخدم Redis للجلسات

### نصائح الأمان:

1. **غيّر JWT_SECRET**
   - استخدم مفتاح قوي عشوائي

2. **استخدم HTTPS**
   - جميع منصات النشر توفر HTTPS مجاني

3. **حماية البيانات الحساسة**
   - لا تضع بيانات حساسة في الكود
   - استخدم متغيرات البيئة فقط

4. **تحديث المكتبات**
   ```bash
   pnpm update
   ```

## المراقبة والصيانة 📊

### تتبع الأخطاء:

استخدم خدمات مثل:
- **Sentry** - لتتبع الأخطاء
- **LogRocket** - لتسجيل الجلسات
- **New Relic** - للمراقبة الشاملة

### النسخ الاحتياطية:

1. **قاعدة البيانات**
   - Supabase يوفر نسخ احتياطية تلقائية

2. **الملفات**
   - استخدم S3 أو Supabase Storage

## الدعم والمساعدة 💬

إذا واجهت مشاكل:

1. **تحقق من السجلات**
   - في Vercel: "Logs"
   - في Heroku: `heroku logs --tail`

2. **تحقق من متغيرات البيئة**
   - تأكد من أن جميع المتغيرات موجودة

3. **اختبر محلياً أولاً**
   - تأكد من أن التطبيق يعمل على جهازك

4. **اطلب الدعم**
   - توثيق Vercel: https://vercel.com/docs
   - توثيق Heroku: https://devcenter.heroku.com
   - توثيق Supabase: https://supabase.com/docs

## الخطوات التالية 🎯

بعد النشر:

1. **تخصيص المتجر**
   - أضف شعارك
   - غيّر الألوان والتصميم
   - أضف منتجاتك الحقيقية

2. **إضافة ميزات جديدة**
   - نظام التقييمات
   - نظام الخصومات
   - البريد الإلكتروني

3. **تحسين التسويق**
   - SEO
   - Analytics
   - Social Media

4. **زيادة الأمان**
   - 2FA
   - SSL Certificate
   - Rate Limiting

---

**تهانينا! متجرك الإلكتروني الآن جاهز للعالم!** 🌍✨

