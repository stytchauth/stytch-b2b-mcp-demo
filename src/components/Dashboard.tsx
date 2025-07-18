import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useStytchMemberSession,
  useStytchOrganization,
} from '@stytch/nextjs/b2b';
import { FiUsers, FiSettings, FiShield, FiGrid } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const { session, isInitialized } = useStytchMemberSession();
  const { organization } = useStytchOrganization();
  const router = useRouter();

  const role = useMemo(() => {
    return session?.roles.includes('stytch_admin') ? 'admin' : 'member';
  }, [session?.roles]);

  if (!isInitialized) {
    return null;
  }

  if (isInitialized && !session) {
    router.replace("/");
    return null;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1 className="dashboard-title">Welcome to your workspace</h1>
        <p className="dashboard-subtitle">Manage your organization and team members</p>
        
        <div className="dashboard-welcome">
          Hello! You&apos;re logged into{' '}
          <strong>{organization?.organization_name}</strong> with{' '}
          <strong>{role}</strong> permissions.
        </div>

        <div className="dashboard-actions">
          <h3 className="dashboard-action-title">Quick Actions</h3>
          <div className="dashboard-action-grid">
            <Link href="/members" className="dashboard-action-card">
              <FiUsers className="dashboard-action-icon" />
              <div className="dashboard-action-name">Members</div>
              <div className="dashboard-action-desc">Invite and manage team members</div>
            </Link>
            
            <Link href="/settings" className="dashboard-action-card">
              <FiSettings className="dashboard-action-icon" />
              <div className="dashboard-action-name">Settings</div>
              <div className="dashboard-action-desc">Configure organization settings</div>
            </Link>
            
            <Link href="/sso" className="dashboard-action-card">
              <FiShield className="dashboard-action-icon" />
              <div className="dashboard-action-name">SSO</div>
              <div className="dashboard-action-desc">Set up single sign-on</div>
            </Link>
            
            <Link href="/scim" className="dashboard-action-card">
              <FiGrid className="dashboard-action-icon" />
              <div className="dashboard-action-name">SCIM</div>
              <div className="dashboard-action-desc">Manage user provisioning</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
