import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

// Add axios interceptor to include token in Authorization header if available
axios.interceptors.request.use(config => {
  const studentToken = localStorage.getItem('studentToken');
  const vendorToken = localStorage.getItem('vendorToken');
  
  if (config.url.includes('/api/Student') && studentToken) {
    config.headers.Authorization = `Bearer ${studentToken}`;
  } else if (config.url.includes('/api/Vendor') && vendorToken) {
    config.headers.Authorization = `Bearer ${vendorToken}`;
  }
  
  return config;
});

export const Appcontext = createContext();

export const Appcontextprovider = ({ children }) => {
  const navigate = useNavigate();

  const [Student, setStudent] = useState(null);
  const [seller, setseller] = useState(null);

  const [isseller, setisseller] = useState(!!seller);
  const [ShowStudentLogin, setShowStudentLogin] = useState(false);
  const [ShowVendorLogin, setShowVendorLogin] = useState(false);
  const [MenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Check student authentication status on app load
    const checkStudentAuth = async () => {
      try {
        const response = await axios.get('/api/Student/is-auth');
        if (response.data.success) {
          setStudent(response.data.student);
        }
      } catch (error) {
        console.log('Student not authenticated');
        // Clear localStorage token if authentication fails
        localStorage.removeItem('studentToken');
      }
    };

    // Check vendor authentication status on app load
    const checkVendorAuth = async () => {
      try {
        const response = await axios.get('/api/Vendor/is-auth');
        if (response.data.success) {
          setseller(response.data.vendor);
        }
      } catch (error) {
        console.log('Vendor not authenticated');
        // Clear localStorage token if authentication fails
        localStorage.removeItem('vendorToken');
      }
    };

    checkStudentAuth();
    checkVendorAuth();
  }, []);

  useEffect(() => {
    setisseller(!!seller);
  }, [seller]);

  const clearStudent = async () => {
    try {
      await axios.get('/api/Student/logout');
      setStudent(null);
      // Remove token from localStorage
      localStorage.removeItem('studentToken');
      navigate("/");
    } catch (error) {
      console.error('Error logging out student:', error);
      // Still remove token and reset state on error
      localStorage.removeItem('studentToken');
      setStudent(null);
    }
  };

  const clearSeller = async () => {
    try {
      await axios.get('/api/Vendor/logout');
      setseller(null);
      // Remove token from localStorage
      localStorage.removeItem('vendorToken');
      navigate("/");
    } catch (error) {
      console.error('Error logging out vendor:', error);
      // Still remove token and reset state on error
      localStorage.removeItem('vendorToken');
      setseller(null);
    }
  };

  const value = {
    navigate,
    Student,
    setStudent: (student) => {
      if (student && seller) clearSeller();
      setStudent(student);
    },
    // Add function to store student token in localStorage
    storeStudentToken: (token) => {
      if (token) {
        localStorage.setItem('studentToken', token);
      }
    },
    seller,
    setseller: (vendor) => {
      if (vendor && Student) clearStudent();
      setseller(vendor);
    },
    // Add function to store vendor token in localStorage
    storeVendorToken: (token) => {
      if (token) {
        localStorage.setItem('vendorToken', token);
      }
    },
    isseller,
    setisseller,
    ShowStudentLogin,
    setShowStudentLogin,
    ShowVendorLogin,
    setShowVendorLogin,
    MenuOpen,
    setMenuOpen,
    axios,
    logout: async () => {
      if (Student) await clearStudent();
      if (seller) await clearSeller();
    }
  };

  return (
    <Appcontext.Provider value={value}>
      {children}
    </Appcontext.Provider>
  );
};

export const useAppcontext = () => {
  return useContext(Appcontext);
};
