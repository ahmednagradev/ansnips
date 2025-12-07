import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Zap, Shield, Heart } from 'lucide-react';

const About = () => {

	useEffect(() => {
		scrollTo(top)
	}, [])

	const values = [
		{
			icon: Users,
			title: "Community First",
			description: "Building meaningful connections through authentic conversations and shared experiences."
		},
		{
			icon: Zap,
			title: "Innovation",
			description: "Pushing boundaries with cutting-edge features designed for modern creators."
		},
		{
			icon: Shield,
			title: "Trust & Safety",
			description: "Your security and privacy are foundational to everything we build."
		},
		{
			icon: Heart,
			title: "Quality",
			description: "Obsessive attention to detail in every interaction, animation, and feature."
		}
	];

	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center"
				>
					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 tracking-tight leading-tight">
						Built for creators,<br />designed for everyone
					</h1>
					<p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
						A modern platform where creativity meets community. Share your story, connect with others, and discover content that inspires.
					</p>
				</motion.div>
			</div>

			{/* Stats Section */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.2 }}
				className="border-y border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50"
			>
				<div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
					<div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 text-center">
						<div>
							<div className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-white mb-2">Fast</div>
							<div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Real-time updates</div>
						</div>
						<div>
							<div className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-white mb-2">Secure</div>
							<div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Enterprise-grade</div>
						</div>
						<div>
							<div className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-white mb-2">Simple</div>
							<div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Intuitive design</div>
						</div>
					</div>
				</div>
			</motion.div>

			{/* Values Grid */}
			<div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.3 }}
					className="text-center mb-10 sm:mb-12 lg:mb-16"
				>
					<h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
						What we stand for
					</h2>
					<p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
						Our principles guide every decision we make
					</p>
				</motion.div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
					{values.map((value, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 * index + 0.4 }}
							className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800"
						>
							<value.icon className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 mb-3 sm:mb-4" />
							<h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
								{value.title}
							</h3>
							<p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
								{value.description}
							</p>
						</motion.div>
					))}
				</div>
			</div>

			{/* Mission Statement */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.8 }}
				className="bg-gray-50 dark:bg-zinc-900/50"
			>
				<div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center">
					<h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
						Creating spaces for authentic connection
					</h2>
					<p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
						In a world of endless noise, we're building a platform that prioritizes genuine interactions. 
						From real-time conversations to creative expression through posts and reels, every feature 
						is designed to bring people closer together while respecting their privacy and time.
					</p>
				</div>
			</motion.div>

			{/* Closing */}
			<div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 1 }}
					className="text-center"
				>
					<h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
						Join us in building something different
					</h2>
					<p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
						Experience social media that respects your time and creativity
					</p>
					<a
						href="/auth"
						className="inline-flex items-center px-6 sm:px-8 py-3 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 text-base sm:text-lg"
					>
						Get Started
					</a>
				</motion.div>
			</div>
		</div>
	);
};

export default About;