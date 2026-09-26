import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function LoginModal({ isOpen, onClose }) {
    const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const formatErrorMessage = (err) => {
        const message = err?.code || err?.message || "";
        if (message.includes("auth/invalid-credential") || message.includes("auth/wrong-password")) {
            return "Invalid email or password.";
        }
        if (message.includes("auth/user-not-found")) {
            return "No account found with this email.";
        }
        if (message.includes("auth/email-already-in-use")) {
            return "An account with this email already exists.";
        }
        if (message.includes("auth/weak-password")) {
            return "Password should be at least 6 characters long.";
        }
        if (message.includes("auth/popup-closed-by-user")) {
            return "Sign-in cancelled.";
        }
        return err?.message || "An error occurred. Please try again.";
    };

    const handleGoogleLogin = async () => {
        setError("");
        setLoading(true);
        try {
            await loginWithGoogle();
            onClose();
        } catch (err) {
            setError(formatErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (isSignUp) {
                if (!name.trim()) {
                    setError("Please enter your name.");
                    setLoading(false);
                    return;
                }
                await signupWithEmail(name, email, password);
            } else {
                await loginWithEmail(email, password);
            }
            onClose();
        } catch (err) {
            setError(formatErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div 
                className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 transition-all duration-300 transform scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Banner */}
                <div className="bg-[#18474e] p-6 text-white text-center relative">
                    <button 
                        onClick={onClose}
                        className="absolute right-4 top-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer text-white"
                        aria-label="Close"
                    >
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                    <h2 className="text-2xl font-bold mykart-font tracking-wide">
                        {isSignUp ? "Create an Account" : "Welcome Back"}
                    </h2>
                    <p className="text-emerald-100 text-sm mt-1 font-light">
                        {isSignUp ? "Sign up to start shopping on MyKart" : "Sign in to access your MyKart account"}
                    </p>
                </div>

                <div className="p-6">
                    {/* Mode Toggle Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                        <button
                            type="button"
                            onClick={() => { setIsSignUp(false); setError(""); }}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                                !isSignUp ? "bg-white text-[#18474e] shadow-xs" : "text-gray-500 hover:text-gray-800"
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsSignUp(true); setError(""); }}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                                isSignUp ? "bg-white text-[#18474e] shadow-xs" : "text-gray-500 hover:text-gray-800"
                            }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                            <i className="fa-solid fa-circle-exclamation shrink-0"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Google Login Button */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition shadow-xs flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 mb-5"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                        </svg>
                        <span>Continue with Google</span>
                    </button>

                    <div className="relative flex items-center justify-center mb-5">
                        <div className="border-t border-gray-200 w-full"></div>
                        <span className="bg-white px-3 text-xs uppercase font-medium text-gray-400 absolute">OR</span>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isSignUp && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                        <i className="fa-regular fa-user"></i>
                                    </span>
                                    <input
                                        type="text"
                                        required={isSignUp}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#18474e] focus:bg-white text-gray-800 transition"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <i className="fa-regular fa-envelope"></i>
                                </span>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#18474e] focus:bg-white text-gray-800 transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <i className="fa-solid fa-lock"></i>
                                </span>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#18474e] focus:bg-white text-gray-800 transition"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-[#18474e] hover:bg-[#12383d] text-white font-bold rounded-xl transition shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                        >
                            {loading ? (
                                <i className="fa-solid fa-circle-notch fa-spin"></i>
                            ) : (
                                <>
                                    <span>{isSignUp ? "Sign Up" : "Sign In"}</span>
                                    <i className="fa-solid fa-arrow-right text-xs"></i>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginModal;
