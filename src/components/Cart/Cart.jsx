import { useState } from "react";
import axios from "axios";
import Header from "../Header/Header";
import { useAuth } from "../../context/AuthContext";
import LoginModal from "../Auth/LoginModal";
import { useNavigate } from "react-router-dom";

function Cart() {
    const { user, cart, updateQuantity, removeFromCart, clearCart, updateUserData } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isCheckoutSubmitted, setIsCheckoutSubmitted] = useState(false);
    const [placedOrder, setPlacedOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const nav = useNavigate();
    const URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

    const subtotal = cart ? cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;

    const handleOfficialRazorpayCheckout = async () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        if (cart.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            // 1. Create official order on backend with server-calculated amount
            const orderRes = await axios.post(`${URL}/create-razorpay-order`, {
                email: user.email,
                items: cart
            });

            if (!orderRes.data || !orderRes.data.success) {
                throw new Error(orderRes.data?.error || "Failed to initialize Razorpay order");
            }

            const { orderId, amount, currency, key } = orderRes.data;

            // 2. Configure official Razorpay SDK options
            const options = {
                key: key || import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: amount,
                currency: currency || "INR",
                name: "MyKart E-Commerce",
                description: `Payment for ${cart.length} item(s)`,
                order_id: orderId,
                handler: async function (response) {
                    setLoading(true);
                    try {
                        // 3. Confirm order in MongoDB ONLY AFTER PAYMENT COMPLETED WITH VERIFIED SIGNATURE
                        const verifyRes = await axios.post(`${URL}/verify-razorpay-payment`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            email: user.email
                        });

                        if (verifyRes.data && verifyRes.data.success) {
                            setPlacedOrder(verifyRes.data.order);
                            setIsCheckoutSubmitted(true);
                            if (verifyRes.data.user) {
                                updateUserData(verifyRes.data.user);
                            } else {
                                await clearCart();
                            }
                        } else {
                            setError(verifyRes.data?.error || "Payment verification failed. Order not confirmed.");
                        }
                    } catch (verifyErr) {
                        console.error("Error verifying payment:", verifyErr);
                        setError(verifyErr.response?.data?.error || "Error confirming payment signature with server.");
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: user.displayName || user.email.split("@")[0],
                    email: user.email
                },
                theme: {
                    color: "#18474e"
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            // 3. Open Official Razorpay Window
            if (window.Razorpay) {
                const rzp = new window.Razorpay(options);
                rzp.on("payment.failed", function (response) {
                    setLoading(false);
                    setError(response.error?.description || "Payment failed in Razorpay.");
                });
                rzp.open();
            } else {
                throw new Error("Payment SDK script not loaded. Please refresh.");
            }

        } catch (err) {
            console.error("Razorpay checkout error:", err);
            setError(err.response?.data?.error || err.message || "Failed to launch Razorpay checkout.");
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="bg-[#f8f2e7] min-h-[85vh] py-12 px-6 md:px-12 lg:px-30">
                <div className="max-w-6xl mx-auto">

                    <button
                        onClick={() => nav("/")}
                        className="mb-6 flex items-center gap-2 text-[#18474e] font-semibold hover:underline cursor-pointer"
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                        <span>Back to Store</span>
                    </button>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#4d4d4b] mb-8 flex items-center gap-3">
                        <i className="fa-solid fa-cart-shopping text-[#18474e]"></i>
                        <span>Shopping Cart</span>
                    </h1>

                    {/* Order Confirmed Screen */}
                    {isCheckoutSubmitted && placedOrder ? (
                        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center max-w-2xl mx-auto border border-emerald-100 animate-fadeIn">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                                <i className="fa-solid fa-check text-4xl"></i>
                            </div>

                            <div className="inline-block px-4 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full uppercase tracking-widest mb-3">
                                Payment Confirmed
                            </div>

                            <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
                                Order Confirmed!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Your payment was successful and your order has been saved to your profile.
                            </p>

                            <div className="bg-gray-50 rounded-2xl p-6 text-left mb-8 border border-gray-100 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Order Reference:</span>
                                    <span className="font-bold text-[#18474e]">{placedOrder.orderId}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Total Items:</span>
                                    <span className="font-bold text-gray-800">{placedOrder.items?.length || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Payment Status:</span>
                                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                                        <i className="fa-solid fa-circle-check"></i>
                                        {placedOrder.status || "Paid & Confirmed"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-base pt-3 border-t border-gray-200">
                                    <span className="font-bold text-gray-700">Total Paid:</span>
                                    <span className="font-extrabold text-emerald-600 text-2xl">₹{placedOrder.totalAmount}</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => nav("/profile")}
                                    className="flex-1 py-3.5 bg-[#18474e] text-white font-bold rounded-xl hover:bg-[#12383d] transition cursor-pointer shadow-md"
                                >
                                    View Orders in Profile
                                </button>
                                <button
                                    onClick={() => nav("/")}
                                    className="flex-1 py-3.5 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition cursor-pointer"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    ) : cart.length === 0 ? (
                        /* Empty Cart State */
                        <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto shadow-md border border-gray-100">
                            <i className="fa-solid fa-cart-arrow-down text-5xl text-gray-300 mb-4"></i>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h3>
                            <p className="text-gray-500 mb-6 text-sm">
                                Looks like you haven't added any items to your cart yet.
                            </p>
                            <button
                                onClick={() => nav("/")}
                                className="w-full py-3.5 bg-[#18474e] hover:bg-[#12383d] text-white font-bold rounded-xl transition shadow-md cursor-pointer"
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        /* Active Cart Grid */
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* Cart Items List */}
                            <div className="lg:col-span-2 space-y-4">
                                {error && (
                                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                                        <i className="fa-solid fa-circle-exclamation shrink-0"></i>
                                        <span>{error}</span>
                                    </div>
                                )}

                                {cart.map((item) => (
                                    <div
                                        key={item.productId}
                                        className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-16 h-16 bg-[#f0e8da] rounded-xl flex items-center justify-center text-[#18474e] shrink-0 font-bold overflow-hidden">
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-1" />
                                                ) : (
                                                    <i className="fa-solid fa-box text-xl"></i>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-lg line-clamp-1">
                                                    {item.name}
                                                </h3>
                                                <span className="text-xs font-semibold px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full inline-block mt-1">
                                                    {item.category || "General"}
                                                </span>
                                                <div className="text-[#18474e] font-extrabold text-base mt-1">
                                                    ₹{item.price} each
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quantity & Delete */}
                                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    className="px-3 py-1 text-gray-600 hover:bg-gray-200 transition font-bold cursor-pointer"
                                                >
                                                    -
                                                </button>
                                                <span className="px-3 font-bold text-gray-800 text-sm">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    className="px-3 py-1 text-gray-600 hover:bg-gray-200 transition font-bold cursor-pointer"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div className="text-right min-w-[80px]">
                                                <div className="font-extrabold text-gray-900 text-lg">
                                                    ₹{item.price * item.quantity}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => removeFromCart(item.productId)}
                                                className="text-red-400 hover:text-red-600 p-2 cursor-pointer transition"
                                                title="Remove item"
                                            >
                                                <i className="fa-solid fa-trash-can text-lg"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary Box */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 sticky top-6">
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                        <h3 className="text-xl font-bold text-gray-800">
                                            Order Summary
                                        </h3>
                                        <span className="text-xs font-extrabold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 flex items-center gap-1">
                                            <i className="fa-solid fa-shield-halved"></i>
                                            Secure Payment
                                        </span>
                                    </div>

                                    <div className="space-y-4 mb-6 text-sm">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal</span>
                                            <span className="font-semibold text-gray-800">₹{subtotal}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Shipping Fee</span>
                                            <span className="font-semibold text-emerald-600">FREE</span>
                                        </div>
                                        <div className="border-t border-gray-100 pt-4 flex justify-between text-base font-extrabold text-gray-900">
                                            <span>Total Amount</span>
                                            <span className="text-[#18474e] text-2xl">₹{total}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleOfficialRazorpayCheckout}
                                        disabled={loading}
                                        className="w-full py-4 bg-[#18474e] hover:bg-[#12383d] text-white font-extrabold text-base rounded-xl transition shadow-lg cursor-pointer flex items-center justify-center gap-3 disabled:opacity-60"
                                    >
                                        {loading ? (
                                            <>
                                                <i className="fa-solid fa-circle-notch fa-spin"></i>
                                                <span>Opening Payment Gateway...</span>
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-lock"></i>
                                                <span>Pay ₹{total} with Razorpay</span>
                                            </>
                                        )}
                                    </button>

                                    <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                                        <p className="text-xs text-gray-400 font-medium flex items-center justify-center gap-1">
                                            <i className="fa-solid fa-shield-halved text-emerald-600"></i>
                                            Encrypted & Secure Payment Gateway
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}

                </div>
            </div>

            {/* Login Modal */}
            <LoginModal 
                isOpen={showLoginModal} 
                onClose={() => setShowLoginModal(false)} 
            />
        </>
    );
}

export default Cart;
