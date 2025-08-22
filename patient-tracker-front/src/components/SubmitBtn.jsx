const SubmitBtn = ({
  text,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "default",
}) => {
  const baseClasses = `
    w-full font-semibold rounded-lg transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-4 focus:ring-opacity-50
    disabled:opacity-50 disabled:cursor-not-allowed
    flex items-center justify-center
  `;

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    default: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const variantClasses = {
    primary: `
      bg-primary text-white shadow-lg
      hover:bg-primaryMedium hover:shadow-xl hover:-translate-y-0.5
      focus:ring-primary active:bg-primaryMedium active:transform active:scale-95
    `,
    secondary: `
      bg-gray-100 text-gray-900 border-2 border-gray-200
      hover:bg-gray-200 hover:border-gray-300
      focus:ring-gray-500 active:bg-gray-300
    `,
    outline: `
      bg-transparent text-primary border-2 border-primary
      hover:bg-primary hover:text-white
      focus:ring-primary active:bg-primaryMedium
    `,
  };

  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
      `}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </>
      ) : (
        <>
          {text}
          <svg
            className="ml-2 -mr-1 w-5 h-5 transition-transform group-hover:translate-x-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </>
      )}
    </button>
  );
};

export default SubmitBtn;
