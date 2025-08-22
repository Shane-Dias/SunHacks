const FormInput = ({ label, name, type, value, defaultValue, size, onChange, placeholder, required = false, error }) => {
  // Check if onChange is provided
  const isControlled = onChange !== undefined;
  
  return (
    <div className={`space-y-2 ${size ? size : ""}`}>
      <label 
        htmlFor={name} 
        className="block text-sm font-medium text-gray-900"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {isControlled ? (
          <input
            id={name}
            type={type}
            name={name}
            value={value ? value : ''}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={`
              w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-500
              focus:ring-2 focus:ring-primary focus:border-primary
              transition-all duration-200 ease-in-out
              ${error 
                ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 bg-white hover:border-gray-400'
              }
            `}
          />
        ) : (
          <input
            id={name}
            type={type}
            name={name}
            defaultValue={defaultValue}
            placeholder={placeholder}
            required={required}
            className={`
              w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-500
              focus:ring-2 focus:ring-primary focus:border-primary
              transition-all duration-200 ease-in-out
              ${error 
                ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 bg-white hover:border-gray-400'
              }
            `}
          />
        )}
        
        {/* Show icons based on input type */}
        {type === 'email' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </div>
        )}
        
        {type === 'password' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 flex items-center mt-1">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

 
 
 export default FormInput; 