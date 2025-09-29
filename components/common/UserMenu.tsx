import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../../types';

interface UserMenuProps {
    user: User;
    onSettings: () => void;
    onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onSettings, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-200 dark:focus:ring-offset-dark-base-200 focus:ring-primary rounded-full" aria-haspopup="true" aria-expanded={isOpen} aria-label="User menu">
                <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-base-100 dark:bg-dark-base-200 rounded-md shadow-lg py-1 z-30 animate-fade-in ring-1 ring-black ring-opacity-5" role="menu" aria-orientation="vertical">
                    <button
                        onClick={() => { onSettings(); setIsOpen(false); }}
                        className="block w-full text-left px-4 py-2 text-sm text-base-content dark:text-dark-base-content hover:bg-base-200 dark:hover:bg-dark-base-300 transition-colors"
                        role="menuitem"
                    >
                        Settings
                    </button>
                    <button
                        onClick={() => { onLogout(); setIsOpen(false); }}
                        className="block w-full text-left px-4 py-2 text-sm text-base-content dark:text-dark-base-content hover:bg-base-200 dark:hover:bg-dark-base-300 transition-colors"
                        role="menuitem"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
