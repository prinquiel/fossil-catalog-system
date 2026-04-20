import { useSyncExternalStore } from 'react';
import { getApiPending, subscribeApiActivity } from '../../services/apiActivity';
import './GlobalLoadingBar.css';

function GlobalLoadingBar() {
  const pending = useSyncExternalStore(subscribeApiActivity, getApiPending, getApiPending);
  const active = pending > 0;
  return (
    <div
      className={`global-loading-bar${active ? ' global-loading-bar--active' : ''}`}
      role="progressbar"
      aria-hidden={!active}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-busy={active}
    />
  );
}

export default GlobalLoadingBar;
