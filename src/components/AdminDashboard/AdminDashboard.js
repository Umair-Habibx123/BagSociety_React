import React from "react";
import { Link } from "react-router-dom";

function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-800 text-white py-4 px-6">
        <h1 className="text-2xl font-semibold text-center">Admin Dashboard</h1>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Show Users */}
          <Link to="/admin-dashboard/showUsers">
            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition text-center">
              <h2 className="text-xl font-bold mb-2 text-gray-800">Show Users</h2>
              <p className="text-gray-600">View a list of all registered users.</p>
            </div>
          </Link>

          {/* Show/Edit Products */}
          <Link to="/admin-dashboard/showProducts">
            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition text-center">
              <h2 className="text-xl font-bold mb-2 text-gray-800">Show/Edit Products</h2>
              <p className="text-gray-600">View and Update product information of products.</p>
            </div>
          </Link>

          <Link to="/admin-dashboard/addNewProducts">
            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition text-center">
              <h2 className="text-xl font-bold mb-2 text-gray-800">Add New Products</h2>
              <p className="text-gray-600">Add new Product on Shop.</p>
            </div>
          </Link>

          {/* Edit Users */}
          <Link to="/admin-dashboard/editUsers">
            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition text-center">
              <h2 className="text-xl font-bold mb-2 text-gray-800">Edit Roles</h2>
              <p className="text-gray-600">Modify user and admins roles.</p>
            </div>
          </Link>

        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
