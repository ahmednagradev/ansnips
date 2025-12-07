import { useEffect } from "react";

/**
 * Detect clicks outside of a ref
 * @param {React.RefObject} ref - element to detect outside clicks
 * @param {Function} callback - function to run on outside click
 */
const useOutsideClick = (ref, callback) => {
    useEffect(() => {
        const handleClick = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        };

        document.addEventListener("mousedown", handleClick);
        document.addEventListener("touchstart", handleClick);

        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("touchstart", handleClick);
        };
    }, [ref, callback]);
};

export default useOutsideClick;
