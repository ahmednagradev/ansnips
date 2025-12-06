import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from '../app/components/Loader';

const ProtectedRoute = ({ children, requireVerification = true }) => {
    const authStatus = useSelector((state) => state.authStatus);
    const userData = useSelector((state) => state.userData);
    const authLoading = useSelector((state) => state.authLoading);
    const location = useLocation();

    // if(authLoading) {
    //     return <Loader />
    // }

    if (!authStatus) {
        return <Navigate to="/auth" state={{ from: location }} replace />
    }

    if (requireVerification && !userData?.emailVerification) {
        return <Navigate to="/verify" state={{ from: location }} replace />
    }

    return children;
};

export default ProtectedRoute;