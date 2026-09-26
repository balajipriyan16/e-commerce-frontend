import "./Header.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoginModal from "../Auth/LoginModal";

function Header(props) {
    const [Spawn, SetSpawn] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const nav = useNavigate();
    const { user, cart, getFirstNameUpper } = useAuth();

    const firstNameUpper = getFirstNameUpper();
    const cartItemCount = cart ? cart.reduce((total, item) => total + item.quantity, 0) : 0;

    return (
        <>
            <div className="bg-[#f8f2e7] shadow-sm">
                <div className="mx-6 md:mx-12 lg:mx-30 px-5 py-3 flex items-center justify-between">

                    <div className="cursor-pointer" onClick={() => nav("/")}>
                        <h1 className="text-[#4d4d4b] mykart-font text-3xl md:text-4xl font-extrabold tracking-tight">
                            MyKart
                        </h1>
                    </div>

                    <div className="hidden md:flex items-center gap-4">

                        <div 
                            onClick={() => nav("/cart")}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-gray-800 shadow-sm cursor-pointer transition hover:bg-gray-900 hover:text-white hover:scale-105 relative"
                        >
                            <i className="fa-solid fa-cart-shopping"></i>
                            <span className="font-medium">My Cart</span>
                            {cartItemCount > 0 && (
                                <span className="bg-[#ea846b] text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1 animate-pulse">
                                    {cartItemCount}
                                </span>
                            )}
                        </div>

                        {user ? (
                            <div 
                                onClick={() => nav("/profile")} 
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#18474e] text-white shadow-sm cursor-pointer transition hover:bg-[#12383d] hover:scale-105"
                                title="View Profile"
                            >
                                <i className="fa-regular fa-user"></i>
                                <span className="font-bold tracking-wider uppercase">{firstNameUpper}</span>
                            </div>
                        ) : (
                            <div 
                                onClick={() => setShowLoginModal(true)} 
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-gray-800 shadow-sm cursor-pointer transition hover:bg-gray-900 hover:text-white hover:scale-105"
                            >
                                <i className="fa-solid fa-right-to-bracket"></i>
                                <span className="font-medium">Login</span>
                            </div>
                        )}

                    </div>

                    <div
                        onClick={() => SetSpawn(!Spawn)}
                        className="flex md:hidden items-center justify-center w-11 h-11 rounded-full bg-white text-gray-800 shadow-sm cursor-pointer transition hover:bg-gray-900 hover:text-white hover:scale-105"
                    >
                        <i className={`fa-solid ${Spawn ? "fa-xmark" : "fa-bars"} text-lg`}></i>
                    </div>

                </div>
            </div>

            {/* Mobile Sidebar */}
            <div className={`fixed inset-0 z-50 md:hidden transition-all duration-500 ${Spawn ? "visible" : "invisible"}`}>
                <div onClick={() => SetSpawn(false)} className={`absolute inset-0 bg-black/40 transition-opacity duration-500 ${Spawn ? "opacity-100" : "opacity-0"}`}></div>
                <div className={`absolute left-0 top-0 h-full w-[80%] max-w-sm bg-[#eb876d] shadow-2xl transition-transform duration-500 ease-out ${Spawn ? "translate-x-0" : "-translate-x-full"}`} >
                    <div className="px-6 py-6">

                        <div className="flex justify-end mb-8">
                            <button
                                onClick={() => SetSpawn(false)}
                                className="flex items-center justify-center w-11 h-11 rounded-full bg-white text-gray-800 shadow-sm cursor-pointer transition hover:bg-gray-900 hover:text-white hover:scale-105"
                            >
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">

                            <button 
                                onClick={() => {
                                    nav("/cart");
                                    SetSpawn(false);
                                }}
                                className="flex items-center justify-between gap-3 px-5 py-3 rounded-full bg-white text-gray-800 shadow-sm cursor-pointer transition hover:bg-gray-900 hover:text-white hover:scale-105"
                            >
                                <div className="flex items-center gap-3">
                                    <i className="fa-solid fa-cart-shopping"></i>
                                    <span className="font-medium">My Cart</span>
                                </div>
                                {cartItemCount > 0 && (
                                    <span className="bg-[#18474e] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                        {cartItemCount}
                                    </span>
                                )}
                            </button>

                            {user ? (
                                <button 
                                    onClick={() => {
                                        nav("/profile");
                                        SetSpawn(false);
                                    }} 
                                    className="flex items-center gap-3 px-5 py-3 rounded-full bg-[#18474e] text-white shadow-sm cursor-pointer transition hover:bg-[#12383d] hover:scale-105"
                                >
                                    <i className="fa-regular fa-user"></i>
                                    <span className="font-bold tracking-wider uppercase">{firstNameUpper}</span>
                                </button>
                            ) : (
                                <button 
                                    onClick={() => {
                                        setShowLoginModal(true);
                                        SetSpawn(false);
                                    }} 
                                    className="flex items-center gap-3 px-5 py-3 rounded-full bg-white text-gray-800 shadow-sm cursor-pointer transition hover:bg-gray-900 hover:text-white hover:scale-105"
                                >
                                    <i className="fa-solid fa-right-to-bracket"></i>
                                    <span className="font-medium">Login</span>
                                </button>
                            )}
                        </div>
                    </div>
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

export default Header;