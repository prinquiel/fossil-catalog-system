import '../workspace/workspace-pages.css';
import UserProfileSettings from '../../components/account/UserProfileSettings.jsx';

/**
 * Perfil de cuenta (explorador, investigador o dual — rutas bajo /explorer, /researcher, /workspace/.../profile).
 */
function ExplorerProfile() {
  return (
    <div className="workspace-page">
      <UserProfileSettings variant="workspace" />
    </div>
  );
}

export default ExplorerProfile;
