import React, { useState, useCallback } from 'react';
import { create } from 'zustand';
import { useQuery, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Types
interface User {
    email: string;
    token: string;
}

interface UploadFile {
    id: string;
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    url?: string;
}

interface AuthStore {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

interface UploadStore {
    files: UploadFile[];
    addFiles: (files: File[]) => void;
    updateFileProgress: (id: string, progress: number) => void;
    updateFileStatus: (id: string, status: UploadFile['status'], url?: string) => void;
    clearFiles: () => void;
}

// Zustand Stores
const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    isAuthenticated: false,
    login: async (email: string, password: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (email === 'admin@dugong.com' && password === 'password123') {
            const user = { email, token: 'jwt-token-123' };
            set({ user, isAuthenticated: true });
        } else {
            throw new Error('Invalid credentials');
        }
    },
    logout: () => set({ user: null, isAuthenticated: false }),
}));

const useUploadStore = create<UploadStore>((set, get) => ({
    files: [],
    addFiles: (files: File[]) => {
        const newFiles = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            progress: 0,
            status: 'pending' as const,
        }));
        set({ files: [...get().files, ...newFiles] });
    },
    updateFileProgress: (id: string, progress: number) => {
        set(state => ({
            files: state.files.map(file =>
                file.id === id ? { ...file, progress } : file
            )
        }));
    },
    updateFileStatus: (id: string, status: UploadFile['status'], url?: string) => {
        set(state => ({
            files: state.files.map(file =>
                file.id === id ? { ...file, status, url } : file
            )
        }));
    },
    clearFiles: () => set({ files: [] }),
}));

