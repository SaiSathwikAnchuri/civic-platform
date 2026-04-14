const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const { initSocket } = require('./socket/socketManager');
const User = require('./models/User'); // Required for auto-init
const bcrypt = require('bcryptjs');

// Auto-initialize Default Admin from .env if missing
const initAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@demo.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', salt);
      await User.create({
        name: process.env.ADMIN_NAME || 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
      });
      console.log(`✅ Default Admin Initialized: ${adminEmail}`);
    }
  } catch (err) { console.error('Admin Init Failed', err); }
};

// Connect to MongoDB
connectDB().then(() => initAdmin());

// Route imports
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Init Socket.io
initSocket(server);

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://127.0.0.1:5173',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
  ],
  credentials: true,
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Body Parsing & Static Files
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Civic Complaint API is running 🚀', timestamp: new Date() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  // Cloudinary and some libs throw plain objects, not Error instances
  const message = err?.message || (typeof err === 'string' ? err : 'Internal Server Error');
  
  // Use util.inspect or just basic string to prevent circular reference crashes
  const requireUtil = require('util');
  const stack = err?.stack || requireUtil.inspect(err);
  
  let status  = err?.statusCode || err?.http_code || 500;
  
  // Cloudinary Auth errors throw 401, which triggers our JWT interceptor on the frontend
  if (status === 401 && message.toLowerCase().includes('api_key')) status = 500;
  if (status === 401 && !message.toLowerCase().includes('token')) status = 500; 

  console.error('Global Error:', message);
  if (process.env.NODE_ENV !== 'production') console.error(stack);
  res.status(status).json({ success: false, message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
