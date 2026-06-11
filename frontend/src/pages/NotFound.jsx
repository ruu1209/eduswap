import React from "react";
import { Link, useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const isUnauthorized = location.state?.unauthorized;
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10" data-testid="notfound-page">
      <div className="text-center max-w-lg">
        <p className="text-7xl sm:text-8xl font-black tracking-tight">
          {isUnauthorized ? "401" : "404"}
        </p>
        <h1 className="text-2xl font-bold mt-2">
          {isUnauthorized ? "Not allowed here" : "Page not found"}
        </h1>
        <p className="text-[#4B5563] mt-2">
          {isUnauthorized
            ? "Only verified VIT students can access this page."
            : "The page you're looking for doesn't exist or has been moved."}
        </p>
        <Link to="/" className="mt-6 inline-block bg-black text-white border-2 border-black rounded-md px-6 py-3 font-bold uppercase tracking-wider hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(167,243,208,1)]">
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
