import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    login: (userData: any, token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial check - you might want to try to silent refresh here or check localStorage
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('accessToken');

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setAccessToken(storedToken);
        }
        setLoading(false);
    }, []);

    const login = (userData: User, token: string) => {
        setUser(userData);
        setAccessToken(token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('accessToken', token);
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:3001/api/auth/logout');
        } catch (error) {
            console.error('Logout failed', error);
        }
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, login, logout, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
