// authController.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Student from '../models/Student.js'; // ✅ Correct import only once

// ✅ Register Controller
export const register = async (req, res) => {
  try {
    const { name, email, password, contactNumber } = req.body;

    if (!name || !email || !password || !contactNumber) {
      return res.json({ success: false, message: 'Missing details' });
    }

    const existingStudent = await Student.findOne({ email }); // ✅ Use correct model name

    if (existingStudent)
      return res.json({ success: false, message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({ name, email, password: hashedPassword, contactNumber }); // ✅ lowercase variable

    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.cookie('Studentlogintoken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, student: { email: student.email, name: student.name } });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.json({ success: false, message: 'Email and password are required' });

    const student = await Student.findOne({ email }); // ✅ Correct model
    if (!student) {
      return res.json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid email or password' });h
      
    }

    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.cookie('Studentlogintoken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, student: { email: student.email, name: student.name } });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ✅ isAuth Controller
export const isAuth = async (req, res) => {
  try {
    const student = await Student.findById(req.StudentId).select('-password');
    return res.json({ success: true, student });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Logout Controller
export const logout = async (req, res) => {
  try {
    res.clearCookie('Studentlogintoken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });

    return res.json({ success: true, message: 'Logged Out' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get all vendors who have menus
export const getVendorsWithMenus = async (req, res) => {
  try {
    // Import the models we need
    const Menu = (await import('../models/Menu.js')).default;
    const Vendor = (await import('../models/Vendor.js')).default;
    
    // Find all unique vendor emails from the menus collection
    const menus = await Menu.find().select('vendorEmail vendorName').lean();
    
    if (!menus || menus.length === 0) {
      return res.json({ success: true, vendors: [] });
    }
    
    // Extract unique vendors
    const uniqueVendors = [];
    const vendorEmailSet = new Set();
    
    menus.forEach(menu => {
      if (menu.vendorEmail && !vendorEmailSet.has(menu.vendorEmail)) {
        vendorEmailSet.add(menu.vendorEmail);
        uniqueVendors.push({
          email: menu.vendorEmail,
          name: menu.vendorName || 'Unknown Vendor'
        });
      }
    });
    
    return res.json({ success: true, vendors: uniqueVendors });
  } catch (error) {
    console.error('Error fetching vendors with menus:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
