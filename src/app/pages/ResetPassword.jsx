import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import InputField from '../components/InputField';
import Toast from '../components/Toast';
import authService from '../../appwrite/authService';
import Loader from '../components/Loader';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [resetSuccess, setResetSuccess] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const hasReset = useRef(false);

    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    // Redirect if missing parameters
    useEffect(() => {
        if (!userId || !secret) {
            setNotification({
                message: 'Invalid or expired reset link',
                type: 'error'
            });
            setTimeout(() => {
                navigate('/forgot-password');
            }, 2000);
        }
    }, [userId, secret, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (hasReset.current) return;

        if (!password.trim() || !confirmPassword.trim()) {
            setNotification({
                message: 'Please fill in all fields',
                type: 'error'
            });
            return;
        }

        if (password !== confirmPassword) {
            setNotification({
                message: 'Passwords do not match',
                type: 'error'
            });
            return;
        }

        setLoading(true);
        hasReset.current = true;

        try {
            const { response, error } = await authService.confirmPasswordRecovery(
                userId,
                secret,
                password,
                confirmPassword
            );

            if (error) {
                throw new Error(error);
            }

            setResetSuccess(true);
            setNotification({
                message: 'Password reset successfully!',
                type: 'success'
            });

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/auth');
            }, 2000);
        } catch (error) {
            hasReset.current = false;
            setNotification({
                message: error.message || 'Failed to reset password',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const validatePassword = (pwd) => {
        const minLength = pwd.length >= 8;
        const hasLetter = /[A-Za-z]/.test(pwd);
        const hasNumber = /\d/.test(pwd);
        return { minLength, hasLetter, hasNumber };
    };

    const passwordValidation = validatePassword(password);
    const showValidation = password.length > 0;

    if (loading) return <Loader />;

    if (resetSuccess) {
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
                                className="text-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <motion.div
                                    className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                >
                                    <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
                                </motion.div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Password Reset Successfully!
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Your password has been changed. You can now login with your new password.
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Redirecting to login...
                                </p>
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
    }

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
                            <motion.div
                                className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            >
                                <Lock className="text-blue-600 dark:text-blue-400" size={32} />
                            </motion.div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Set new password
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Your new password must be different from previously used passwords
                            </p>
                        </motion.div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <InputField
                                    icon={Lock}
                                    title="Password must be at least 8 characters with letters and numbers"
                                    placeholder="New Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required={true}
                                />

                                {/* Password strength indicator */}
                                {showValidation && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-3 space-y-2"
                                    >
                                        <div className="flex items-center gap-2 text-sm">
                                            {passwordValidation.minLength ? (
                                                <CheckCircle size={16} className="text-green-500" />
                                            ) : (
                                                <AlertCircle size={16} className="text-gray-400" />
                                            )}
                                            <span className={passwordValidation.minLength ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                                                At least 8 characters
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            {passwordValidation.hasLetter ? (
                                                <CheckCircle size={16} className="text-green-500" />
                                            ) : (
                                                <AlertCircle size={16} className="text-gray-400" />
                                            )}
                                            <span className={passwordValidation.hasLetter ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                                                Contains letters
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            {passwordValidation.hasNumber ? (
                                                <CheckCircle size={16} className="text-green-500" />
                                            ) : (
                                                <AlertCircle size={16} className="text-gray-400" />
                                            )}
                                            <span className={passwordValidation.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                                                Contains numbers
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                            >
                                <InputField
                                    icon={Lock}
                                    title="Re-enter your new password"
                                    placeholder="Confirm New Password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required={true}
                                />

                                {/* Password match indicator */}
                                {confirmPassword.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-3"
                                    >
                                        <div className="flex items-center gap-2 text-sm">
                                            {password === confirmPassword ? (
                                                <>
                                                    <CheckCircle size={16} className="text-green-500" />
                                                    <span className="text-green-600 dark:text-green-400">
                                                        Passwords match
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle size={16} className="text-red-500" />
                                                    <span className="text-red-600 dark:text-red-400">
                                                        Passwords do not match
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>

                            <motion.button
                                type="submit"
                                disabled={loading || password !== confirmPassword || !passwordValidation.minLength || !passwordValidation.hasLetter || !passwordValidation.hasNumber}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -1 }}
                                whileTap={{ scale: loading ? 1 : 0.98 }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0 }}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </motion.button>
                        </form>
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

export default ResetPassword;