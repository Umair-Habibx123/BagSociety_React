import React from "react";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";

const OrderConfirmationPage = () => {
    const location = useLocation();
    const { orderData, orderId } = location.state || {};

    const handleCaptureScreenshot = () => {
        const element = document.getElementById("orderConfirmationContent");

        html2canvas(element).then((canvas) => {
            const link = document.createElement("a");
            link.href = canvas.toDataURL();
            link.download = `order_${orderId}.png`;
            link.click();
        });
    };


    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            <div
                id="orderConfirmationContent"
                className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6 sm:p-8 md:p-10 animate__animated animate__fadeIn"
            >
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center animate__animated animate__fadeIn">
                    Order Confirmation
                </h2>
                <p className="text-lg sm:text-xl text-gray-800 text-center animate__animated animate__fadeIn">
                    Thank you for your order!
                </p>
                <p className="text-gray-600 text-sm sm:text-base text-center">
                    Order ID: {orderId || "Not available"}
                </p>
                <h3 className="mt-6 text-lg sm:text-xl font-semibold text-gray-800">Order Summary:</h3>
                <ul className="mt-2 space-y-4">
                    {orderData?.items?.map((item, index) => (
                        <li
                            key={index}
                            className="flex flex-wrap justify-between items-center space-y-4 sm:space-y-0 sm:flex-nowrap p-4 bg-gray-100 rounded-lg shadow-md transform transition-all hover:scale-105 hover:shadow-xl duration-300"
                        >
                            <div className="w-full sm:w-auto">
                                <span className="font-semibold text-lg text-gray-800">{item.name}</span> <br />
                                <span className="text-sm sm:text-base text-gray-500">
                                    Original Price: Rs.{item.price.toFixed(2)} x {item.quantity}
                                </span>
                            </div>
                            <div className="w-full sm:w-auto text-right">
                                <span className="font-bold text-lg text-gray-800">
                                    Total: Rs.{(item.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>

                <p className="mt-6 text-lg sm:text-xl font-semibold text-gray-800">
                    Grand Total: Rs.{orderData?.total?.toFixed(2) || "0.00"}
                </p>

                {/* Important Information Section */}
                <div className="mt-8 p-6 bg-blue-50 rounded-md border border-blue-200 shadow-md">
                    <h4 className="text-lg sm:text-xl font-semibold text-blue-700">
                        Important Information
                    </h4>
                    <p className="text-sm sm:text-base text-blue-600 mt-2">
                        Please save your order ID for future reference. You can also find it in the "My Orders" section.
                        If you have any questions or need assistance, feel free to contact our support team and provide your order ID for faster service.
                    </p>
                </div>

                {/* Screenshot Button */}
                <button
                    onClick={handleCaptureScreenshot}
                    className="mt-6 bg-blue-600 text-white p-3 sm:p-4 rounded-lg w-full sm:w-auto text-center transform hover:scale-105 transition-all duration-300"
                >
                    Capture Screenshot
                </button>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;
