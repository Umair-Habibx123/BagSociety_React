import React, { useState } from 'react';

const ContactUsForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        problem: '',
        message: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Replace {your-form-id} with your actual Formspree ID
        const formAction = 'https://formspree.io/f/xbljkbnn';

        // Submit form via Formspree
        fetch(formAction, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then((response) => {
                if (response.ok) {
                    alert('Your message has been sent successfully!');
                } else {
                    alert('There was an error sending your message.');
                }
            })
            .catch((error) => {
                alert('There was an error sending your message.');
            });
    };

    return (
        <section className="bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Contact Us</h2>

                {/* Form Start */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Your Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.problem}
                            onChange={handleChange}
                        >
                            <option value="" disabled selected>Select your problem</option>
                            <option value="Orders Issue">Technical Issue</option>
                            <option value="Account Issue">Account Issue</option>
                            <option value="Billing">Billing</option>
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
                            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your message"
                            value={formData.message}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <div className="text-center">
                        <button
                            type="submit"
                            className="py-3 px-6 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Submit
                        </button>
                    </div>
                </form>
                {/* Form End */}
            </div>
        </section>
    );
};

export default ContactUsForm;
