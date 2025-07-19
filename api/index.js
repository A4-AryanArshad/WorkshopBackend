const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const { storage } = require('../cloudinaryConfig');
const upload = multer({ storage });
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // or your frontend URL
  credentials: true
}));

// MongoDB connection
mongoose.connect(
  'mongodb+srv://aryan:2021cs613@cluster0.o8bu9nt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => console.log('MongoDB connected'))
 .catch(err => console.log(err));

// User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
});
const User = mongoose.model('User', userSchema);

// ServiceImage schema
const serviceImageSchema = new mongoose.Schema({
  userId: String, // Changed from ObjectId to String
  serviceId: String, // Keep as String for consistency
  imageUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});
const ServiceImage = mongoose.model('ServiceImage', serviceImageSchema);

// Booking schema
const bookingSchema = new mongoose.Schema({
  car: {
    make: String,
    model: String,
    year: String,
    registration: String,
  },
  customer: {
    name: String,
    email: String,
    phone: String,
    postcode: String,
    address: String,
  },
  service: {
    label: String,
    sub: String,
  },
  parts: [
    {
      partNumber: String,
      name: String,
      supplier: String,
      cost: String,
      profit: String,
      price: String,
      qty: Number,
    }
  ],
  labourHours: Number,
  labourCost: Number,
  partsCost: Number,
  subtotal: Number,
  vat: Number,
  total: Number,
  date: String,
  time: String, // Ensure time is included
  category: String, // <-- Added category field
});
const Carbooking = mongoose.model('Carbooking', bookingSchema);

// --- PARTS SCHEMA & API ---
const partSchema = new mongoose.Schema({
  partNumber: String,
  name: String,
  supplier: String,
  cost: Number,
  profit: Number,
  price: Number,
  qty: Number,
  booked: String, // or Date if you want
});
const Part = mongoose.model('Part', partSchema);

// Add a new part
app.post('/api/parts', async (req, res) => {
  try {
    const part = new Part(req.body);
    await part.save();
    res.status(201).json(part);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all parts
app.get('/api/parts', async (req, res) => {
  const parts = await Part.find();
  res.json(parts);
});

// Delete a part
app.delete('/api/parts/:id', async (req, res) => {
  await Part.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// POST /api/bookings - Save a new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const booking = new Carbooking(req.body);
    await booking.save();
    res.status(201).json({ message: 'Booking saved!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save booking', details: err });
  }
});

// GET /api/bookings - Get all bookings or filter by registration (case-insensitive)
app.get('/api/bookings', async (req, res) => {
  try {
    const { registration } = req.query;
    let query = {};
    if (registration) {
      query['car.registration'] = { $regex: new RegExp(`^${registration}$`, 'i') };
    }
    const bookings = await Carbooking.find(query).sort({ date: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings', details: err });
  }
});

// GET /api/bookings/:registration - Get bookings for a registration (case-insensitive)
app.get('/api/bookings/:registration', async (req, res) => {
  try {
    const registration = req.params.registration;
    const bookings = await Carbooking.find({
      'car.registration': { $regex: new RegExp(`^${registration}$`, 'i') }
    }).sort({ date: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings', details: err });
  }
});

// Signup route
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Prevent admin registration via signup
    if (email === 'admin1234@gmail.com') {
      return res.status(403).json({ message: 'Cannot register as admin.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role: 'user' });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Admin hardcoded check
    if (email === 'admin1234@gmail.com' && password === 'admin1234') {
      // Check if admin exists in DB, if not, create
      let admin = await User.findOne({ email });
      if (!admin) {
        const hashedPassword = await bcrypt.hash(password, 10);
        admin = new User({ email, password: hashedPassword, role: 'admin' });
        await admin.save();
      }
      const token = jwt.sign({ id: admin._id, role: 'admin' }, 'your_jwt_secret', { expiresIn: '1d' });
      return res.json({ token, role: 'admin' });
    }

    // Normal user login
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, 'your_jwt_secret', { expiresIn: '1d' });
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload endpoint
app.post('/upload-service-image', upload.array('images'), async (req, res) => {
  try {
    console.log("Helloooooooo");
    const { userId, serviceId } = req.body;
    console.log(userId);
    console.log("Service");
    console.log(serviceId);
    if (!userId || !serviceId || !req.files) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const imageDocs = req.files.map(file => ({
      userId,
      serviceId,
      imageUrl: file.path
    }));
    await ServiceImage.insertMany(imageDocs);
    res.status(200).json({ message: 'Images uploaded!', images: imageDocs });
  } catch (err) {
    console.error('UPLOAD ERROR:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message, stack: err.stack });
  }
});

// Example protected route
app.get('/dashboard', (req, res) => {
  res.send('Dashboard - protected route');
});

// DVLA vehicle lookup proxy endpoint
app.post('/api/dvla-lookup', async (req, res) => {
  const { registrationNumber } = req.body;
  try {
    const response = await fetch('https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles', {
      method: 'POST',
      headers: {
        'x-api-key': 'GkkoAz3nZ21HAAz7qC8Cda4CrKLfVONB1yv1FAGJ', // Replace with your real DVLA API key
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ registrationNumber }),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
