import React, { useState, useEffect } from 'react';
import image1 from '../../assets/images/banner1.jpg';
import image2 from '../../assets/images/banner2.jpg';

const Hero = () => {
  const images = [image1, image2];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Automatically change slides every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [images.length]);

  return (
    <div className="relative w-full overflow-hidden md:h-[400px] lg:h-[500px]">
      {/* Image Slider */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`, // Adjust slide transition
        }}
      >
        {images.map((src, index) => (
          <div key={index} className="w-full flex-shrink-0 h-full">
            <img
              src={src}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover" // Ensure image is scaled without cutting off
            />
          </div>
        ))}
      </div>

      {/* Dots Navigation */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 md:space-x-4 lg:space-x-6">
        {images.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${
              index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
            } md:w-4 md:h-4 lg:w-5 lg:h-5` }
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Hero;
