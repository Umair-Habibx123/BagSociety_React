import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth"; // Import Firebase Auth

function EditUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updateMessage, setUpdateMessage] = useState("");
    const [updateError, setUpdateError] = useState("");
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    const auth = getAuth(); // Get the current user
    const currentUserEmail = auth.currentUser?.email;

    // Fetch users with role = "user" or "admin", excluding the current user
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("role", "in", ["user", "admin"])); // Fetch both "user" and "admin"
                const querySnapshot = await getDocs(q);

                const userList = [];
                querySnapshot.forEach((doc) => {
                    if (doc.id !== currentUserEmail) { // Exclude current user
                        userList.push({
                            id: doc.id, // Email as document ID
                            ...doc.data(),
                        });
                    }
                });

                setUsers(userList);
            } catch (error) {
                console.error("Error fetching users: ", error);
            } finally {
                setLoading(false);
            }
        };

        if (currentUserEmail) {
            fetchUsers();
        }
    }, [currentUserEmail]);

    const handleRoleChange = async (email, newRole) => {
        setLoadingUpdate(true);

        try {
            const userDocRef = doc(db, "users", email);
            await updateDoc(userDocRef, { role: newRole });

            console.log(`User role updated: ${email} -> ${newRole}`);

            setUpdateMessage(`User role updated successfully.`);
            setUpdateError("");

            // Update role in local state
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === email ? { ...user, role: newRole } : user
                )
            );
        } catch (error) {
            console.error("Error updating user role:", error);
            setUpdateError("Failed to update user role. Please try again.");
            setUpdateMessage("");
        } finally {
            setLoadingUpdate(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-gray-800 text-white py-4 px-6">
                <h1 className="text-2xl font-semibold text-center">Edit Users</h1>
            </header>

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-300 h-12 w-12"></div>
                    <p className="ml-4 text-gray-600 text-lg">Loading users...</p>
                </div>
            ) : (
                // User List
                <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {users.length > 0 ? (
                            users.map((user) => (
                                <div
                                    key={user.id}
                                    className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
                                >
                                    <img
                                        src={user.profilePic || "https://via.placeholder.com/150"}
                                        alt={user.username || "User"}
                                        className="w-24 h-24 rounded-full mx-auto mb-4"
                                    />
                                    <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
                                        {user.username || "No Username"}
                                    </h2>
                                    <p className="text-gray-600 text-center">{user.id}</p> {/* Email */}

                                    {/* Role Dropdown */}
                                    <div className="flex justify-center mt-4">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            className="block w-1/2 px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring focus:ring-blue-300"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="col-span-4 text-gray-600 text-center">
                                No users available.
                            </p>
                        )}
                    </div>
                </main>
            )}

            {/* Loading Indicator for Role Update */}
            {loadingUpdate && (
                <div className="fixed top-0 left-0 right-0 bg-gray-800 bg-opacity-50 flex items-center justify-center h-screen z-50">
                    <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-300 h-12 w-12"></div>
                    <p className="ml-4 text-white text-lg">Updating user role...</p>
                </div>
            )}

            {/* Display Messages */}
            {updateMessage && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg">
                    {updateMessage}
                </div>
            )}

            {updateError && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg">
                    {updateError}
                </div>
            )}
        </div>
    );
}

export default EditUsers;
