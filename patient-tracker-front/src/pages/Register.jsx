import { useState } from 'react';
import { FormInput, SubmitBtn } from '../components';
import { Form, Link, redirect, useActionData, useNavigation } from 'react-router-dom';
import { customFetchNoToken } from '../utils';
import { toast } from 'react-toastify';
import { loginUser } from '../features/userSlice';
import axios from 'axios';

export const action = (store) => async ({ request }) => {
  console.log("In action function");
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  console.log('Registration data:', data); // Debug log

  try {
    const response = await axios.post('http://localhost:5000/api/doctors/register', data);
    console.log('Registration response:', response); // Debug log
    
    if (response.data && response.data.user) {
      store.dispatch(loginUser(response.data));
      toast.success('Registered successfully');
      return redirect('/');
    } else {
      toast.error('Registration failed: Invalid response from server');
      return null;
    }
  } catch (error) {
    console.error('Registration error:', error); // Debug log
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Please double check your credentials';
    toast.error(errorMessage);
    return { error: errorMessage };
  }
};

const Register = () => {
  const [role, setRole] = useState('doctor');
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  return (
    <section className='min-h-screen grid place-items-center bg-gray-50 py-12'>
      <Form
        method='POST'
        className='card w-96 p-8 bg-white shadow-lg flex flex-col gap-y-6 rounded-xl border border-primaryLight'
      >
        <h4 className='text-center text-3xl font-bold text-gray-900'>Register</h4>
        
        {/* Display error message if any */}
        {actionData?.error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
            {actionData.error}
          </div>
        )}
        
        {/* Role Selection */}
        <div className='form-control'>
          <label className='label'>
            <span className='label-text capitalize text-gray-700'>I am a</span>
          </label>
          <select
            name='role'
            value={role}
            onChange={handleRoleChange}
            className='select select-bordered w-full bg-white border-gray-300 focus:border-primary focus:ring-primary'
            required
          >
            <option value='doctor'>Doctor</option>
            <option value='patient'>Patient</option>
          </select>
        </div>

        <FormInput type='text' label='username' name='username' required />
        <FormInput type='email' label='email' name='email' required />
        <FormInput type='password' label='password' name='password' required />
        
        {/* Additional Patient Fields */}
        {role === 'patient' && (
          <>
            <FormInput type='text' label='Full Name' name='name' required />
            <FormInput type='date' label='Date of Birth' name='dateOfBirth' />
            <FormInput type='text' label='Contact Number' name='contact' />
          </>
        )}
        
        <div className='mt-4'>
          <SubmitBtn text={isSubmitting ? 'Registering...' : 'register'} />
        </div>
        
        <p className='text-center text-gray-600'>
          Already have an account?{' '}
          <Link
            to='/login'
            className='ml-2 text-primary hover:text-primaryMedium transition-colors duration-200 font-medium'
          >
            Login
          </Link>
        </p>
      </Form>
    </section>
  );
};

export default Register;