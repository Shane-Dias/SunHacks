import { Link } from 'react-router-dom';

// These would be your actual health-tech related images
import hero1 from '../assets/health-still-life-with-copy-space_23-2148854034.avif';
import hero2 from '../assets/photo-1532938911079-1b06ac7ceec7.avif';
import hero3 from '../assets/premium_photo-1675808577247-2281dc17147a.avif';

const carouselImages = [hero1, hero2, hero3];

const Hero = () => {
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
                className="rounded-md bg-primary px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-primaryMedium transition-colors duration-200"
              >
                Get started
              </Link>
              <Link 
                to="/learn-more" 
                className="text-base font-semibold leading-6 text-gray-900 hover:text-primary transition-colors duration-200"
              >
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
            
            {/* Feature Highlights */}
            <div className="mt-12 grid grid-cols-2 gap-8">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primaryLight rounded-lg p-2">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">End-to-end encryption</h3>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primaryLight rounded-lg p-2">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">QR code access</h3>
                </div>
              </div>
            </div>
          </div>
          
          {/* Image Carousel */}
          <div className="relative">
            <div className="flex overflow-x-hidden snap-x snap-mandatory rounded-2xl shadow-lg h-96">
              {carouselImages.map((image, index) => (
                <div 
                  key={index} 
                  className="flex-shrink-0 w-full snap-start flex items-center justify-center"
                >
                  <img
                    src={image}
                    className="w-full h-full object-cover"
                    alt="HealthLock secure health record sharing"
                  />
                </div>
              ))}
            </div>
            
            {/* Custom carousel indicators */}
            <div className="flex justify-center mt-4 space-x-2">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  className="w-3 h-3 rounded-full bg-primaryLight hover:bg-primary transition-colors duration-200"
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;