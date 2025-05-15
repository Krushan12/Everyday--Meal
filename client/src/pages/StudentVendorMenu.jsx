import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppcontext } from "../context/Appcontext";
import { assets } from "../assets/assets";
import { toast } from "react-hot-toast";

const capitalize = (str = "") =>
    str
      .split(" ")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
      .join(" ");

const StudentVendorMenu = () => {
  const { vendorEmail } = useParams();
  const [menu, setMenu] = useState(null);
  const [vendorName, setVendorName] = useState("");
  const [loading, setLoading] = useState(true);
  const { axios } = useAppcontext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenu = async () => {
      if (!vendorEmail) {
        navigate('/student/dashboard');
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`/api/Vendor/menu/${encodeURIComponent(vendorEmail)}`);
        
        if (response.data.success && response.data.data) {
          setMenu(response.data.data);
          setVendorName(response.data.data.vendorName || '');
        } else {
          toast.error(response.data.message || 'Failed to fetch menu');
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
        toast.error('Could not load menu. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [vendorEmail, axios, navigate]);

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
              {/* Fixed Background Image */}
              <img
                src={assets.bg}
                alt="Background"
                className="fixed top-0 left-0 w-full h-full object-cover z-[-1] animate-slow-spin"
              />
    
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-indigo-700 text-center mb-6">
          {capitalize(vendorName)} (Menu)
        </h1>

        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="ml-3 text-lg text-gray-600">Loading menu...</p>
          </div>
        ) : !menu ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No menu found for this vendor.</p>
            <button 
              onClick={() => navigate('/student/dashboard')}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <p className="text-gray-600 font-bold text-xl">Day: {menu.day}</p>
              <p className="text-gray-600 font-bold text-md">Date: {menu.date}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(menu.meals).map(([meal, data]) => (
                <div
                  key={meal}
                  className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm"
                >
                  <h3 className="text-xl font-bold capitalize text-indigo-600 mb-2">{meal}</h3>
                  <p className="text-gray-700"><strong>Items:</strong> {data.items || 'Not specified'}</p>
                  <p className="text-gray-700"><strong>Start:</strong> {data.startTime || 'Not specified'}</p>
                  <p className="text-gray-700"><strong>End:</strong> {data.endTime || 'Not specified'}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button 
                onClick={() => navigate('/student/dashboard')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md"
              >
                Back to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentVendorMenu;
