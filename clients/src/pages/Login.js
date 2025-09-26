import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useForm } from '../hooks/useForm';
import { validators } from '../utils/validation';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import { ButtonLoader } from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

const Login = () => {
  const { login } = React.useContext(AppContext);
  const navigate = useNavigate();

  const validationRules = {
    email: [validators.required, validators.email],
    password: [validators.required],
    role: [validators.required]
  };

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldError
  } = useForm(
    { email: '', password: '', role: 'citizen' },
    validationRules
  );

  const onSubmit = async (formData) => {
    try {
      const user = await login(formData.email, formData.password, formData.role);

      if (user.role === 'admin') {
        navigate('/dashboard/admin');
      } else if (user.role === 'institution' || user.role === 'pending_institution') {
        if (user.role === 'pending_institution') {
          navigate('/institution-pending');
        } else {
          navigate('/dashboard/institution');
        }
      } else {
        navigate('/dashboard/citizen');
      }
    } catch (err) {
      setFieldError('general', err.message);
      throw err;
    }
  };

  const roleOptions = [
    { value: 'citizen', label: 'Citizen' },
    { value: 'institution', label: 'Institution' },
    { value: 'admin', label: 'Admin' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          CitizenVoice Login
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Sign in as a {values.role.charAt(0).toUpperCase() + values.role.slice(1)}
        </p>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit); }} className="space-y-6">
          <FormSelect
            label="User Type"
            name="role"
            value={values.role}
            onChange={handleChange}
            onBlur={handleBlur}
            options={roleOptions}
            error={errors.role}
            required
          />

          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            placeholder="Enter your email"
            required
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            placeholder="Enter your password"
            required
          />

          {errors.general && (
            <ErrorAlert error={errors.general} />
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <ButtonLoader />
                <span className="ml-2">Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
