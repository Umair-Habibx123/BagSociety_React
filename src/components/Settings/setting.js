import React from "react";
import { Link } from "react-router-dom";

const SettingsPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>

        {/* Personal Information Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Personal information</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              to="/viewProfile"
              className="text-blue-600 hover:underline text-sm"
            >
              View profile
            </Link>
            <Link
              to="/add-address"
              className="text-blue-600 hover:underline text-sm"
            >
              Add address
            </Link>
            <Link
              to="/delete-account"
              className="text-blue-600 hover:underline text-sm"
            >
              Delete account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
