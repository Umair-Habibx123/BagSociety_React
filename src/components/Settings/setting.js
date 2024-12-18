// import React from "react";
// import { Link } from "react-router-dom";

// const SettingsPage = () => {
//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
//         <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>

//         {/* Personal Information Section */}
//         <div className="mb-6">
//           <h3 className="text-lg font-semibold text-gray-700 mb-4">Personal information</h3>
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//             <Link
//               to="/viewProfile"
//               className="text-blue-600 hover:underline text-sm"
//             >
//               View profile
//             </Link>
//             <Link
//               to="/add-address"
//               className="text-blue-600 hover:underline text-sm"
//             >
//               Add address
//             </Link>
//             <Link
//               to="/delete-account"
//               className="text-blue-600 hover:underline text-sm"
//             >
//               Delete account
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SettingsPage;


import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, deleteUser, onAuthStateChanged } from "firebase/auth";
import { doc, deleteDoc, getFirestore } from "firebase/firestore";
import Swal from "sweetalert2";

const SettingsPage = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();
  const [currentUser, setCurrentUser] = React.useState(null);

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        Swal.fire("Error", "No user is logged in!", "error");
        navigate("/login"); // Redirect to login if no user is logged in
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  const handleDeleteAccount = async () => {
    if (!currentUser) {
      Swal.fire("Error", "No user is logged in!", "error");
      return;
    }

    // Show confirmation dialog
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Deleting your account will remove all your order details, account information, and addresses. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete my account",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      // Show loading indicator while processing the deletion
      Swal.fire({
        title: "Deleting your account...",
        text: "Please wait while we delete your account and data.",
        icon: "info",
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        // Delete user data from Firestore
        await deleteDoc(doc(db, "users", currentUser.email));
        await deleteDoc(doc(db, "userCart", currentUser.email));

        // Delete user from Firebase Authentication
        await deleteUser(currentUser);

        // Show success message and navigate to the home page
        Swal.fire("Deleted!", "Your account has been successfully deleted.", "success");
        navigate("/"); // Redirect to home page after deletion
      } catch (error) {
        console.error("Error deleting account:", error);
        Swal.fire("Error", "Failed to delete your account. Please try again later.", "error");
      }
    }
  };

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
            <button
              onClick={handleDeleteAccount}
              className="text-red-600 hover:underline text-sm"
            >
              Delete account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

