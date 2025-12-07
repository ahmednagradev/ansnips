import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import InputField from '../components/InputField';
import Toast from '../components/Toast';
import authService from '../../appwrite/authService';

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [changeSuccess, setChangeSuccess] = useState(false);
    const navigate = useNavigate();

    const authStatus = useSelector((state) => state.authStatus);
    const userData = useSelector((state) => state.userData);

    // Redirect if not authenticated
    if (!authStatus || !userData) {
        return <Navigate to="/auth" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            setNotification({
                message: 'Please fill in all fields',
                type: 'error'
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            setNotification({
                message: 'New passwords do not match',
                type: 'error'
            });
            return;
        }

        if (oldPassword === newPassword) {
            setNotification({
                message: 'New password must be different from old password',
                type: 'error'
            });
            return;
        }

        setLoading(true);

        try {
            const { response, error } = await authService.updatePassword(
                oldPassword,
                newPassword,
                confirmPassword
            );

            if (error) {
                throw new Error(error);
            }

            setChangeSuccess(true);
            setNotification({
                message: 'Password changed successfully!',
                type: 'success'
            });

            // Clear form
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // Redirect back after 2 seconds
            setTimeout(() => {
                navigate(-1);
            }, 2000);
        } catch (error) {
            setNotification({
                message: error.message || 'Failed to change password',
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

    const passwordValidation = validatePassword(newPassword); 
    const showValidation = newPassword.length > 0;

    if (changeSuccess) {
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
                                    Password Changed!
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Your password has been updated successfully.
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Redirecting back...
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
            <div className="container max-w-md px-2">
                <motion.div
                    className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="p-8">
                        {/* Back button */}
                        <motion.button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
                            whileHover={{ x: -4 }}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ArrowLeft size={18} />
                            <span className="text-sm font-medium">Back</span>
                        </motion.button>

                        <motion.div
                            className="text-center mb-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            {/* <motion.div
                                className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            >
                                <Lock className="text-blue-600 dark:text-blue-400" size={32} />
                            </motion.div> */}
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Change Password
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Enter your current password and choose a new one
                            </p>
                        </motion.div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Current Password */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                            >
                                <InputField
                                    icon={Lock}
                                    title="Enter your current password"
                                    placeholder="Current Password"
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required={true}
                                />
                            </motion.div>

                            {/* New Password */}
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
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
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

                            {/* Confirm New Password */}
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
                                            {newPassword === confirmPassword ? (
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

                            {/* Warning about same password */}
                            {oldPassword.length > 0 && newPassword.length > 0 && oldPassword === newPassword && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3"
                                >
                                    <div className="flex items-center gap-2">
                                        <AlertCircle size={16} className="text-yellow-600 dark:text-yellow-400" />
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                            New password must be different from current password
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            <motion.button
                                type="submit"
                                disabled={
                                    loading ||
                                    newPassword !== confirmPassword ||
                                    !passwordValidation.minLength ||
                                    !passwordValidation.hasLetter ||
                                    !passwordValidation.hasNumber ||
                                    oldPassword === newPassword
                                }
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -1 }}
                                whileTap={{ scale: loading ? 1 : 0.98 }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0 }}
                            >
                                {loading ? 'Changing...' : 'Change Password'}
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

export default ChangePassword;