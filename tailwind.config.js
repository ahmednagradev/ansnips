export default {
    darkMode: 'class',
    theme: {
        extend: {},
    },
    variants: {
        extend: {
            scrollbar: ['responsive'] // or ['responsive', 'hover'] or other variants
        }
    },
    plugins: [
        require('tailwind-scrollbar'),
    ],
}

// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   darkMode: 'class',
//   theme: {
//     extend: {},
//   },
//   corePlugins: {
//     // Enable or disable scrollbar variants
//     scrollbar: true, // or false to disable entirely
//   },
//   plugins: [
//     require('tailwind-scrollbar'),
//   ],
// }