// src/components/organisms/LoginForm.tsx
import React, { useState } from 'react';
import FormField from '../moleculs/FormField';
import Button from '../atom/Button';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import ForgotPassImg from "@/assets/ForgotPass.png"

const ForgotPass: React.FC = () => {
  const [email, setEmail] = useState<string>('');

  const navigate = useNavigate();

  const handleSubmit =  async (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
    
  };

  return (
    <div className='w-full flex flex-col items-center gap-y-6 max-w-md shadow-custom-login bg-white rounded-md px-8 pt-6 pb-8 mb-4'>
        <img src={ForgotPassImg} alt="Forgot Pass Images" />
        <h1 className="text-2xl font-semibold  text-center">Forgot Your Password ?</h1>
        <p className='text-sm font-normal'>Enter your Email and we’ll help you reset your password</p>
        <form onSubmit={handleSubmit} className="w-full ">
            <FormField
                label="Email"
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
            />
            <div>
              <Button type="submit" className='mt-5 text-white'>Continue</Button>
            </div>
        </form>
        <span className='text-sm'> Back To <Link to="/" className="text-center text-primary mt-4 hover:underline font-semibold">Login?</Link></span>
    </div>
    
  );
};

export default ForgotPass;
