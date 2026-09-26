import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../Header/Header";
import { useAuth } from "../../context/AuthContext";

function ProductSection() {
    const { id } = useParams();
    const nav = useNavigate();
    const { addToCart } = useAuth();
    const URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [added, setAdded] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) {
                setErrorMsg("No product ID specified.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setErrorMsg("");
            try {
                const res = await axios.get(`${URL}/products/${id}`);
                setProduct(res.data);
            } catch (err) {
                console.error("Error fetching product details:", err);
                setErrorMsg(err.response?.data?.error || "The requested product could not be loaded.");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, URL]);

    const handleAddToCart = async () => {
        if (!product) return;
        await addToCart(product, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const handleBuyNow = async () => {
        if (!product) return;
        await addToCart(product, quantity);
        nav("/cart");
    };

    const imageUrl = product 
        ? (product.imageUrl || `${URL}/products/image/${product._id}`) 
        : "";

    return (
        <>
            <Header />
            <div className="bg-[#f8f2e7] min-h-[85vh] py-12 px-6 md:px-12 lg:px-30">
                <div className="max-w-5xl mx-auto">

                    <button
                        onClick={() => nav("/")}
                        className="mb-8 flex items-center gap-2 text-[#18474e] font-semibold hover:underline cursor-pointer"
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                        <span>Back to Store</span>
                    </button>

                    {loading ? (
                        <div className="flex flex-col justify-center items-center py-20 gap-3">
                            <i className="fa-solid fa-circle-notch fa-spin text-4xl text-[#18474e]"></i>
                            <span className="text-gray-600 font-medium">Loading product details...</span>
                        </div>
                    ) : errorMsg || !product ? (
                        <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto shadow-md border border-gray-100">
                            <i className="fa-solid fa-triangle-exclamation text-4xl text-amber-500 mb-4"></i>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h3>
                            <p className="text-gray-500 mb-6 text-sm">
                                {errorMsg || "The requested product could not be loaded or may no longer exist."}
                            </p>
                            <button
                                onClick={() => nav("/")}
                                className="px-6 py-3 bg-[#18474e] text-white font-bold rounded-xl cursor-pointer hover:bg-[#12383d] transition"
                            >
                                Browse All Products
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12">
                            
                            {/* Product Visual Box with Backend Image */}
                            <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center min-h-[320px] relative border border-gray-100 overflow-hidden group">
                                <img
                                    src={imageUrl}
                                    alt={product.name}
                                    className="w-full h-72 object-contain group-hover:scale-105 transition duration-500 rounded-xl"
                                    onError={(e) => {
                                        // Fallback if image load fails
                                        e.target.onerror = null;
                                        e.target.src = `${URL}/images/mobile.jpg`;
                                    }}
                                />
                                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs text-[#18474e] text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                                    {product.category}
                                </span>
                            </div>

                            {/* Product Details & Actions */}
                            <div className="flex flex-col justify-between space-y-6">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#4d4d4b] mb-3">
                                        {product.name}
                                    </h1>

                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="text-3xl font-extrabold text-[#18474e]">
                                            ₹{product.price}
                                        </span>
                                        <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                                            In Stock
                                        </span>
                                    </div>

                                    <div className="border-t border-b border-gray-100 py-4 mb-6">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                                            Description
                                        </h4>
                                        <p className="text-gray-600 text-base leading-relaxed">
                                            {product.description || "High-quality item curated especially for your everyday convenience and satisfaction."}
                                        </p>
                                    </div>

                                    {/* Quantity Selector */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                                        <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="px-3.5 py-2 text-gray-600 hover:bg-gray-200 transition font-bold cursor-pointer"
                                            >
                                                -
                                            </button>
                                            <span className="px-4 font-bold text-gray-800 text-base">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={() => setQuantity(quantity + 1)}
                                                className="px-3.5 py-2 text-gray-600 hover:bg-gray-200 transition font-bold cursor-pointer"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={handleAddToCart}
                                        className={`flex-1 py-3.5 px-6 font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                                            added 
                                                ? "bg-emerald-600 text-white" 
                                                : "bg-[#ea846b] text-white hover:bg-[#d96f57]"
                                        }`}
                                    >
                                        <i className={`fa-solid ${added ? "fa-check" : "fa-cart-shopping"}`}></i>
                                        <span>{added ? "Added to Cart!" : "Add to Cart"}</span>
                                    </button>

                                    <button
                                        onClick={handleBuyNow}
                                        className="flex-1 py-3.5 px-6 bg-[#18474e] hover:bg-[#12383d] text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <span>Buy Now</span>
                                        <i className="fa-solid fa-bolt"></i>
                                    </button>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default ProductSection;