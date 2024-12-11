import React, { useState } from 'react';
import FormField from '../moleculs/FormField';
import Button from '../atom/Button';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    telpon: ''
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target; // Destructure id and value from the event target
    
    // Debugging statements to understand what's happening
    console.log("Field ID:", id); // Logs the `id` of the input field being changed
    console.log("New Value:", value); // Logs the `value` entered by the user
  
    setLoginForm((prevForm) => {
      console.log("Previous State:", prevForm); // Logs the state before the update
  
      // Create a new state object with the updated value for the field identified by `id`
      const updatedForm = {
        ...prevForm,
        [id]: value, // Use computed property name to dynamically update the correct property
      };
  
      console.log("Updated State:", updatedForm); // Logs the state after the update
      return updatedForm; // Update the state
    });
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3030/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-type': 'web',
        },
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password }),
        credentials: "include"
      });

      if (response.ok) {
        navigate('/dashboard');
      } else {
        // Handle error if needed
      }
    } catch (error) {
      console.error(error);
      throw new Error;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-y-5 max-w-md shadow-custom-login bg-white rounded-md px-8 pt-6 pb-8 mb-4">
      <h1 className="text-2xl font-semibold mb-6 text-center">Login</h1>
      
      <FormField
        label="Email"
        type="email"
        id="email"
        value={loginForm.email}
        onChange={handleChange}
        placeholder="Enter your email"
        required
      />
      
      <FormField
        label="Password"
        type="password"
        id="password"
        value={loginForm.password}
        onChange={handleChange}
        placeholder="Enter your password"
        required
      />
      
      {/* <FormField
        label="No.Telp"
        type="text"
        id="telpon"
        value={loginForm.telpon}
        onChange={handleChange}
        placeholder="Enter your phone number"
        required
      /> */}
      
      <Button type="submit" className='text-white' >Login</Button>
      
      <Link to="/forgotpassword" className="text-center text-primary mt-4 hover:underline">
        Forgot Password?
      </Link>
    </form>
  );
};

export default LoginForm;
