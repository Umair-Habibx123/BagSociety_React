import React from "react";
import { useLocation } from "react-router-dom";

const OrderConfirmationPage = () => {
    const location = useLocation();
    const { orderData } = location.state || {};

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Confirmation</h2>
                <p>Thank you for your order!</p>
                <p className="text-gray-600">Order ID: {orderData?.id}</p>
                <h3 className="mt-4 text-lg font-bold">Order Summary:</h3>
                {/* <ul>
                    {orderData?.items.map((item) => (
                        <li key={item.id}>
                            {item.title} - {item.quantity} x Rs. {item.price}
                        </li>
                    ))}
                </ul> */}
                <ul>
                    {orderData.items.map((item, index) => (
                        <li key={index}>
                            {item.quantity} x {item.name} - ${item.price.toFixed(2)}
                        </li>
                    ))}
                </ul>

                <p className="mt-4">Total: Rs. {orderData?.total}</p>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;
