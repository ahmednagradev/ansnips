const InputField = ({ icon: Icon, title, placeholder, pattern, type, value, onChange, minLength, maxLength, required, className }) => {

  return (
    
    <div className="group relative flex items-center bg-gray-50 dark:bg-zinc-800 p-3.5 rounded-lg border border-gray-200 dark:border-zinc-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors duration-300">
      <Icon className="text-gray-500 dark:text-gray-400 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" size={20} />
      <input
        type={type}
        title={title}
        placeholder={placeholder}
        pattern={pattern}
        value={value}
        onChange={onChange}
        minLength={minLength}
        maxLength={maxLength}
        required={required}
        className={`ml-3 bg-transparent outline-none flex-1 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 ${className}`}
      />
    </div>
  )
};

export default InputField;