import { FaSpinner } from 'react-icons/fa';

/**
 * AdminLoader - A reusable loading component for admin tabs
 * @param {string} message - Optional loading message to display
 */
function AdminLoader({ message = 'Loading...' }) {
    return (
        <div className="admin-loader">
            <div className="admin-loader__spinner">
                <FaSpinner className="admin-loader__icon" />
            </div>
            <p className="admin-loader__message">{message}</p>
        </div>
    );
}

export default AdminLoader;
