import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase"; // Adjust the path to your Firebase config file
import { useUser } from "../../context/UserContext"; // Adjust the path to your context

const AddAddressPage = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState(null);
  const [isAddressLoading, setIsAddressLoading] = useState(true);
  const [isAddressFormVisible, setIsAddressFormVisible] = useState(false); // For toggling the address form visibility
  const [newAddress, setNewAddress] = useState({
    country: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    postalCode: '',
    phone: ''
  });

  const user = useUser();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        (async () => {
          try {
            const docRef = doc(db, "users", user.email);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              setAddress(data.address || null);
            } else {
              setAddress(null);
            }
          } catch (error) {
            console.error("Error fetching address:", error);
            setAddress(null);
          } finally {
            setIsAddressLoading(false);
          }
        })();
      } else {
        console.error("No user logged in");
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleChangeAddress = () => {
    setIsAddressFormVisible(true);
    setNewAddress({
      country: address?.country || '',
      firstName: address?.firstName || '',
      lastName: address?.lastName || '',
      address: address?.address || '',
      apartment: address?.apartment || '',
      city: address?.city || '',
      postalCode: address?.postalCode || '',
      phone: address?.phone || ''
    });
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSaveAddress = async () => {
    // Validation: Check if all fields are filled
    const {
      country,
      firstName,
      lastName,
      address,
      apartment,
      city,
      postalCode,
      phone,
    } = newAddress;

    if (
      !country ||
      !firstName.trim() ||
      !lastName.trim() ||
      !address.trim() ||
      !apartment.trim() ||
      !city.trim() ||
      !postalCode.trim() ||
      !phone.trim()
    ) {
      alert("Please fill out all fields, including the country dropdown.");
      return;
    }

    try {
      const auth = getAuth();
      const userEmail = auth.currentUser.email;
      const userRef = doc(db, "users", userEmail);

      // Save the address as a formatted string
      const formattedAddress = `${firstName} ${lastName}, ${address}, ${apartment}, ${city}, ${country}, ${postalCode}, Phone: ${phone}`;
      await setDoc(userRef, { address: formattedAddress }, { merge: true });

      setAddress(formattedAddress);
      setIsAddressFormVisible(false);
      alert("Address saved successfully!");
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Failed to save address.");
    }
  };


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Address</h2>

        {/* Shipping Address */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Shipping Address</h3>
          <div className="p-4 border rounded-lg bg-gray-100">
            {isAddressLoading ? (
              <p className="text-sm text-gray-800">Loading address...</p>
            ) : address ? (
              <div>
                <p className="text-sm text-gray-800">{address}</p>
                <p
                  onClick={handleChangeAddress}
                  className="text-blue-600 text-sm cursor-pointer mt-2"
                >
                  Change Address
                </p>
              </div>
            ) : (
              <p
                onClick={() => setIsAddressFormVisible(true)}
                className="text-blue-600 text-center cursor-pointer"
              >
                Add New Address
              </p>
            )}
          </div>
        </div>

        {/* Address Form - Show if isAddressFormVisible is true */}
        {isAddressFormVisible && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Enter New Address</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700">Country/Region*</label>
                <select
                  name="country"
                  value={newAddress.country}
                  onChange={handleAddressInputChange}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select Country</option>
                  {/* Add country options */}
                  <option value="PAKISTAN">Pakistan</option>
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-700">First Name*</label>
                  <input
                    type="text"
                    name="firstName"
                    value={newAddress.firstName}
                    onChange={handleAddressInputChange}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-700">Last Name*</label>
                  <input
                    type="text"
                    name="lastName"
                    value={newAddress.lastName}
                    onChange={handleAddressInputChange}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700">Address*</label>
                <input
                  type="text"
                  name="address"
                  value={newAddress.address}
                  onChange={handleAddressInputChange}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Apartment*</label>
                <input
                  type="text"
                  name="apartment"
                  value={newAddress.apartment}
                  onChange={handleAddressInputChange}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-700">City*</label>
                  <input
                    type="text"
                    name="city"
                    value={newAddress.city}
                    onChange={handleAddressInputChange}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-700">Postal Code*</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={newAddress.postalCode}
                    onChange={handleAddressInputChange}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700">Phone Number*</label>
                <input
                  type="text"
                  name="phone"
                  value={newAddress.phone}
                  onChange={handleAddressInputChange}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <button
                onClick={handleSaveAddress}
                className="w-full bg-blue-600 text-white p-2 rounded-lg"
              >
                Save Address
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddAddressPage;
