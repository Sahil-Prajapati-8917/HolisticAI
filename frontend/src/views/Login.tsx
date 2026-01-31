import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Eye, EyeOff, Shield, CheckCircle2 } from 'lucide-react';

const formSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
});

const Login = () => {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loginAttempts, setLoginAttempts] = useState(0);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "admin@holisticai.com",
            password: "",
        },
    });

    // Check for redirect messages from logout
    useEffect(() => {
        if (location.state?.message) {
            setError(location.state.message);
        }
    }, [location.state]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setError('');
        setIsLoading(true);
        
        try {
            const { data } = await axios.post('http://localhost:3001/api/auth/login', values, {
                timeout: 10000,
            });

            // Extract user and token
            const { accessToken, ...user } = data;

            login(user, accessToken);
            
            // Show success message briefly
            setError('');
            setIsLoading(false);
            
            // Navigate to dashboard with success message
            navigate('/', { 
                state: { 
                    message: 'Login successful! Welcome back.',
                    type: 'success'
                }
            });
        } catch (err: any) {
            setIsLoading(false);
            setLoginAttempts(prev => prev + 1);
            
            // Handle different error types
            let errorMessage = 'Login failed';
            
            if (err.response?.status === 429) {
                errorMessage = 'Too many login attempts. Please try again later.';
            } else if (err.response?.status === 401) {
                errorMessage = 'Invalid email or password. Please check your credentials.';
            } else if (err.response?.status === 403) {
                errorMessage = 'Account temporarily locked. Please contact administrator.';
            } else if (err.code === 'NETWORK_ERROR') {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            
            setError(errorMessage);
            
            // Lock account after 3 failed attempts
            if (loginAttempts >= 2) {
                setTimeout(() => {
                    setError('Account locked for security reasons. Please contact administrator.');
                }, 2000);
            }
        }
    };

    const handleForgotPassword = () => {
        // Navigate to password reset or show modal
        setError('Password reset functionality coming soon. Please contact administrator.');
    };

    const getErrorMessageColor = () => {
        if (error?.includes('locked')) return 'text-red-600';
        if (error?.includes('network')) return 'text-orange-600';
        return 'text-red-600';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            
            <div className="relative z-10 w-full max-w-md">
                {/* Header with branding */}
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center space-x-2">
                        <div className="flex items-center">
                            <Shield className="h-8 w-8 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            HolisticAI
                        </h1>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enterprise Resume Evaluation Platform
                    </p>
                </div>

                {/* Login Card */}
                <Card className="w-full shadow-2xl border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                    <CardHeader className="space-y-1 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <CardTitle className="text-xl font-semibold text-center">
                            Welcome Back
                        </CardTitle>
                        <CardDescription className="text-center">
                            Enter your credentials to access the system
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                                            <div className="relative">
                                                <FormControl>
                                                    <Input 
                                                        placeholder="Enter your email" 
                                                        type="email" 
                                                        className="form-control-with-icon"
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 00-4-4 4 4 0 014-4-4 4 4 0 00 01.5 4.78 4.19L12 4.78a4 4 0 00-4-4-4-4 0 01.41 4.19 1.15 3.58 1.51-2.23-2.61-3.5-2.82-.14L5.51 3.48a4 4 0 00-4-4-4-4 0 01.65 3.28 1.3-2.68-3.54-3.15-2.2-.82L1.17 2.2a4 4 0 00.12 2.03 3.58 3.15.04 2.03.44 2.43.61.58 2.76-.39.26.03.76-.69-1.11-.96-1.5z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">Password</FormLabel>
                                            <div className="relative">
                                                <FormControl>
                                                    <Input 
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Enter your password"
                                                        className="input-enhanced"
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Default password: admin123</p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                {error && (
                                    <Alert variant="destructive" className="mb-4">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>{error.includes('locked') ? 'Access Denied' : 'Login Failed'}</AlertTitle>
                                        <AlertDescription className={getErrorMessageColor()}>
                                            {error}
                                        </AlertDescription>
                                    </Alert>
                                )}
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="remember"
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">
                                            Remember me
                                        </label>
                                    </div>
                                </div>
                                
                                <Button 
                                    type="submit" 
                                    className="w-full btn-gradient hover-lift transition-all" 
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-r-2 border-white border-l-transparent border-t-blue-600"></div>
                                            <span>Signing in...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span>Sign In</span>
                                        </div>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    
                    <CardFooter className="bg-gray-50 dark:bg-gray-800 px-6 py-4">
                        <div className="w-full space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                >
                                    Forgot your password?
                                </button>
                            </div>
                            
                            <div className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Need help? Contact your administrator
                                </p>
                            </div>
                            
                            {/* Security badges */}
                            <div className="flex items-center justify-center space-x-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-1">
                                    <Shield className="h-4 w-4 text-green-500" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Secured</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                    <span className="text-xs text-gray-600 dark:text-gray-400">Enterprise Grade</span>
                                </div>
                            </div>
                        </div>
                    </CardFooter>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
                    <p>&copy; 2024 HolisticAI. All rights reserved.</p>
                    <div className="flex items-center justify-center space-x-2 mt-2">
                        <a href="#" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">Privacy Policy</a>
                        <span className="text-gray-400">•</span>
                        <a href="#" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">Terms of Service</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

