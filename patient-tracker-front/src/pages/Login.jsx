import { FormInput, SubmitBtn } from "../components";
import { Form, Link, redirect } from "react-router-dom";
import { customFetchNoToken } from "../utils";
import { toast } from "react-toastify";
import { loginUser } from "../features/userSlice";

export const action =
  (store) =>
  async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    try {
      const response = await customFetchNoToken.post("/doctors/login", data);
      store.dispatch(loginUser(response.data));
      toast.success("Logged in successfully");
      return redirect("/");
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        "Please double check your credentials";
      toast.error(errorMessage);
      return null;
    }
  };

const Login = () => {
  return (
    <div
      className="min-h-screen flex items-center py-12 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), 
                         url('https://plus.unsplash.com/premium_photo-1673953509975-576678fa6710?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Subtle pattern overlay for additional texture */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Branding Content */}
          <div className="hidden lg:block">
            <div className="max-w-md">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Welcome back to <span className="text-primary">HealthLock</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Secure access to your healthcare platform. Your medical records
                are protected with end-to-end encryption and temporary QR code
                access.
              </p>

              {/* Feature Highlights */}
              <div className="mt-12 space-y-6">
                <div className="flex items-center bg-white/50 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex-shrink-0 bg-primaryLight rounded-lg p-2">
                    <svg
                      className="h-6 w-6 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      Secure Authentication
                    </h3>
                    <p className="text-sm text-gray-600">
                      Protected with industry-standard security
                    </p>
                  </div>
                </div>

                <div className="flex items-center bg-white/50 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex-shrink-0 bg-primaryLight rounded-lg p-2">
                    <svg
                      className="h-6 w-6 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      HIPAA Compliant
                    </h3>
                    <p className="text-sm text-gray-600">
                      Your data privacy is our priority
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md">
              {/* Mobile Header (visible on small screens) */}
              <div className="lg:hidden text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  <span className="text-primary">HealthLock</span>
                </h1>
                <p className="mt-2 text-gray-600">Secure healthcare platform</p>
              </div>

              <div className="bg-white/95 backdrop-blur-md py-8 px-8 shadow-2xl rounded-2xl border border-gray-100">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 text-center lg:text-left">
                    Sign in to your account
                  </h2>
                  <p className="mt-2 text-sm text-gray-600 text-center lg:text-left">
                    Access your secure healthcare dashboard
                  </p>
                </div>

                <Form method="post" className="space-y-6">
                  <FormInput type="email" label="Email address" name="email" />
                  <FormInput type="password" label="Password" name="password" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label
                        htmlFor="remember-me"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Remember me
                      </label>
                    </div>

                    <div className="text-sm">
                      <Link
                        to="/forgot-password"
                        className="font-medium text-primary hover:text-primaryMedium transition-colors duration-200"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <SubmitBtn text="Sign in" />

                    <div className="text-center">
                      <span className="text-gray-600">
                        Don't have an account?{" "}
                      </span>
                      <Link
                        to="/register"
                        className="font-medium text-primary hover:text-primaryMedium transition-colors duration-200"
                      >
                        Create account
                      </Link>
                    </div>
                  </div>
                </Form>

                {/* Trust Indicators */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      SSL Secured
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      HIPAA Compliant
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
