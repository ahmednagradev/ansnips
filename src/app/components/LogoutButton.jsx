import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import ConfirmationModal from './ConfirmationModal';

const LogoutButton = ({ className }) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const { handleLogout } = useAuth();

    const handleLogoutClick = () => {
        handleLogout();
    }

    return (
        <>
            <button
                onClick={() => setShowConfirmation(true)}
                className={className}
            >
                Sign Out
            </button>

            <ConfirmationModal
                isOpen={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={handleLogoutClick}
                title="Sign Out"
                message="Are you sure you want to sign out?"
                confirmText="Sign Out"
            />
        </>
    );
};

export default LogoutButton;