import { useState } from "react";
import Header from "../Header/Header";
import { useAuth } from "../../context/AuthContext";
import LoginModal from "../Auth/LoginModal";
import { useNavigate } from "react-router-dom";

function Profile() {
    const { user, dbUser, orders, cart, logout, getFirstNameUpper, loading } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const nav = useNavigate();

    const handleLogout = async () => {
        await logout();
        nav("/");
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-[70vh] bg-[#f8f2e7] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <i className="fa-solid fa-circle-notch fa-spin text-3xl text-[#18474e]"></i>
                        <p className="text-gray-600 font-medium">Loading profile...</p>
                    </div>
                </div>
            </>
        );
    }

    const displayName = dbUser?.name || user?.displayName || user?.email?.split("@")[0] || "User";

    return (
        <>
            <Header />
            <div className="bg-[#f8f2e7] min-h-[85vh] py-12 px-6 md:px-12 lg:px-30">
                <div className="max-w-4xl mx-auto space-y-8">
                    {user ? (
                        <>
                            {/* Profile Card */}
                            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                                {/* Card Header Banner */}
                                <div className="bg-gradient-to-r from-[#18474e] to-[#26626b] p-8 text-white text-center relative">
                                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white text-[#18474e] border-4 border-white/30 shadow-md flex items-center justify-center overflow-hidden">
                                        {user.photoURL ? (
                                            <img 
                                                src={user.photoURL} 
                                                alt={displayName} 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-3xl font-extrabold uppercase">
                                                {displayName.slice(0, 1)}
                                            </span>
                                        )}
                                    </div>

                                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                                        {displayName}
                                    </h2>
                                    <p className="text-emerald-100 text-sm mt-1">{user.email}</p>
                                </div>

                                {/* Details Section */}
                                <div className="p-6 md:p-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                                Name
                                            </div>
                                            <div className="text-xl font-bold text-[#18474e]">
                                                {displayName}
                                            </div>
                                        </div>

                                        <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                                Email Address
                                            </div>
                                            <div className="text-gray-800 font-medium flex items-center gap-2 text-base">
                                                <i className="fa-regular fa-envelope text-gray-500"></i>
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cart Summary Card */}
                                    <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-[#18474e]">Current Cart</h4>
                                            <p className="text-sm text-gray-600">
                                                You have <span className="font-bold text-[#18474e]">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span> items in your cart.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => nav("/cart")}
                                            className="px-4 py-2 bg-[#18474e] text-white text-sm font-semibold rounded-xl hover:bg-[#12383d] transition cursor-pointer"
                                        >
                                            View Cart
                                        </button>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                                        <button
                                            onClick={() => nav("/")}
                                            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition cursor-pointer"
                                        >
                                            Back to Store
                                        </button>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <i className="fa-solid fa-right-from-bracket"></i>
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Previous Orders Section */}
                            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <i className="fa-solid fa-box-archive text-[#18474e]"></i>
                                        Previous Orders
                                    </h3>
                                    <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                                        Total: {orders ? orders.length : 0}
                                    </span>
                                </div>

                                {orders && orders.length > 0 ? (
                                    <div className="space-y-4">
                                        {orders.map((order, idx) => (
                                            <div key={order.orderId || idx} className="p-5 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-white transition shadow-xs">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 pb-3 border-b border-gray-200">
                                                    <div>
                                                        <span className="font-bold text-[#18474e]">{order.orderId}</span>
                                                        <span className="text-xs text-gray-500 ml-3">
                                                            {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                                                            {order.status || "Completed"}
                                                        </span>
                                                        <span className="font-extrabold text-lg text-gray-900">
                                                            ₹{order.totalAmount}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    {order.items && order.items.map((item, iIndex) => (
                                                        <div key={iIndex} className="flex justify-between items-center text-sm text-gray-700">
                                                            <span>
                                                                <span className="font-semibold text-gray-900">{item.name}</span>
                                                                <span className="text-gray-500 ml-2">x{item.quantity}</span>
                                                            </span>
                                                            <span className="font-medium text-gray-800">₹{item.price * item.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <i className="fa-solid fa-cart-flatbed text-4xl mb-3 text-gray-300"></i>
                                        <p className="font-medium">No previous orders found.</p>
                                        <p className="text-xs text-gray-400 mt-1">Orders placed will appear here.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100 max-w-md mx-auto">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#f8f2e7] flex items-center justify-center text-[#18474e]">
                                <i className="fa-solid fa-user-lock text-3xl"></i>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                You are not signed in
                            </h2>
                            <p className="text-gray-500 mb-6 text-sm">
                                Please sign in to view your profile, previous orders, and cart.
                            </p>
                            <button
                                onClick={() => setShowLoginModal(true)}
                                className="w-full py-3 bg-[#18474e] hover:bg-[#12383d] text-white font-bold rounded-xl transition shadow-md cursor-pointer"
                            >
                                Sign In Now
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <LoginModal 
                isOpen={showLoginModal} 
                onClose={() => setShowLoginModal(false)} 
            />
        </>
    );
}

export default Profile;