import { createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import { Route } from "react-router-dom";
import App from "../App";
import Home from "../app/pages/Home";
import LoginSignup from "../app/pages/LoginSignup";
import Verification from "../app/pages/Verification";
import AllPosts from "../app/pages/AllPosts";
import DetailedPost from "../app/pages/DetailedPost";
import PostForm from "../app/pages/PostForm";
import Contact from "../app/pages/Contact";
import About from "../app/pages/About";
import Privacy from "../app/pages/Privacy";
import ProtectedRoute from "./ProtectedRoute";
import AiChat from "../app/pages/AiChat";
import LandingPage from "../app/pages/LandingPage";
import ChatRoom from "../app/pages/ChatRoom";
import ChatSection from "../app/pages/ChatSection";
import AuthSuccess from "../app/pages/AuthSuccess";
import Settings from "../app/pages/Settings";
import Followers from "../app/pages/Followers";
import Following from "../app/pages/Following";
import SavedPosts from "../app/pages/SavedPosts";
import Search from "../app/pages/Search";
import Notifications from "../app/pages/Notifications";
import ForgotPassword from "../app/pages/ForgotPassword";
import ResetPassword from "../app/pages/ResetPassword";
import ChangePassword from "../app/pages/ChangePassword";
import LikedPosts from "../app/pages/LikedPosts";
import ReelsPage from "../app/pages/ReelsPage";
import ErrorDisplay from "../app/components/ErrorDisplay";

let Routes = createBrowserRouter(createRoutesFromElements(
    <Route path="" element={<App />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<ErrorDisplay error="Page not found" />} />
        <Route path="/auth" element={<LoginSignup />} />
        <Route path="/verify" element={<Verification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Public Routes */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/auth-success" element={<AuthSuccess />} />

        {/* Public Post Route (so any one can read the shared public posts) */}
        <Route path="/post/:id" element={<DetailedPost />} />

        {/* Protected Routes */}
        <Route path="/reels" element={
            <ProtectedRoute requireVerification={true}>
                <ReelsPage />
            </ProtectedRoute>
        } />

        <Route path="/reels/:id" element={
            <ProtectedRoute requireVerification={true}>
                <ReelsPage />
            </ProtectedRoute>
        } />

        <Route path="/liked-posts" element={
            <ProtectedRoute requireVerification={true}>
                <LikedPosts />
            </ProtectedRoute>
        } />

        <Route path="/change-password" element={
            <ProtectedRoute requireVerification={true}>
                <ChangePassword />
            </ProtectedRoute>
        } />

        <Route path="/notifications" element={
            <ProtectedRoute requireVerification={true}>
                <Notifications />
            </ProtectedRoute>
        } />

        <Route path="/search" element={
            <ProtectedRoute requireVerification={true}>
                <Search />
            </ProtectedRoute>
        } />

        <Route path="/home" element={
            <ProtectedRoute requireVerification={true}>
                <Home />
            </ProtectedRoute>
        } />

        <Route path="/profile/:username/followers" element={
            <ProtectedRoute requireVerification={true}>
                <Followers />
            </ProtectedRoute>
        } />

        <Route path="/profile/:username/following" element={
            <ProtectedRoute requireVerification={true}>
                <Following />
            </ProtectedRoute>
        } />

        <Route path="/edit-profile" element={
            <ProtectedRoute requireVerification={true}>
                <Settings />
            </ProtectedRoute>
        } />

        <Route path="/saved-posts" element={
            <ProtectedRoute requireVerification={true}>
                <SavedPosts />
            </ProtectedRoute>
        } />

        <Route path="/chat/:chatRoomId" element={
            <ProtectedRoute requireVerification={true}>
                <ChatRoom />
            </ProtectedRoute>
        } />

        <Route path="/chat" element={
            <ProtectedRoute requireVerification={true}>
                <ChatSection />
            </ProtectedRoute>
        } />

        <Route path="/profile/:username" element={
            <ProtectedRoute requireVerification={true}>
                <AllPosts />
            </ProtectedRoute>
        } />

        <Route path="/postform" element={
            <ProtectedRoute requireVerification={true}>
                <PostForm />
            </ProtectedRoute>
        } />

        <Route path="/postform/:id" element={
            <ProtectedRoute requireVerification={true}>
                <PostForm />
            </ProtectedRoute>
        } />

        <Route path="/assistant" element={
            <ProtectedRoute requireVerification={true}>
                <AiChat />
            </ProtectedRoute>
        } />

    </Route>
));

export default Routes;