import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../appwrite/authService';
import { login } from '../../store/authSlice';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

const Verification = () => {
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [searchParams] = useSearchParams();
    const userData = useSelector(state => state.userData);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const hasVerified = useRef(false);
    const username = useSelector((state) => state.username);
    const authLoading = useSelector((state) => state.authLoading)

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !userData) {
            navigate('/auth');
        }
    }, [userData, navigate]);

    // Handle verification callback from email link
    useEffect(() => {
        const userId = searchParams.get('userId');
        const secret = searchParams.get('secret');

        if (userId && secret && !hasVerified.current) {
            hasVerified.current = true;
            handleVerificationCallback(userId, secret);
        }
    }, [searchParams]);

    const handleVerificationCallback = async (userId, secret) => {
        setLoading(true);
        try {
            const { response, error } = await authService.confirmVerification(userId, secret);

            if (error) {
                setNotification({
                    message: error,
                    type: 'error'
                });
                setLoading(false);
                return;
            }

            // Get updated user data after verification
            const { user, error: userError } = await authService.getUser();
            if (userError) {
                throw new Error(userError);
            }

            // Update Redux store with new user data
            dispatch(login({ userData: user }));

            setNotification({
                message: 'Email verified successfully! Redirecting...',
                type: 'success'
            });

            // Redirect after showing success message
            setTimeout(() => {
                navigate(`/profile/${username}`);
            }, 0);

        } catch (error) {
            setNotification({
                message: error.message || 'Verification failed. Please try again.',
                type: 'error'
            });
            setLoading(false);
        }
    };

    const handleResendEmail = async () => {
        setLoading(true);
        const { verification, error } = await authService.createVerification();

        if (error) {
            setNotification({
                message: error,
                type: 'error'
            });
        } else {
            setNotification({
                message: 'Verification email sent successfully!',
                type: 'success'
            });
        }
        setLoading(false);
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
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
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
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Verify your email
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                We've sent a verification link to
                            </p>
                            <p className="text-blue-600 dark:text-blue-400 font-medium mt-1">
                                {userData?.email}
                            </p>
                        </motion.div>

                        <motion.div
                            className="space-y-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="bg-blue-50 dark:bg-blue-900/20 border-l border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    You need to verify your email before accessing the application. Check your email <strong>on this device</strong> and click the verification link to continue.
                                </p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02, y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0 }}
                                type="button"
                                onClick={handleResendEmail}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white mt-1 px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Resend verification email
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
};

export default Verification;