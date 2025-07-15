import React, { useState, useEffect, useRef } from 'react';
import { FaBuilding, FaChevronDown, FaSpinner, FaLock, FaEnvelopeOpenText, FaCheck } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useStytchB2BClient, useStytchOrganization } from '@stytch/nextjs/b2b';
import './OrgSwitcher.css';

const OrgSwitcher = () => {
    const stytch = useStytchB2BClient();
    const { organization: currentOrganization } = useStytchOrganization();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const dropdownRef = useRef<any>(null);
    const router = useRouter();

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event: any) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            loadOrganizations();
        }
    }, [isOpen]);

    const loadOrganizations = async () => {
        setIsLoading(true);
        try {
            const response = await stytch.discovery.organizations.list();
            setOrganizations(response.discovered_organizations);
        } catch (error) {
            console.error('Failed to load organizations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOrganizationSelect = async (organization: any) => {
        try {
            // Exchange session for the new organization
            await stytch.session.exchange({
                organization_id: organization.organization.organization_id,
                session_duration_minutes: 60,
            });
            router.push(`/dashboard`);
            setIsOpen(false);
        } catch (error) {
            console.error('Failed to switch organization:', error);
        }
    };

    if (!currentOrganization) return null;

    // Helper to get initials for avatar
    const getInitial = (name: any) => name.charAt(0).toUpperCase();

    return (
        <div className="workspace-switcher-modern" ref={dropdownRef}>
            <button 
                className={`workspace-switcher-trigger-modern${isOpen ? ' open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="workspace-avatar" style={{background: '#4F46E5'}}>
                  {getInitial(currentOrganization.organization_name)}
                </span>
                <span className="workspace-name">{currentOrganization.organization_name}</span>
                <FaChevronDown className="workspace-chevron" />
            </button>

            {isOpen && (
                <div className="workspace-switcher-dropdown-modern">
                    <div className="workspace-switcher-header-modern">
                        Switch Team
                    </div>
                    <div className="workspace-switcher-list-modern">
                        {organizations.map((org) => (
                            <button
                                key={org.organization.organization_id}
                                className={`workspace-switcher-item-modern${org.organization.organization_id === currentOrganization.organization_id ? ' active' : ''}`}
                                onClick={() => handleOrganizationSelect(org)}
                            >
                                <span className="workspace-avatar" style={{background: '#2563EB'}}>
                                  {getInitial(org.organization.organization_name)}
                                </span>
                                <span className="workspace-name">{org.organization.organization_name}</span>
                                {/* Pending invite icon */}
                                {org.membership?.type === 'invited_member' && (
                                  <FaEnvelopeOpenText className="invite-icon" title="Pending invite - click to join" style={{ color: '#f59e42', marginLeft: 6, fontSize: '1.1em' }} />
                                )}
                                {!org.member_authenticated && <FaLock className="lock-icon" />}
                                {/* Current org checkmark */}
                                {org.organization.organization_id === currentOrganization.organization_id && (
                                    <FaCheck className="current-checkmark" title="Current organization" style={{ color: '#6366f1', marginLeft: 'auto', fontSize: '1.1em' }} />
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="workspace-switcher-footer-modern">
                        <button className="workspace-create-btn">
                            + Create Team
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrgSwitcher;