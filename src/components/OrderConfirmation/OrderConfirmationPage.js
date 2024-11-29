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
                className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-4 sm:p-6 md:p-8"
            >
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Order Confirmation</h2>
                <p className="text-lg sm:text-xl">Thank you for your order!</p>
                <p className="text-gray-600 text-sm sm:text-base">
                    Order ID: {orderId || "Not available"}
                </p>
                <h3 className="mt-4 text-lg sm:text-xl font-bold">Order Summary:</h3>
                <ul className="mt-2 space-y-2">
                    {orderData?.items?.map((item, index) => (
                        <li
                            key={index}
                            className="flex flex-wrap justify-between items-center space-y-2 sm:space-y-0 sm:flex-nowrap"
                        >
                            <div className="w-full sm:w-auto">
                                <span className="font-semibold">{item.name}</span> <br />
                                <span className="text-sm sm:text-base text-gray-500">
                                    Original Price: ${item.price.toFixed(2)} x {item.quantity}
                                </span>
                            </div>
                            <div className="w-full sm:w-auto text-right">
                                <span className="font-bold">
                                    Total: ${(item.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>

                <p className="mt-6 text-lg sm:text-xl font-bold">
                    Grand Total: ${orderData?.total?.toFixed(2) || "0.00"}
                </p>

                {/* New section for order inquiries */}
                <div className="mt-8 p-4 bg-blue-50 rounded-md border border-blue-200">
                    <h4 className="text-lg sm:text-xl font-semibold text-blue-700">
                        Important Information
                    </h4>
                    <p className="text-sm sm:text-base text-blue-600 mt-2">
                        Please save your order ID for future reference. You can also find it in My Orders Section. If you have any questions or need assistance with your order, feel free to contact our support team and provide your order ID for faster service.
                    </p>
                </div>

                {/* Button to capture screenshot */}
                <button
                    onClick={handleCaptureScreenshot}
                    className="mt-6 bg-blue-600 text-white p-3 sm:p-4 rounded-lg w-full sm:w-auto"
                >
                    Capture Screenshot
                </button>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;
