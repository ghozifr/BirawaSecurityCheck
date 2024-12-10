import React from 'react';
import { useNavigate } from 'react-router-dom';
const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-2xl text-gray-600 mb-8">Oops! Page Not Found</p>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={goHome}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition duration-200"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
};

export default NotFound;
