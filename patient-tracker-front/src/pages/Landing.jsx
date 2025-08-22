import { Hero } from '../components';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FileText, 
  Camera, 
  Brain, 
  Shield, 
  QrCode, 
  Lock,
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
      title: "Secure Document Storage",
      description: "Store your medical documents with military-grade encryption. Access them securely from anywhere, anytime.",
      icon: Shield,
      path: "/documents",
      color: "bg-purple-500",
      iconColor: "text-purple-500",
      requiresAuth: true
    },
    {
      id: 4,
      title: "QR Code Sharing",
      description: "Share medical records securely with time-limited QR codes. Perfect for sharing with healthcare providers.",
      icon: QrCode,
      path: "/documents",
      color: "bg-orange-500",
      iconColor: "text-orange-500",
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {feature.description}
                      </p>
                      
                      {user ? (
                        <Link
                          to={feature.path}
                          className="inline-flex items-center text-primary hover:text-primaryMedium font-medium transition-colors duration-200 group/link"
                        >
                          Try it now
                          <ArrowRight className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200" />
                        </Link>
                      ) : (
                        <Link
                          to="/login"
                          className="inline-flex items-center text-primary hover:text-primaryMedium font-medium transition-colors duration-200 group/link"
                        >
                          Sign in to access
                          <ArrowRight className="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200" />
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
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
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
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primaryMedium transition-colors duration-200"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Landing;