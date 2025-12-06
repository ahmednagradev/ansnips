import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import authService from '../appwrite/authService';
import { login, logout } from '../store/authSlice';
import userInfoService from '../appwrite/userInfoService';

const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const username = useSelector((state) => state.username);

    const handleLogin = async (email, password) => {
        setLoading(true);
        setNotification({ message: '', type: '' });

        try {
            // Create session
            const { session, error: loginError } = await authService.createSession({ email, password });
            if (loginError) throw new Error(loginError);

            // Get user
            const { user, error: userError } = await authService.getUser();
            if (userError) throw new Error(userError);

            // Get user info (username and name)
            const { userInfo, error: userInfoError } = await userInfoService.getUserInfo(user.$id);
            if (userInfoError) throw new Error(userInfoError);

            // Set user's data in store
            dispatch(login({ 
                userData: user, 
                username: userInfo.username,
                name: userInfo.name 
            }));

            // Check email verification
            if (!user.emailVerification) {
                navigate('/verify');
                setNotification({
                    message: 'Please verify your email to access all features',
                    type: 'info'
                });
            } else {
                navigate(`/profile/${userInfo.username}`);
                setNotification({
                    message: 'Logged in successfully!',
                    type: 'success'
                });
            }

            return { success: true };
        } catch (error) {
            setNotification({
                message: error.message,
                type: 'error'
            });
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (email, password, name) => {
        setLoading(true);
        setNotification({ message: '', type: '' });

        try {
            // Create account
            const { account, error: signupError } = await authService.createAccount({
                email,
                password,
                name
            });
            if (signupError) throw new Error(signupError);

            // Creating unique username after account creation
            let newUsername;
            let unique = false;
            let attempts = 0;

            while (!unique && attempts < 5) {
                newUsername = `user${account.$id.substring(0, 4)}${Math.floor(100 + Math.random() * 900)}`;
                const { exists } = await userInfoService.checkUsernameExists({ username: newUsername });
                if (!exists) unique = true;
                attempts++;
            }

            // Create username and store name in userInfo collection
            const { username: createdUsername, name: storedName, error: usernameError } = await userInfoService.createUsername({
                userId: account.$id,
                username: newUsername,
                name: name // Store name here
            });
            if (usernameError) throw new Error(usernameError);

            // Create session after signup
            const { session, error: loginError } = await authService.createSession({
                email,
                password
            });
            if (loginError) throw new Error(loginError);

            // Get user details
            const { user, error: userError } = await authService.getUser();
            if (userError) throw new Error(userError);

            // Set user's data in store
            dispatch(login({ 
                username: createdUsername, 
                userData: user,
                name: storedName 
            }));

            // Send verification email
            const { verification, error: verificationError } = await authService.createVerification();
            if (verificationError) throw new Error(verificationError);

            navigate('/verify');
            setNotification({
                message: 'Account created! Please check your email to verify.',
                type: 'success'
            });
            return { success: true };
        } catch (error) {
            setNotification({
                message: error.message,
                type: 'error'
            });
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            const { success, error } = await authService.deleteSessions();
            if (error) throw new Error(error);

            dispatch(logout());
            navigate("/auth");
            setNotification({
                message: 'Logged out successfully',
                type: 'success'
            });
        } catch (error) {
            setNotification({
                message: error.message,
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        notification,
        setNotification,
        setLoading,
        handleLogin,
        handleSignup,
        handleLogout
    };
};

export default useAuth;



// import { useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import authService from '../appwrite/authService';
// import { login, logout } from '../store/authSlice';
// import userInfoService from '../appwrite/userInfoService';

// const useAuth = () => {
//     const [loading, setLoading] = useState(false);
//     const [notification, setNotification] = useState({ message: '', type: '' });
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const username = useSelector((state) => state.username)

//     const handleLogin = async (email, password) => {
//         setLoading(true);
//         setNotification({ message: '', type: '' });

//         try {
//             // Create session
//             const { session, error: loginError } = await authService.createSession({ email, password });
//             if (loginError) throw new Error(loginError);

//             // Get user
//             const { user, error: userError } = await authService.getUser();
//             if (userError) throw new Error(userError);

//             // Get username
//             const { username: userUsername, error: usernameError } = await userInfoService.getUsername(user.$id);
//             if (usernameError) throw new Error(usernameError);

//             // Set user's data in store
//             dispatch(login({ userData: user, username: userUsername }));

//             // Check email verification
//             if (!user.emailVerification) {
//                 navigate('/verify');
//                 setNotification({
//                     message: 'Please verify your email to access all features',
//                     type: 'info'
//                 });
//             } else {
//                 navigate(`/profile/${username}`);
//                 setNotification({
//                     message: 'Logged in successfully!',
//                     type: 'success'
//                 });
//             }

//             return { success: true };
//         } catch (error) {
//             setNotification({
//                 message: error.message,
//                 type: 'error'
//             });
//             return { success: false, error: error.message };
//         } finally {
//             setLoading(false);
//         }
//     };


//     const handleSignup = async (email, password, name) => {
//         setLoading(true);
//         setNotification({ message: '', type: '' });

//         try {
//             // Create account
//             const { account, error: signupError } = await authService.createAccount({
//                 email,
//                 password,
//                 name
//             });
//             if (signupError) throw new Error(signupError);

//             // Setting name in userInfo
            

//             // Creating unique username after account creation
//             let newUsername;
//             let unique = false;
//             let attempts = 0;

//             while (!unique && attempts < 5) {
//                 newUsername = `user${user.$id.substring(0, 4)}${Math.floor(100 + Math.random() * 900)}`;
//                 const { exists } = await userInfoService.checkUsernameExists({ username: newUsername });
//                 if (!exists) unique = true;
//                 attempts++;
//             }

//             const { username: createdUsername, error: usernameError } = await userInfoService.createUsername({
//                 userId: account.$id,
//                 username: newUsername
//             });
//             if (usernameError) throw new Error(usernameError);

//             // Create session after signup
//             const { session, error: loginError } = await authService.createSession({
//                 email,
//                 password
//             });
//             if (loginError) throw new Error(loginError);

//             // Get user details
//             const { user, error: userError } = await authService.getUser();
//             if (userError) throw new Error(userError);

//             // Set user's data in store
//             dispatch(login({ username: createdUsername, userData: user }));

//             // Send verification email
//             const { verification, error: verificationError } = await authService.createVerification();
//             if (verificationError) throw new Error(verificationError);

//             navigate('/verify');
//             setNotification({
//                 message: 'Account created! Please check your email to verify.',
//                 type: 'success'
//             });
//             return { success: true };
//         } catch (error) {
//             setNotification({
//                 message: error.message,
//                 type: 'error'
//             });
//             return { success: false, error: error.message };
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleLogout = async () => {
//         setLoading(true);
//         try {
//             const { success, error } = await authService.deleteSessions();
//             if (error) throw new Error(error);

//             dispatch(logout());
//             navigate("/auth");
//             setNotification({
//                 message: 'Logged out successfully',
//                 type: 'success'
//             });
//         } catch (error) {
//             setNotification({
//                 message: error.message,
//                 type: 'error'
//             });
//         } finally {
//             setLoading(false);
//         }
//     };

//     return {
//         loading,
//         notification,
//         setNotification,
//         setLoading,
//         handleLogin,
//         handleSignup,
//         handleLogout
//     };
// };

// export default useAuth;