import React, { useState } from 'react';
import { useAppcontext } from '../context/Appcontext';
import { toast } from 'react-hot-toast';

const Login = ({ onClose, isVendor = false }) => {
  const { setStudent, setseller, storeStudentToken, storeVendorToken, navigate, axios } = useAppcontext();
  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setcontactNumber] = useState("")
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const handleContactNumberChange = (e) => {
    let value = e.target.value;

    // Ensure the user doesn't delete +91 or input anything before it
    if (!value.startsWith('+91')) {
      value = '+91' + value.replace('+91', ''); // Prepend +91 if not already present
    }

    // Only allow up to 10 digits after +91
    if (value.length <= 13) {
      setContactNumber(value);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (state === "register") {
        const endpoint = isVendor ? '/api/Vendor/register' : '/api/Student/register';
        // Make sure contactNumber is included for both student and vendor
        const userData = { name, contactNumber, email, password };
        
        const response = await axios.post(endpoint, userData);
        
        if (response.data.success) {
          toast.success('Account created successfully!');
          setState("login");
          setName("");
          setcontactNumber("");
          setEmail("");
          setPassword("");
        } else {
          setError(response.data.message || "Registration failed");
        }
        return;
      }

      // Login logic
      const endpoint = isVendor ? '/api/Vendor/login' : '/api/Student/login';
      const loginData = { email, password };
      
      const response = await axios.post(endpoint, loginData);
      
      if (response.data.success) {
        // Extract token from response headers or cookies (if available)
        const authHeader = response.headers?.authorization;
        const token = authHeader ? authHeader.split(' ')[1] : null;
        
        // Set user state and navigate to dashboard
        if (isVendor) {
          setseller(response.data.vendor || response.data.seller);
          // Store token in localStorage
          storeVendorToken(token);
          onClose();
          navigate("/vendor/dashboard");
        } else {
          setStudent(response.data.student);
          // Store token in localStorage
          storeStudentToken(token);
          onClose();
          navigate("/student/dashboard");
        }
        toast.success(`Welcome back!`);
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-50 flex items-center justify-center bg-black/50">
      <form
        onSubmit={onSubmitHandler}
        className="relative flex flex-col gap-4 p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white text-sm text-gray-600"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-xl"
        >
          &times;
        </button>

        <p className="text-2xl font-medium text-center w-full">
          <span className="text-indigo-500">{isVendor ? "Vendor" : "Student"}</span>{" "}
          {state === "login" ? "Login" : "Sign Up"}
        </p>

        {state === "register"  && (
          <div className="w-full">
            <p>Name</p>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="Type here"
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
              type="text"
              required
            />
          </div>
        ) }

        {state === "register"  && (
          <div className="w-full">
            <p>Contact Number</p>
            <input
              onChange={(e) => setcontactNumber(e.target.value)}
              value={contactNumber}
              placeholder="Type here"
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
              type="text"
              required
              pattern="^\d{10}$" 
              title="Phone number should exactly contain 10 digits."
            />
          </div>
        ) }

        <div className="w-full">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Type here"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
            type="email"
            required
          />
        </div>

        <div className="w-full">
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Type here"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
            type="password"
            required
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <p>
          {state === "register" ? "Already have an account?" : "Create an account?"}{" "}
          <span
            onClick={() => {
              setState(state === "login" ? "register" : "login");
              setError("");
            }}
            className="text-indigo-500 cursor-pointer"
          >
            Click here
          </span>
        </p>

        

        <button
          type="submit"
          disabled={loading}
          className={`${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600'} transition-all text-white w-full py-2 rounded-md`}
        >
          {loading ? 'Processing...' : (state === "register" ? "Create Account" : "Login")}
        </button>
      </form>
    </div>
  );
};

export default Login;