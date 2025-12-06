import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const About = () => {

	useEffect(() => {
		scrollTo(top)
	}, [])

	const features = [
		{
			title: "Our Mission",
			description: "To empower creators and developers with cutting-edge tools and resources that inspire innovation.",
			icon: (
				<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
				</svg>
			),
		},
		{
			title: "Who We Are",
			description: "A passionate team of developers and designers dedicated to creating exceptional digital experiences.",
			icon: (
				<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
				</svg>
			),
		},
		{
			title: "Our Vision",
			description: "Building a future where technology seamlessly enhances creativity and productivity.",
			icon: (
				<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
				</svg>
			),
		},
	];

	return (
		<div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<div className="text-center mb-16">
					<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
						About Us
					</h1>
					<p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
						We're dedicated to providing innovative solutions that help businesses and individuals achieve their digital goals.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{features.map((feature, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: index * 0.1 }}
							className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
						>
							<div className="text-blue-600 dark:text-blue-400 mb-4">
								{feature.icon}
							</div>
							<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
								{feature.title}
							</h3>
							<p className="text-gray-600 dark:text-gray-400">
								{feature.description}
							</p>
						</motion.div>
					))}
				</div>

				<motion.div
					className="mt-16 bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-lg"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.3 }}
				>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
						Our Story
					</h2>
					<p className="text-gray-600 dark:text-gray-400 mb-4">
						Founded with a vision to revolutionize digital experiences, we've grown from a small team of passionate developers into a thriving community of innovators and problem-solvers.
					</p>
					<p className="text-gray-600 dark:text-gray-400">
						Today, we continue to push the boundaries of what's possible, creating solutions that empower businesses and individuals to achieve their goals in the digital world.
					</p>
				</motion.div>
			</motion.div>
		</div>
	);
};

export default About;