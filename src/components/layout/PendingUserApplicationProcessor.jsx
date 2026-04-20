import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '../../store/reducers/appReducer';
import applicationApiService from '../../services/applicationApi';
import {
  clearPendingUserApplication,
  getPendingUserApplication
} from '../../utils/pendingUserApplication';

/**
 * After login/signup, completes a pending "add to My Applications" if one was stored.
 */
function PendingUserApplicationProcessor() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const ranForSession = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      ranForSession.current = false;
      return;
    }
    if (ranForSession.current) return;

    const pending = getPendingUserApplication();
    if (!pending) return;

    ranForSession.current = true;
    clearPendingUserApplication();

    (async () => {
      try {
        await applicationApiService.addUserApplication({
          program_id: pending.program_id,
          university_id: pending.university_id
        });
        dispatch(
          addNotification({
            type: 'success',
            message: 'Added to My Applications'
          })
        );
      } catch (e) {
        if (e.status === 409) {
          dispatch(
            addNotification({
              type: 'info',
              message: 'Already in your applications.'
            })
          );
        } else {
          dispatch(
            addNotification({
              type: 'error',
              message: e.message || 'Could not add to My Applications.'
            })
          );
        }
      }
    })();
  }, [isAuthenticated, dispatch]);

  return null;
}

export default PendingUserApplicationProcessor;
