import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';
import Toast from '../components/Toast';
import authService from '../../appwrite/authService';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [emailSent, setEmailSent] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setNotification({
                message: 'Please enter your email address',
                type: 'error'
            });
            return;
        }

        setLoading(true);

        try {
            const { recovery, error } = await authService.createPasswordRecovery(email);

            if (error) {
                throw new Error(error);
            }

            setEmailSent(true);
            setNotification({
                message: 'Recovery email sent successfully!',
                type: 'success'
            });
        } catch (error) {
            setNotification({
                message: error.message || 'Failed to send recovery email',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/auth');
    };

    if (emailSent) {
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
                                    Check your email
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    We've sent a password recovery link to
                                </p>
                                <p className="text-blue-600 dark:text-blue-400 font-medium mt-1">
                                    {email}
                                </p>
                            </motion.div>

                            <motion.div
                                className="space-y-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Click the link in the email to reset your password. The link will expire in 1 hour.
                                    </p>
                                </div>

                                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                                    <p>Didn't receive the email? Check your spam folder or</p>
                                    <button
                                        onClick={() => setEmailSent(false)}
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors mt-1"
                                    >
                                        try again
                                    </button>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02, y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleBackToLogin}
                                    className="w-full bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft size={18} />
                                    Back to Login
                                </motion.button>
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
                        {/* Back button */}
                        <motion.button
                            onClick={handleBackToLogin}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
                            whileHover={{ x: -4 }}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ArrowLeft size={18} />
                            <span className="text-sm font-medium">Back to Login</span>
                        </motion.button>

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
                                <Mail className="text-blue-600 dark:text-blue-400" size={32} />
                            </motion.div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Forgot password?
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                No worries, we'll send you reset instructions
                            </p>
                        </motion.div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <InputField
                                    icon={Mail}
                                    title="Enter your registered email address"
                                    placeholder="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required={true}
                                />
                            </motion.div>

                            <motion.button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -1 }}
                                whileTap={{ scale: loading ? 1 : 0.98 }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0 }}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Sending...
                                    </span>
                                ) : (
                                    'Send Reset Link'
                                )}
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

export default ForgotPassword;