// UI Components
const Button = ({ children, onClick, disabled, className = '', variant = 'primary', type = 'button' }) => {
    const baseClasses = 'px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 disabled:bg-blue-300',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500 disabled:bg-gray-100',
        danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 disabled:bg-red-300',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

const Input = ({ label, type = 'text', value, onChange, placeholder = '', required = false, className = '' }) => {
    return (
        <div className={`mb-6 ${className}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
        </div>
    );
};

const ProgressBar = ({ progress, className = '' }) => {
    return (
        <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
            <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};

const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const ErrorIcon = () => (
    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const UploadIcon = () => (
    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

// Login Component
const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const login = useAuthStore(state => state.login);

    const loginMutation = useMutation({
        mutationFn: () => login(email, password),
        onError: (error: Error) => {
            setError(error.message);
        },
        onSuccess: () => {
            setError('');
        }
    });

    const handleSubmit = () => {
        setError('');
        loginMutation.mutate();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                        <p className="text-gray-600">Sign in to access Dugong Modeling</p>
                    </div>

                    <div className="space-y-6">
                        <Input
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={handleSubmit}
                            disabled={loginMutation.isPending}
                            className="w-full"
                        >
                            {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Demo credentials: admin@dugong.com / password123
                    </div>
                </div>
            </div>
        </div>
    );
};

// Dashboard Component
const Dashboard = () => {
    const logout = useAuthStore(state => state.logout);
    const { files, addFiles, updateFileProgress, updateFileStatus, clearFiles } = useUploadStore();
    const [dragOver, setDragOver] = useState(false);
    const [uploadError, setUploadError] = useState('');

    // Simulate file upload
    const simulateUpload = useCallback((fileId: string) => {
        updateFileStatus(fileId, 'uploading');

        const interval = setInterval(() => {
            updateFileProgress(fileId, prev => {
                const current = useUploadStore.getState().files.find(f => f.id === fileId);
                if (!current) return 0;

                const newProgress = current.progress + Math.random() * 15 + 5;

                if (newProgress >= 100) {
                    clearInterval(interval);
                    updateFileProgress(fileId, 100);
                    setTimeout(() => {
                        updateFileStatus(fileId, 'success', `/uploads/${fileId}-${Date.now()}.jpg`);
                    }, 500);
                    return 100;
                }

                return newProgress;
            });
        }, 200);
    }, [updateFileProgress, updateFileStatus]);

    const handleFileSelection = (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;

        const filesArray = Array.from(selectedFiles);
        const validTypes = ['image/png', 'image/jpg', 'image/jpeg'];

        // Validate file types
        const invalidFiles = filesArray.filter(file => !validTypes.includes(file.type));
        if (invalidFiles.length > 0) {
            setUploadError(`Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}. Only PNG, JPG, and JPEG files are allowed.`);
            return;
        }

        // Check file count
        if (filesArray.length > 150) {
            setUploadError('Maximum 150 files allowed per upload.');
            return;
        }

        if (files.length + filesArray.length > 150) {
            setUploadError(`Cannot upload ${filesArray.length} files. Maximum total is 150 files (currently have ${files.length}).`);
            return;
        }

        setUploadError('');
        addFiles(filesArray);

        // Start simulated uploads
        setTimeout(() => {
            filesArray.forEach((_, index) => {
                const fileId = useUploadStore.getState().files[files.length + index]?.id;
                if (fileId) {
                    setTimeout(() => simulateUpload(fileId), index * 100);
                }
            });
        }, 100);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleFileSelection(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const getStatusIcon = (status: UploadFile['status']) => {
        switch (status) {
            case 'success':
                return <CheckIcon />;
            case 'error':
                return <ErrorIcon />;
            default:
                return null;
        }
    };

    const completedUploads = files.filter(f => f.status === 'success').length;
    const totalFiles = files.length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">Dugong Modeling</h1>
                            <span className="ml-3 text-sm text-gray-600">AI-powered image analysis for dugong detection</span>
                        </div>
                        <Button onClick={logout} variant="secondary" className="text-sm">
                            Logout
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Images</h2>

                    {/* Upload Area */}
                    <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${dragOver
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    >
                        <UploadIcon />
                        <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">
                            Drop images here or click to browse
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Upload up to 150 images (PNG, JPG, JPEG)
                        </p>
                        <input
                            type="file"
                            multiple
                            accept=".png,.jpg,.jpeg"
                            onChange={(e) => handleFileSelection(e.target.files)}
                            className="hidden"
                            id="file-upload"
                        />
                        <label htmlFor="file-upload">
                            <Button className="cursor-pointer">
                                Choose Files
                            </Button>
                        </label>
                    </div>

                    {/* Upload Error */}
                    {uploadError && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                            {uploadError}
                        </div>
                    )}

                    {/* Upload Progress Summary */}
                    {totalFiles > 0 && (
                        <div className="mt-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Upload Progress ({completedUploads}/{totalFiles} completed)
                                </h3>
                                <Button onClick={clearFiles} variant="secondary" className="text-sm">
                                    Clear All
                                </Button>
                            </div>

                            {/* Overall Progress Bar */}
                            <div className="mb-6">
                                <ProgressBar progress={(completedUploads / totalFiles) * 100} />
                                <p className="text-sm text-gray-600 mt-2">
                                    {Math.round((completedUploads / totalFiles) * 100)}% complete
                                </p>
                            </div>

                            {/* Individual File Progress */}
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {files.map((file) => (
                                    <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                                    {file.file.name}
                                                </span>
                                                {getStatusIcon(file.status)}
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {(file.file.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                        </div>

                                        {file.status === 'uploading' && (
                                            <div className="space-y-2">
                                                <ProgressBar progress={file.progress} />
                                                <p className="text-xs text-gray-600">
                                                    {Math.round(file.progress)}% uploaded
                                                </p>
                                            </div>
                                        )}

                                        {file.status === 'success' && (
                                            <p className="text-xs text-green-600">
                                                ✓ Upload complete - {file.url}
                                            </p>
                                        )}

                                        {file.status === 'error' && (
                                            <p className="text-xs text-red-600">
                                                ✗ Upload failed
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Main Test Component
const Test = () => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);

    return (
        <QueryClientProvider client={new QueryClient()}>
            <div className="font-sans">
                {isAuthenticated ? <Dashboard /> : <LoginPage />}
            </div>
        </QueryClientProvider>
    );
};

export default Test;