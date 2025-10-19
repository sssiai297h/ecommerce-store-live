require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// JWT Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'لا يوجد توكن' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'التوكن غير صحيح' });
  }
};

// ============ المصادقة (Auth) ============

// التسجيل
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'كلمات المرور غير متطابقة' });
    }

    // التحقق من وجود المستخدم
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل' });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        name,
        email,
        password: hashedPassword
      }])
      .select()
      .single();

    if (error) throw error;

    // إنشاء التوكن
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'تم التسجيل بنجاح',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// تسجيل الدخول
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
    }

    // البحث عن المستخدم
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'بيانات دخول غير صحيحة' });
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'بيانات دخول غير صحيحة' });
    }

    // إنشاء التوكن
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ============ المنتجات (Products) ============

// الحصول على المنتجات
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = supabase.from('products').select('*');

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (sort === 'price_asc') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price_desc') {
      query = query.order('price', { ascending: false });
    } else if (sort === 'rating') {
      query = query.order('rating', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: products, error } = await query;

    if (error) throw error;

    res.json(products || []);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// الحصول على منتج واحد
app.get('/api/products/:id', async (req, res) => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !product) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ============ السلة (Cart) ============

// الحصول على السلة
app.get('/api/cart', verifyToken, async (req, res) => {
  try {
    const { data: cart, error } = await supabase
      .from('cart')
      .select('*, products(*)')
      .eq('user_id', req.userId);

    if (error) throw error;

    res.json(cart || []);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// إضافة منتج إلى السلة
app.post('/api/cart/add', verifyToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // التحقق من المنتج
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'الكمية المطلوبة غير متوفرة' });
    }

    // التحقق من وجود المنتج في السلة
    const { data: existingItem } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', req.userId)
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      // تحديث الكمية
      const { error } = await supabase
        .from('cart')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);

      if (error) throw error;
    } else {
      // إضافة منتج جديد
      const { error } = await supabase
        .from('cart')
        .insert([{
          user_id: req.userId,
          product_id: productId,
          quantity,
          price: product.price
        }]);

      if (error) throw error;
    }

    res.json({ message: 'تمت إضافة المنتج إلى السلة' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// تحديث السلة
app.put('/api/cart/update/:productId', verifyToken, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ message: 'الكمية يجب أن تكون أكبر من صفر' });
    }

    const { error } = await supabase
      .from('cart')
      .update({ quantity })
      .eq('user_id', req.userId)
      .eq('product_id', req.params.productId);

    if (error) throw error;

    res.json({ message: 'تم تحديث السلة' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// حذف من السلة
app.delete('/api/cart/remove/:productId', verifyToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', req.userId)
      .eq('product_id', req.params.productId);

    if (error) throw error;

    res.json({ message: 'تم حذف المنتج من السلة' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ============ الطلبات (Orders) ============

// إنشاء طلب
app.post('/api/orders/create', verifyToken, async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // الحصول على السلة
    const { data: cartItems, error: cartError } = await supabase
      .from('cart')
      .select('*, products(*)')
      .eq('user_id', req.userId);

    if (cartError || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'السلة فارغة' });
    }

    // حساب المجموع
    let totalAmount = 0;
    const items = cartItems.map(item => {
      const itemTotal = item.products.price * item.quantity;
      totalAmount += itemTotal;
      return {
        product_id: item.product_id,
        name: item.products.name,
        price: item.products.price,
        quantity: item.quantity
      };
    });

    // إنشاء الطلب
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: req.userId,
        items,
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        payment_status: 'pending',
        order_status: 'pending'
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    res.status(201).json({
      message: 'تم إنشاء الطلب بنجاح',
      orderId: order.id,
      totalAmount
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// الحصول على الطلبات
app.get('/api/orders', verifyToken, async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(orders || []);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ============ PayPal ============

// الحصول على رمز الوصول
const getPayPalAccessToken = async () => {
  try {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const response = await axios.post(
      `https://api.${process.env.PAYPAL_MODE === 'sandbox' ? 'sandbox.' : ''}paypal.com/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data.access_token;
  } catch (error) {
    throw new Error('فشل الحصول على رمز الوصول من PayPal');
  }
};

// إنشاء عملية دفع
app.post('/api/orders/paypal/create-payment', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.body;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    const accessToken = await getPayPalAccessToken();

    const paymentData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: order.total_amount.toString(),
          breakdown: {
            item_total: {
              currency_code: 'USD',
              value: order.total_amount.toString()
            }
          }
        },
        items: order.items.map(item => ({
          name: item.name,
          unit_amount: {
            currency_code: 'USD',
            value: item.price.toString()
          },
          quantity: item.quantity.toString()
        }))
      }],
      application_context: {
        brand_name: 'متجر المنتجات الإلكترونية',
        locale: 'ar-SA',
        user_action: 'PAY_NOW',
        return_url: `${process.env.FRONTEND_URL}/payment-success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`
      }
    };

    const response = await axios.post(
      `https://api.${process.env.PAYPAL_MODE === 'sandbox' ? 'sandbox.' : ''}paypal.com/v2/checkout/orders`,
      paymentData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      orderId: response.data.id,
      approvalUrl: response.data.links.find(link => link.rel === 'approve').href
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// تأكيد الدفع
app.post('/api/orders/paypal/capture-payment', verifyToken, async (req, res) => {
  try {
    const { paypalOrderId, orderId } = req.body;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    const accessToken = await getPayPalAccessToken();

    const response = await axios.post(
      `https://api.${process.env.PAYPAL_MODE === 'sandbox' ? 'sandbox.' : ''}paypal.com/v2/checkout/orders/${paypalOrderId}/capture`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status === 'COMPLETED') {
      // تحديث الطلب
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'completed',
          order_status: 'processing',
          paypal_transaction_id: response.data.purchase_units[0].payments.captures[0].id
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // تفريغ السلة
      await supabase
        .from('cart')
        .delete()
        .eq('user_id', req.userId);

      res.json({
        message: 'تم الدفع بنجاح',
        order
      });
    } else {
      res.status(400).json({ message: 'فشل الدفع' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ============ الصحة ============

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'الخادم يعمل بشكل صحيح' });
});

// بدء الخادم
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
});

