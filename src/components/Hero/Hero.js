import React, { useState, useEffect } from 'react';
import image1 from '../../assets/images/banner1.jpg';
import image2 from '../../assets/images/banner2.jpg';
import { Link } from 'react-router-dom';

const Hero = () => {
  const images = [image1, image2];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Automatically change slides every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [images.length]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Image Slider with Smooth Transition */}
      <div
        className="flex transition-transform duration-1000 ease-in-out"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`, // Adjust slide transition
        }}
      >
        {images.map((src, index) => (
          <div key={index} className="w-full flex-shrink-0 h-screen relative">
            <img
              src={src}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover" // Ensure image is scaled without cutting off
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50"></div>
          </div>
        ))}
      </div>

      {/* Dark Background Between Images and Text */}
      <div className="absolute inset-0 bg-black opacity-30"></div>

      {/* Text Overlay and Call-to-Action */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white px-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4">
          Find Your Perfect Handbag
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl mb-6">
          Explore our exclusive collection of trendy and timeless handbags, crafted for every occasion.
        </p>
        <Link to="/all-products">
        <button
          className="bg-pink-500 text-white px-6 py-3 rounded-full text-lg font-semibold transition-transform transform hover:scale-105"
        >
          Shop Now
        </button>
        </Link>
      </div>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex justify-center space-x-2 md:space-x-4 lg:space-x-6">
        {images.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${
              index === currentIndex ? 'bg-pink-500' : 'bg-gray-300'
            } md:w-4 md:h-4 lg:w-5 lg:h-5`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Hero;
