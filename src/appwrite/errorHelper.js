const getErrorMessage = (error, fallback = "Something went wrong.") => 
    typeof error === "string" && error
    || error.message === "Failed to fetch" ? error.message = "Please check your internet connection": ""
    || error?.message
    || fallback;

export default getErrorMessage