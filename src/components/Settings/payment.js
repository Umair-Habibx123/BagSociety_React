import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc, updateDoc, setDoc, deleteField } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { db } from "../../firebase"; // Adjust the path to your Firebase config file

const PaymentPage = () => {
  const [cards, setCards] = useState({});
  const [loading, setLoading] = useState(true);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    const fetchCardDetails = async () => {
      try {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            const userEmail = user.email;

            const docRef = doc(db, "users", userEmail);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              const data = docSnap.data();
              let updatedCards = data.cards || {};

              setCards(updatedCards);
            } else {
              console.log("No saved cards found.");
            }
          } else {
            console.error("No user is signed in");
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching cards: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCardDetails();
  }, []);

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      console.error("Stripe has not loaded yet.");
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        console.error("CardElement not found.");
        setIsProcessing(false);
        return;
      }

      const { token, error } = await stripe.createToken(cardElement);

      if (error) {
        console.error("Error creating card token:", error.message);
        alert("Failed to create card token. Please try again.");
        setIsProcessing(false);
        return;
      }

      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userEmail = user.email;
        const userRef = doc(db, "users", userEmail);

        const last4 = token.card.last4;
        const cardType = token.card.brand;

        // Update Firestore with new card details
        const newCard = {
          token: token.id,
          last4,
          type: cardType,
        };

        await updateDoc(userRef, {
          cards: {
            ...cards,
            [token.id]: newCard,
          },
        });

        setCards((prevCards) => ({
          ...prevCards,
          [token.id]: newCard,
        }));

        alert("Card added successfully!");
        setIsAddingCard(false);
      } else {
        console.error("No user is signed in.");
      }
    } catch (error) {
      console.error("Error adding card:", error);
      alert("Failed to add card. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!cardToDelete) return;

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userEmail = user.email;
        const userRef = doc(db, "users", userEmail);

        // Remove the card from Firestore
        await updateDoc(userRef, {
          [`cards.${cardToDelete}`]: deleteField(),
        });

        // Update the local state to reflect the deletion
        setCards((prevCards) => {
          const updatedCards = { ...prevCards };
          delete updatedCards[cardToDelete];
          return updatedCards;
        });

        setShowDeleteModal(false);
        setCardToDelete(null);
        alert("Card deleted successfully!");
      } else {
        console.error("No user is signed in.");
      }
    } catch (error) {
      console.error("Error deleting card:", error);
      alert("Failed to delete card. Please try again.");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  const cardsArray = Object.entries(cards);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Payment</h2>
        </div>

        {/* Cards Section */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Cards</h3>
          <div className="grid grid-cols-2 gap-4">
            {cardsArray.map(([key, card]) => (
              <div
                key={key}
                className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between shadow-sm"
              >
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    **** {card.last4}
                  </p>
                  <p className="text-sm text-gray-500">
                    {card.type.toUpperCase()}
                  </p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => {
                      setCardToDelete(key);
                      setShowDeleteModal(true);
                    }}
                    className="text-gray-600 hover:text-gray-800 focus:outline-none"
                  >
                    <span className="material-icons">more_vert</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Add New Card Button */}
            {!isAddingCard && (
              <div
                onClick={() => setIsAddingCard(true)}
                className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center shadow-sm hover:bg-gray-100 cursor-pointer"
              >
                <span className="text-2xl text-gray-600">+</span>
                <p className="text-sm text-gray-600">Add new card</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Card Form */}
        {isAddingCard && (
          <div className="mt-6 bg-white p-4 border rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Add a New Card
            </h3>
            <form onSubmit={handleAddCard}>
              <CardElement className="p-4 border rounded-lg mb-4" />
              <button
                type="submit"
                disabled={isProcessing || !stripe || !elements}
                className="w-full bg-blue-600 text-white p-2 rounded-lg"
              >
                {isProcessing ? "Processing..." : "Save Card"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Delete Card Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Are you sure you want to delete this card?
            </h3>
            <div className="flex justify-between">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCard}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
