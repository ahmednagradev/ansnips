import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import authService from './appwrite/authService'
import { login, logout } from './store/authSlice'
import Navbar from './app/components/Navbar'
import Footer from './app/components/Footer'
import Container from './app/container/Container'
import usernameService from './appwrite/userInfoService'
import { useRealtime } from './hooks/useRealtime'
import Loader from './app/components/Loader'
import ErrorDisplay from './app/components/ErrorDisplay'


const App = () => {
	const dispatch = useDispatch()
	const location = useLocation()
	const [error, setError] = useState("");
	const authLoading = useSelector(state => state.authLoading)
	const searchParams = new URLSearchParams(location.search);

	// For not showing navbar in iframes
	const isEmbed = searchParams.get("embed") === "true";

	// Pages that don't need navbar
	const noNavbarPages = ['/reels'];
	const shouldShowNavbar = !noNavbarPages.some(page => location.pathname.startsWith(page));

	// Pages that don't need footer
	const noFooterPages = ['/home', '/profile', '/search', '/post', '/postform', '/auth', '/verify', '/assistant', '/chat', '/settings', '/notifications', '/edit-profile', '/saved-posts', '/liked-posts', '/change-password', '/forgot-password', '/reset-password', '/reels'];
	const shouldShowFooter = !noFooterPages.some(page => {
		// Special case: don't show footer for /profile/:username/followers or /following
		if (location.pathname.endsWith('/followers') || location.pathname.endsWith('/following')) {
			return true;
		}

		return location.pathname.startsWith(page);
	});

	useEffect(() => {
		authService.getUser()
			.then(async ({ user, error }) => {
				if (user) {
					const { username, error } = await usernameService.getUsername(user.$id);
					if (!error) {
						dispatch(login({ userData: user, username }));
					} else {
						dispatch(login({ userData: user, username: null }));
						console.error("Failed to fetch username:", error)
					}
				} else {
					setError(error);
					console.error('Failed to fetch user:', error);
					dispatch(logout());
				}
			})
	}, [dispatch]);

	useRealtime()

	return (
		<div className="min-h-screen w-full bg-white dark:bg-black">
			{shouldShowNavbar && !isEmbed && <Navbar />}
			<Container isEmbed={isEmbed}>
				{
					!authLoading ?
						error === "Please check your internet connection" ?
							<ErrorDisplay error={error} />
							:
							<Outlet />
						:
						<Loader />
				}
			</Container>
			{shouldShowFooter && <Footer />}
		</div>
	);
}

export default App;