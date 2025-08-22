import { Hero } from '../components';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FileText, 
  Camera, 
  Shield, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

const Landing = () => {
  const user = useSelector((state) => state.userState.user);
  const role = useSelector((state) => state.userState.role);

  const features = [
    {
      id: 1,
      title: "Health Report Analyzer",
      description: "Upload your medical reports and get AI-powered analysis with detailed health insights, risk assessments, and personalized recommendations.",
      icon: FileText,
      path: "/analyzer",
      color: "bg-blue-500",
      iconColor: "text-blue-500",
      requiresAuth: true
    },
    {
      id: 2,
      title: "Health Detector",
      description: "Use your camera for real-time health monitoring. Analyze facial features to detect potential health indicators and wellness metrics.",
      icon: Camera,
      path: "/detector",
      color: "bg-green-500",
      iconColor: "text-green-500",
      requiresAuth: true
    },
    {
      id: 3,
      title: "AI Virtual Calling",
      description: "Experience intelligent virtual health consultations with AI-powered calling system for personalized health guidance and support.",
      icon: Shield,
      path: "/calls",
      color: "bg-purple-500",
      iconColor: "text-purple-500",
      requiresAuth: true
    }
  ];

  const filteredFeatures = features.filter(feature => 
    !feature.requiresAuth || user
  );

  return (
    <>
      <Hero />
      
      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Powerful Health Tools at Your Fingertips
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Discover our advanced health management tools designed to give you better insights into your health and make informed decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out transform group cursor-pointer"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`flex-shrink-0 w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out shadow-lg`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                        {feature.description}
                      </p>
                      
                      {user ? (
                        <Link
                          to={feature.path}
                          className="inline-flex items-center justify-center w-full px-6 py-3 text-primary hover:text-white font-medium rounded-lg border-2 border-primary hover:bg-primary transition-all duration-300 group/link transform hover:scale-105"
                        >
                          Try it now
                          <ArrowRight className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" />
                        </Link>
                      ) : (
                        <Link
                          to="/login"
                          className="inline-flex items-center justify-center w-full px-6 py-3 text-primary hover:text-white font-medium rounded-lg border-2 border-primary hover:bg-primary transition-all duration-300 group/link transform hover:scale-105"
                        >
                          Sign in to access
                          <ArrowRight className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to Action */}
          {!user && (
            <div className="mt-16 text-center">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Experience Advanced Health Management?
                </h3>
                <p className="text-gray-600 mb-6">
                  Join thousands of users who trust HealthLock for their health data management and analysis needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primaryMedium transition-all duration-200 transform hover:scale-105"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default Landing;