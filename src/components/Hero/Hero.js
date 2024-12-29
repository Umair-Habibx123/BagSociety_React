import React, { useState, useEffect } from 'react';
import image1 from '../../assets/images/banner1.jpg';
import image2 from '../../assets/images/banner2.jpg';
import { Link } from 'react-router-dom';

const Hero = () => {
  const images = [image1, image2];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);


  return (
    <div className="relative w-full h-screen -mt-16 overflow-hidden">
      {/* Background Slider */}

      <div
        className="flex transition-transform duration-1000 ease-in-out"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {images.map((src, index) => (
          <div
            key={index}
            className="w-full flex-shrink-0 h-screen relative"
          >
            <img
              src={src}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover scale-105 transition-transform duration-500"
              style={{
                transform: currentIndex === index ? 'scale(1.05)' : 'scale(1)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50"></div>
          </div>
        ))}
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black opacity-40"></div>


      {/* Hero Text with Animation */}

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[40%] text-center text-white px-6 animate-fadeIn">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
          Find Your Perfect Handbag
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl mb-6 drop-shadow-md">
          Explore our exclusive collection of trendy and timeless handbags, crafted for every occasion.
        </p>
        <Link to="/all-products">
          <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-transform transform hover:scale-110">
            Shop Now
          </button>
        </Link>
      </div>

      {/* Dots Navigation with Animations */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex justify-center space-x-4">
        {images.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-4 h-4 rounded-full cursor-pointer transition-all transform ${index === currentIndex
              ? 'bg-pink-500 scale-125'
              : 'bg-gray-400 hover:bg-pink-400'
              }`}
          ></div>
        ))}
      </div>

    </div >
  );
};

export default Hero;
