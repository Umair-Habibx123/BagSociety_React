import React from "react";
import { useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Forbidden from "../components/AdminDashboard/Forbidden";

const ProtectedRoute = ({ children, requiredRole }) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const location = useLocation();

    const [role, setRole] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    // Fetch the user's role from Firestore
    React.useEffect(() => {
        const fetchUserRole = async () => {
            if (user) {
                const userDocRef = doc(db, "users", user.email);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    setRole(userData.role);
                }
            }
            setIsLoading(false);
        };

        fetchUserRole();
    }, [user]);

    if (isLoading) return <div>Loading...</div>;

    // If the user is not logged in or their role does not match, return Forbidden
    if (!user || role !== requiredRole) {
        return <Forbidden />;
    }

    // Allow access to the children (protected content)
    return children;
};

export default ProtectedRoute;
