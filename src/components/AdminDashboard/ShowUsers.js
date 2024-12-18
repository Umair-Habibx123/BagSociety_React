// import React, { useEffect, useState } from "react";
// import { collection, getDocs, query, where } from "firebase/firestore";
// import { db } from "../../firebase";

// function ShowUsers() {
//     const [users, setUsers] = useState([]);
//     const [loading, setLoading] = useState(true);

//     // Fetch users with role = "user"
//     useEffect(() => {
//         const fetchUsers = async () => {
//             try {
//                 const usersRef = collection(db, "users"); // Reference to the 'users' collection
//                 const q = query(usersRef, where("role", "==", "user")); // Filter for role === 'user'
//                 const querySnapshot = await getDocs(q);

//                 const userList = [];
//                 querySnapshot.forEach((doc) => {
//                     // Push the document's ID (email) and its fields
//                     userList.push({
//                         id: doc.id, // Email as the document ID
//                         ...doc.data(), // Other fields like username, profilePic
//                     });
//                 });

//                 setUsers(userList);
//             } catch (error) {
//                 console.error("Error fetching users: ", error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchUsers();
//     }, []);

//     return (
//         <div className="min-h-screen bg-gray-100">
//             {/* Header */}
//             <header className="bg-gray-800 text-white py-4 px-6">
//                 <h1 className="text-2xl font-semibold text-center">Show Users</h1>
//             </header>

//             {/* Loading State */}
//             {loading ? (
//                 <div className="flex items-center justify-center py-20">
//                     <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-300 h-12 w-12"></div>
//                     <p className="ml-4 text-gray-600 text-lg">Loading users...</p>
//                 </div>
//             ) : (
//                 // User List
//                 <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                         {users.length > 0 ? (
//                             users.map((user) => (
//                                 <div
//                                     key={user.id}
//                                     className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
//                                 >
//                                     <img
//                                         src={user.profilePic || "https://via.placeholder.com/150"}
//                                         alt={user.username || "User"}
//                                         className="w-24 h-24 rounded-full mx-auto mb-4"
//                                     />
//                                     <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
//                                         {user.username || "No Username"}
//                                     </h2>
//                                     <p className="text-gray-600 text-center">{user.id}</p> {/* Email */}
//                                 </div>
//                             ))
//                         ) : (
//                             <p className="col-span-4 text-gray-600 text-center">
//                                 No users available.
//                             </p>
//                         )}
//                     </div>
//                 </main>
//             )}
//         </div>
//     );
// }

// export default ShowUsers;

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { FaTrashAlt } from "react-icons/fa"; // Import the delete icon from react-icons

function ShowUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false); // Loading state for deletion
    const [deletionMessage, setDeletionMessage] = useState(""); // Message after deletion

    // Fetch users with role = "user"
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("role", "==", "user"));
                const querySnapshot = await getDocs(q);

                const userList = [];
                querySnapshot.forEach((doc) => {
                    userList.push({
                        id: doc.id,
                        ...doc.data(),
                    });
                });

                setUsers(userList);
            } catch (error) {
                console.error("Error fetching users: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Handle user deletion
    const handleDeleteUser = async (userId, email) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this user?");

        if (!confirmDelete) return;

        setIsDeleting(true); // Set loading state while deleting
        setDeletionMessage(""); // Reset any previous message

        try {
            // Send a request to the backend to delete the user
            const response = await fetch("http://localhost:5000/delete-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: email }), // Use email instead of userId
            });

            const data = await response.json();
            if (response.ok) {
                // Optionally, remove the user from the state to reflect the change immediately
                setUsers(users.filter((user) => user.id !== userId));
                setDeletionMessage(`User ${email} deleted successfully.`); // Success message
            } else {
                setDeletionMessage(`Error: ${data.error}`); // Error message
            }
        } catch (error) {
            console.error("Error deleting user: ", error);
            setDeletionMessage("Error deleting user.");
        } finally {
            setIsDeleting(false); // Reset loading state
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-gray-800 text-white py-4 px-6">
                <h1 className="text-2xl font-semibold text-center">Show Users</h1>
            </header>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-300 h-12 w-12"></div>
                    <p className="ml-4 text-gray-600 text-lg">Loading users...</p>
                </div>
            ) : (
                <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {users.length > 0 ? (
                            users.map((user) => (
                                <div
                                    key={user.id}
                                    className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition relative"
                                >
                                    <img
                                        src={user.profilePic || "https://via.placeholder.com/150"}
                                        alt={user.username || "User"}
                                        className="w-24 h-24 rounded-full mx-auto mb-4"
                                    />
                                    <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
                                        {user.username || "No Username"}
                                    </h2>
                                    <p className="text-gray-600 text-center">{user.id}</p>

                                    {/* Delete icon */}
                                    {/* <button
                                        onClick={() => handleDeleteUser(user.id, user.id)}
                                        className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                                        disabled={isDeleting}
                                    >
                                        <FaTrashAlt size={20} />
                                    </button> */}
                                </div>
                            ))
                        ) : (
                            <p className="col-span-4 text-gray-600 text-center">No users available.</p>
                        )}
                    </div>
                </main>
            )}

            {isDeleting && (
                <div className="flex items-center justify-center py-4">
                    <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-300 h-12 w-12"></div>
                    <p className="ml-4 text-gray-600 text-lg">Deleting user...</p>
                </div>
            )}

            {deletionMessage && (
                <div className="py-4 text-center text-lg font-semibold text-green-600">
                    {deletionMessage}
                </div>
            )}
        </div>
    );
}

export default ShowUsers;
