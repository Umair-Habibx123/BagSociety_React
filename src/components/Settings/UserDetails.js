// import React, { useState, useEffect } from "react";
// import { doc, getDoc, updateDoc } from "firebase/firestore";
// import { onAuthStateChanged } from "firebase/auth"; // Firebase auth function
// import { auth, db } from "../../firebase"; // Replace with your Firebase configuration file

// const UserDetails = () => {
//     const [userEmail, setUserEmail] = useState(null);
//     const [userData, setUserData] = useState(null);
//     const [username, setUsername] = useState("");
//     const [isEditing, setIsEditing] = useState(false);
//     const [loading, setLoading] = useState(true);

//     // Get user email from Firebase Authentication
//     useEffect(() => {
//         const unsubscribe = onAuthStateChanged(auth, (user) => {
//             if (user) {
//                 setUserEmail(user.email); // Set the email of the logged-in user
//             } else {
//                 console.error("No user is signed in");
//             }
//         });

//         return () => unsubscribe(); // Cleanup subscription on component unmount
//     }, []);

//     // Fetch user details from Firestore
//     useEffect(() => {
//         if (!userEmail) return;

//         const fetchUserData = async () => {
//             try {
//                 const docRef = doc(db, "users", userEmail); // Use userEmail as the document ID
//                 const docSnap = await getDoc(docRef);

//                 if (docSnap.exists()) {
//                     const data = docSnap.data();
//                     setUserData(data);
//                     setUsername(data.username);
//                 } else {
//                     console.error("No such document!");
//                 }
//             } catch (error) {
//                 console.error("Error fetching user data: ", error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchUserData();
//     }, [userEmail]);

//     // Update username in Firestore
//     const handleUsernameUpdate = async () => {
//         if (!username.trim()) {
//             alert("Username cannot be empty");
//             return;
//         }

//         try {
//             const docRef = doc(db, "users", userEmail);
//             await updateDoc(docRef, { username });
//             alert("Username updated successfully");
//             setIsEditing(false);
//         } catch (error) {
//             console.error("Error updating username: ", error);
//         }
//     };

//     if (loading) return <p>Loading...</p>;
//     if (!userData) return <p>User not found</p>;

//     return (
//         <div className="min-h-screen bg-gray-100 p-6">
//             <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6">
//                 <h2 className="text-2xl font-bold text-gray-800 mb-6">User Details</h2>

//                 <div className="flex items-center space-x-4 mb-6">
//                     {/* User Profile Picture */}
//                     <img
//                         src={userData.profilePic || "https://via.placeholder.com/100"}
//                         alt="Profile"
//                         className="w-24 h-24 rounded-full shadow-md"
//                     />
//                     <div>
//                         <h3 className="text-lg font-semibold">{userData.username}</h3>
//                         <p className="text-sm text-gray-600">{userData.email}</p>
//                     </div>
//                 </div>

//                 {/* Edit Username Section */}
//                 <div className="mb-6">
//                     <label className="block text-gray-700 text-sm mb-2">Username</label>
//                     {isEditing ? (
//                         <div className="flex space-x-4">
//                             <input
//                                 type="text"
//                                 value={username}
//                                 onChange={(e) => setUsername(e.target.value)}
//                                 className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                             <button
//                                 onClick={handleUsernameUpdate}
//                                 className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
//                             >
//                                 Save
//                             </button>
//                             <button
//                                 onClick={() => setIsEditing(false)}
//                                 className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
//                             >
//                                 Cancel
//                             </button>
//                         </div>
//                     ) : (
//                         <div className="flex justify-between items-center">
//                             <p className="text-gray-700">{username}</p>
//                             <button
//                                 onClick={() => setIsEditing(true)}
//                                 className="text-blue-600 hover:underline"
//                             >
//                                 Edit
//                             </button>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default UserDetails;


import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth"; // Firebase auth function
import { auth, db } from "../../firebase"; // Replace with your Firebase configuration file

const UserDetails = () => {
    const [userEmail, setUserEmail] = useState(null);
    const [userData, setUserData] = useState(null);
    const [username, setUsername] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Get user email from Firebase Authentication
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email); // Set the email of the logged-in user
            } else {
                console.error("No user is signed in");
            }
        });

        return () => unsubscribe(); // Cleanup subscription on component unmount
    }, []);

    // Fetch user details from Firestore
    useEffect(() => {
        if (!userEmail) return;

        const fetchUserData = async () => {
            try {
                const docRef = doc(db, "users", userEmail); // Use userEmail as the document ID
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData(data);
                    setUsername(data.username);
                } else {
                    console.error("No such document!");
                }
            } catch (error) {
                console.error("Error fetching user data: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userEmail]);

    // Update username in Firestore
    const handleUsernameUpdate = async () => {
        if (!username.trim()) {
            alert("Username cannot be empty");
            return;
        }

        try {
            const docRef = doc(db, "users", userEmail);
            await updateDoc(docRef, { username });
            alert("Username updated successfully");
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating username: ", error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }
    if (!userData) return <p>User not found</p>;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">User Details</h2>

                <div className="flex items-center space-x-4 mb-6">
                    {/* User Profile Picture */}
                    <img
                        src={userData.profilePic || "https://via.placeholder.com/100"}
                        alt="Profile"
                        className="w-24 h-24 rounded-full shadow-md"
                    />
                    <div>
                        <h3 className="text-lg font-semibold">{userData.username}</h3>
                        <p className="text-sm text-gray-600">{userData.email}</p>
                    </div>
                </div>

                {/* Edit Username Section */}
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm mb-2">Username</label>
                    {isEditing ? (
                        <div className="flex space-x-4">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleUsernameUpdate}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center">
                            <p className="text-gray-700">{username}</p>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-blue-600 hover:underline"
                            >
                                Edit
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDetails;
