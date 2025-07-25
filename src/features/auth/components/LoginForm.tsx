'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';

import { login } from '@/features/auth/actions/login';
import { LoginFormInput } from '@/features/auth/components/LoginFormInput';

export interface LoginFormInputs {
  email: string;
  password: string;
}

export const LoginForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    setError,
  } = useForm<LoginFormInputs>();

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    const { email, password } = data;

    const resp = await login(email, password);

    if (!resp.ok) {
      if (resp.message === 'User with that email not found') {
        setError('email', {
          type: 'manual',
          message: 'User with that email not found',
        });
      } else if (resp.message === 'Incorrect password') {
        setError('password', {
          type: 'manual',
          message: 'Incorrect password',
        });
      }

      return;
    }

    await queryClient.invalidateQueries({ queryKey: ['authenticatedUser'] });

    router.push('/');
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className='mt-3 w-full'>
        <LoginFormInput
          value='email'
          register={register}
          errors={errors.email}
          placeholder='Email'
          type='email'
          watch={watch}
        />

        <LoginFormInput
          value='password'
          register={register}
          errors={errors.password}
          placeholder='Password'
          type={!showPassword ? 'password' : 'text'}
          watch={watch}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />

        <div className='w-full px-10 py-2'>
          <button
            type='submit'
            disabled={!isValid}
            className={`${isValid ? 'bg-ig-primary-button hover:bg-ig-primary-button-hover active:bg-ig-primary-button cursor-pointer' : 'bg-ig-primary-button-disabled'} w-full rounded-lg px-4 py-[7px] text-sm font-semibold`}
          >
            Log in
          </button>
        </div>
      </form>
    </>
  );
};
