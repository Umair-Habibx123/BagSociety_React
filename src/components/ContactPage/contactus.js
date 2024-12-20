import React, { useState } from 'react';

const ContactUsForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        problem: '',
        message: ''
    });

    const [showModal, setShowModal] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formAction = 'https://formspree.io/f/xbljkbnn';

        fetch(formAction, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then((response) => {
                if (response.ok) {
                    setShowModal(true);
                } else {
                    alert('There was an error sending your message.');
                }
            })
            .catch((error) => {
                alert('There was an error sending your message.');
            });
    };

    return (
        // bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8
        <section className="bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-2xl p-8 sm:p-10">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-8 animate__animated animate__fadeIn">
                    Contact Us
                </h2>

                {/* Form Start */}
                <form onSubmit={handleSubmit} className="space-y-6 animate__animated animate__fadeIn">
                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Your Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-md focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:ring-2 hover:ring-blue-400"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Problem Field */}
                    <div>
                        <label htmlFor="problem" className="block text-sm font-medium text-gray-700">Problem</label>
                        <select
                            id="problem"
                            name="problem"
                            required
                            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-md focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:ring-2 hover:ring-blue-400"
                            value={formData.problem}
                            onChange={handleChange}
                        >
                            <option value="" disabled selected>Select your problem</option>
                            <option value="Orders Issue">Technical Issue</option>
                            <option value="Account Issue">Account Issue</option>
                            <option value="General Inquiry">General Inquiry</option>
                        </select>
                    </div>

                    {/* Message Field */}
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                        <textarea
                            id="message"
                            name="message"
                            required
                            rows="4"
                            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-md focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:ring-2 hover:ring-blue-400"
                            placeholder="Enter your message"
                            value={formData.message}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <div className="text-center">
                        <button
                            type="submit"
                            className="py-3 px-6 bg-blue-600 text-white font-semibold rounded-md shadow-md transition-all duration-300 transform hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Submit
                        </button>
                    </div>
                </form>
                {/* Form End */}

                {/* Modal Dialog */}
                {showModal && (
                    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 transition-all duration-500">
                        <div className="bg-white p-6 rounded-md shadow-xl max-w-sm w-full animate__animated animate__fadeIn">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Thanks for contacting us!</h2>
                            <p className="text-gray-600">We appreciate you reaching out. Our team will get back to you shortly.</p>
                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => setShowModal(false)} 
                                    className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-md transition-all duration-300 hover:bg-blue-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ContactUsForm;
