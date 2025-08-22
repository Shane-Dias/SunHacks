import { FormInput, SubmitBtn } from '../components';
import { Form, Link, redirect } from 'react-router-dom';
import { customFetchNoToken } from '../utils';
import { toast } from 'react-toastify';
import { loginUser } from '../features/userSlice';

export const action = (store) => async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  try {
    const response = await customFetchNoToken.post('/doctors/login', data);
    store.dispatch(loginUser(response.data));
    toast.success('Logged in successfully');
    return redirect('/');
  } catch (error) {
    const errorMessage =
      error?.response?.data?.message ||
      'Please double check your credentials';
    toast.error(errorMessage);
    return null;
  }
};

const Login = () => {
  return (
    <section className='min-h-screen grid place-items-center bg-gray-50 py-12'>
      <Form
        method='post'
        className='card w-96 p-8 bg-white shadow-lg flex flex-col gap-y-6 rounded-xl border border-primaryLight'
      >
        <h4 className='text-center text-3xl font-bold text-gray-900'>Login</h4>
        <FormInput type='email' label='email' name='email' />
        <FormInput type='password' label='password' name='password' />
        <div className='mt-4'>
          <SubmitBtn text='login' />
        </div>
        
        <p className='text-center text-gray-600'>
          Not a member yet?{' '}
          <Link
            to='/register'
            className='ml-2 text-primary hover:text-primaryMedium transition-colors duration-200 font-medium'
          >
            Register
          </Link>
        </p>
      </Form>
    </section>
  );
};

export default Login;