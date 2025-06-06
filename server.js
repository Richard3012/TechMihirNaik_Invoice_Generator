const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

// Connect to MongoDB - replace <your-db-name> with actual DB name
mongoose.connect('mongodb://localhost:27017/your-db-name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define User schemas
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// Models for customer and vendor collections
const Customer = mongoose.model('Customer', userSchema, 'customers');
const Vendor = mongoose.model('Vendor', userSchema, 'vendors');

// POST /login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Try customer
    const customer = await Customer.findOne({ email, password });
    if (customer) {
      // Optionally set session here: req.session.user = customer;
      return res.json({ success: true, redirectUrl: '/customer_dashboard.html' });
    }

    // Try vendor
    const vendor = await Vendor.findOne({ email, password });
    if (vendor) {
      // Optionally set session here: req.session.user = vendor;
      return res.json({ success: true, redirectUrl: '/vendor_dashboard.html' });
    }

    // Not found
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Serve static frontend files from /public folder
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
