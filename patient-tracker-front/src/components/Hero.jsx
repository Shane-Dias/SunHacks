import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

// These would be your actual health-tech related images
import hero1 from '../assets/health-still-life-with-copy-space_23-2148854034.avif';
import hero2 from '../assets/photo-1532938911079-1b06ac7ceec7.avif';
import hero3 from '../assets/premium_photo-1675808577247-2281dc17147a.avif';

const carouselImages = [hero1, hero2, hero3];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % carouselImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % carouselImages.length);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prevSlide) => 
      prevSlide === 0 ? carouselImages.length - 1 : prevSlide - 1
    );
  };

  return (
    <div className="bg-white min-h-screen flex items-center py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Secure Health Record Sharing with{' '}
              <span className="text-primary">HealthLock</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              A secure platform for patients to digitally store and share medical records with healthcare providers. Using temporary QR codes and advanced encryption, we ensure your health data remains private while accessible when needed.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                to="/register"
                className="rounded-md bg-primary px-6 py-4 text-base font-semibold text-white shadow-sm hover:bg-primaryMedium transition-colors duration-200"
              >
                Get started
              </Link>
              <Link 
                to="/learn-more" 
                className="text-base font-semibold leading-6 text-gray-900 hover:text-primary transition-colors duration-200 flex items-center"
              >
                Learn more <span className="ml-2">→</span>
              </Link>
            </div>
            
            {/* Feature Highlights */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start p-4 bg-white rounded-xl shadow-sm border border-blue-100">
                <div className="flex-shrink-0 bg-primaryLight rounded-lg p-3">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">End-to-end encryption</h3>
                  <p className="text-sm text-gray-500 mt-1">Your health data is protected with military-grade encryption</p>
                </div>
              </div>
              
              <div className="flex items-start p-4 bg-white rounded-xl shadow-sm border border-blue-100">
                <div className="flex-shrink-0 bg-primaryLight rounded-lg p-3">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">QR code access</h3>
                  <p className="text-sm text-gray-500 mt-1">Share records securely with time-limited QR codes</p>
                </div>
              </div>

              <div className="flex items-start p-4 bg-white rounded-xl shadow-sm border border-blue-100">
                <div className="flex-shrink-0 bg-primaryLight rounded-lg p-3">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">HIPAA Compliant</h3>
                  <p className="text-sm text-gray-500 mt-1">Fully compliant with healthcare privacy regulations</p>
                </div>
              </div>

              <div className="flex items-start p-4 bg-white rounded-xl shadow-sm border border-blue-100">
                <div className="flex-shrink-0 bg-primaryLight rounded-lg p-3">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Universal Access</h3>
                  <p className="text-sm text-gray-500 mt-1">Access your records from any device, anywhere</p>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            {/* <div className="mt-10 grid grid-cols-3 gap-4 text-center">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                <div className="text-2xl font-bold text-primary">10K+</div>
                <div className="text-sm text-gray-600">Patients Served</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-gray-600">Healthcare Providers</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                <div className="text-2xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
            </div> */}
          </div>
          
          {/* Image Carousel */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-lg h-96">
              {carouselImages.map((image, index) => (
                <div 
                  key={index} 
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img
                    src={image}
                    className="w-full h-full object-cover"
                    alt="HealthLock secure health record sharing"
                  />
                  {/* Overlay gradient for better text visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              ))}
              
              {/* Navigation arrows */}
              <button
                onClick={goToPrevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all duration-200"
                aria-label="Previous slide"
              >
                <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all duration-200"
                aria-label="Next slide"
              >
                <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Custom carousel indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-primary w-8' 
                      : 'bg-primaryLight hover:bg-primary'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Carousel captions */}
            <div className="text-center mt-4">
              <div className={`transition-opacity duration-500 ${currentSlide === 0 ? 'opacity-100' : 'opacity-0'}`}>
                <h3 className="font-semibold text-gray-900">Secure Storage</h3>
                <p className="text-sm text-gray-600">Keep your medical records safe and organized</p>
              </div>
              <div className={`transition-opacity duration-500 ${currentSlide === 1 ? 'opacity-100' : 'opacity-0'}`}>
                <h3 className="font-semibold text-gray-900">Easy Sharing</h3>
                <p className="text-sm text-gray-600">Share with healthcare providers instantly</p>
              </div>
              <div className={`transition-opacity duration-500 ${currentSlide === 2 ? 'opacity-100' : 'opacity-0'}`}>
                <h3 className="font-semibold text-gray-900">Privacy First</h3>
                <p className="text-sm text-gray-600">Your data remains yours alone</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;