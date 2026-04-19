import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { addNotification } from '../store/reducers/appReducer';
import applicationApiService from '../services/applicationApi';
import { setPendingUserApplication } from '../utils/pendingUserApplication';

/**
 * Resolves program id + university id from search result / program detail shapes.
 * @param {object} programLike
 * @returns {{ program_id: string, university_id: string } | null}
 */
function resolveIds(programLike) {
  if (!programLike) return null;
  const program_id = programLike.id ?? programLike.program_id;
  const university_id =
    programLike.university_id ?? programLike.universityId ?? programLike.university?.id;
  if (!program_id || !university_id) return null;
  return { program_id, university_id };
}

/**
 * MVP: add current program to `user_applications` or send user to signup with pending add.
 * @returns {Promise<{ kind: 'success' | 'duplicate' | 'redirect_signup' | 'invalid_ids' | 'error' }>}
 */
export function useAddToMyApplications() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const addProgram = useCallback(
    async (programLike) => {
      const ids = resolveIds(programLike);
      if (!ids) {
        dispatch(
          addNotification({
            type: 'error',
            message: 'Could not determine program or university. Please try again.'
          })
        );
        return { kind: 'invalid_ids' };
      }

      if (!isAuthenticated) {
        setPendingUserApplication(ids.program_id, ids.university_id);
        const returnTo = `${location.pathname}${location.search || ''}`;
        navigate(`/login?mode=signup&redirect=${encodeURIComponent(returnTo)}`);
        return { kind: 'redirect_signup' };
      }

      try {
        await applicationApiService.addUserApplication({
          program_id: ids.program_id,
          university_id: ids.university_id
        });
        dispatch(
          addNotification({
            type: 'success',
            message: 'Added to My Applications'
          })
        );
        return { kind: 'success' };
      } catch (e) {
        if (e.status === 409) {
          dispatch(
            addNotification({
              type: 'info',
              message: 'Already in your applications.'
            })
          );
          return { kind: 'duplicate' };
        }
        dispatch(
          addNotification({
            type: 'error',
            message: e.message || 'Could not add to My Applications.'
          })
        );
        return { kind: 'error' };
      }
    },
    [dispatch, isAuthenticated, navigate, location.pathname, location.search]
  );

  return { addProgram, isAuthenticated };
}

/** True after a successful add or when the server reports duplicate (for "Added ✓" UI). */
export function shouldShowAddedState(result) {
  return result?.kind === 'success' || result?.kind === 'duplicate';
}
