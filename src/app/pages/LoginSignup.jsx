import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User } from 'lucide-react';
import InputField from '../components/InputField';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import useAuth from '../../hooks/useAuth';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleLoginButton } from '../components/GoogleSignInButton';

const LoginSignup = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const authStatus = useSelector((state) => state.authStatus);
    const userData = useSelector((state) => state.userData);

    const {
        loading,
        notification,
        setNotification,
        handleLogin,
        handleSignup
    } = useAuth();

    // Check for verification callback parameters
    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    // If there are verification parameters, redirect to verify page WITH those parameters
    if (authStatus && userId && secret) {
        return <Navigate to={`/verify?userId=${userId}&secret=${secret}`} replace />;
    }

    // Normal redirect logic for authenticated users
    if (authStatus) {
        if (!userData?.emailVerification) {
            return <Navigate to="/verify" replace />;
        }
        return <Navigate to="/home" replace />;
    }

    const handleSubmit = async (e) => {
        // Redirect to home page if already logged in
        e.preventDefault();
        if (authStatus) {
            navigate("/home");
            return;
        }

        if (isLogin) {
            await handleLogin(email, password);
        } else {
            await handleSignup(email, password, name);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setNotification({ message: '', type: '' });
    };

    if (loading) return <Loader />;

    return (
        <div className='min-h-[calc(100vh-64px)] w-full flex items-center justify-center'>
            <div className="container max-w-md mx-auto px-4 py-8 md:py-12"> 
                <motion.div
                    className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="p-8">
                        <motion.div
                            className="text-center mb-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {isLogin ? 'Welcome back' : 'Create account'}
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                {isLogin
                                    ? 'Sign in to continue your journey'
                                    : 'Start your journey with us today'}
                            </p>
                        </motion.div>

                        {/* Form section */}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15, duration: 0.4 }}
                                className="space-y-4"
                            >
                                {/* Name field with smooth height animation */}
                                <motion.div
                                    initial={false}
                                    animate={{
                                        height: isLogin ? 0 : 'auto',
                                        opacity: isLogin ? 0 : 1,
                                        marginBottom: isLogin ? 0 : '1rem'
                                    }}
                                    transition={{
                                        duration: 0.3,
                                        ease: [0.4, 0, 0.2, 1]
                                    }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <InputField
                                        icon={User}
                                        title="Full name can only contain letters and spaces."
                                        placeholder="Full Name"
                                        pattern="[A-Za-z ]+"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required={!isLogin}
                                    />
                                </motion.div>

                                {/* Email field */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: isLogin ? 0.2 : 0.25,
                                        duration: 0.4
                                    }}
                                >
                                    <InputField
                                        icon={Mail}
                                        title="Enter a valid email address."
                                        placeholder="Email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required={true}
                                    />
                                </motion.div>

                                {/* Password field */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: isLogin ? 0.25 : 0.3,
                                        duration: 0.4
                                    }}
                                >
                                    <InputField
                                        icon={Lock}
                                        title="Password must be at least 8 characters long and include letters and numbers."
                                        placeholder="Password"
                                        pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required={true}
                                    />
                                </motion.div>
                            </motion.div>

                            {/* Submit button */}
                            <motion.button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white mt-1 px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                                whileHover={{ scale: 1.02, y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0 }}
                            >
                                {isLogin ? 'Sign In' : 'Sign Up'}
                            </motion.button>
                        </form>

                        {/* Divider */}
                        <motion.div
                            className='flex items-center justify-center gap-5 my-2.5'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: isLogin ? 0.35 : 0.4, duration: 0.4 }}
                        >
                            <div className='h-[1px] w-25 bg-gray-300 dark:bg-gray-700'></div>
                            <p className='text-center text-gray-500 dark:text-gray-400 text-sm'>
                                or
                            </p>
                            <div className='h-[1px] w-25 bg-gray-300 dark:bg-gray-700'></div>
                        </motion.div>

                        {/* Google login */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: isLogin ? 0.4 : 0.45, duration: 0.4 }}
                        >
                            <GoogleLoginButton />
                        </motion.div>

                        {/* Forgot password button */}
                        <motion.div
                            className="mt-5 text-center"
                            initial={false}
                            animate={{
                                height: !isLogin ? 0 : 'auto',
                                opacity: !isLogin ? 0 : 1,
                            }}
                            transition={{
                                duration: 0.3,
                                ease: [0.4, 0, 0.2, 1]
                            }}
                            style={{ overflow: 'hidden' }}
                        >
                            <button
                                type="button"
                                onClick={() => navigate("/forgot-password")}
                                className='text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-sm font-medium'
                            >
                                Forgot password?
                            </button>
                        </motion.div>

                        {/* Toggle mode button */}
                        <motion.div
                            className="mt-1 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: isLogin ? 0.45 : 0.5, duration: 0.4 }}
                        >
                            <button
                                type="button"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors text-sm"
                                onClick={toggleMode}
                            >
                                {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                            </button>
                        </motion.div>
                    </div>
                </motion.div>

                <Toast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ message: '', type: '' })}
                />
            </div>
        </div>
    );
};

export default LoginSignup;