import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, requireVerification = true }) => {
    const authStatus = useSelector((state) => state.authStatus);
    const userData = useSelector((state) => state.userData);
    const location = useLocation();

    if (!authStatus) {
        return <Navigate to="/auth" state={{ from: location }} replace />
    }

    if (requireVerification && !userData?.emailVerification) {
        return <Navigate to="/verify" state={{ from: location }} replace />
    }

    return children;
};

export default ProtectedRoute;