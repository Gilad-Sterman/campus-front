import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeNotification } from '../../store/reducers/appReducer';

const TOAST_DURATION_MS = 5000;

function ToastItem({ notification }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const t = setTimeout(() => {
      dispatch(removeNotification(notification.id));
    }, TOAST_DURATION_MS);
    return () => clearTimeout(t);
  }, [dispatch, notification.id]);

  return (
    <div
      className={`notification-toast notification-toast--${notification.type || 'info'}`}
      role="status"
    >
      {notification.message}
    </div>
  );
}

/**
 * Renders global toast messages from Redux `app.notifications`.
 */
function NotificationToasts() {
  const notifications = useSelector((state) => state.app.notifications);

  if (notifications.length === 0) return null;

  return (
    <div className="notification-toasts" aria-live="polite">
      {notifications.map((n) => (
        <ToastItem key={n.id} notification={n} />
      ))}
    </div>
  );
}

export default NotificationToasts;
