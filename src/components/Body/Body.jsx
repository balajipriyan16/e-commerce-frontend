import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Body({ searchTerm = "", selectedCategory = "All" }) {
    const URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    const nav = useNavigate();
    const { addToCart } = useAuth();
    const [addedId, setAddedId] = useState(null);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getProducts = async () => {
            try {
                const res = await axios.get(`${URL}/products`);
                setData(res.data);
            } catch (err) {
                console.error("Error fetching products:", err);
            } finally {
                setLoading(false);
            }
        };

        getProducts();
    }, [URL]);

    // Filter products by selectedCategory and searchTerm
    const filteredProducts = data.filter((item) => {
        const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
        const matchesSearch = !searchTerm || 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const handleAddToCart = async (item, e) => {
        e.stopPropagation();
        await addToCart(item);
        setAddedId(item._id);
        setTimeout(() => setAddedId(null), 1500);
    };

    return (
        <>
            <div className="bg-[#f8f2e7] py-16 px-6 md:px-12 lg:px-30 min-h-[70vh]">
                <div className="max-w-7xl mx-auto">

                    <div className="text-center mb-12">
                        <h1 className="text-[#18474e] mykart-font text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4">
                            Shop Your Way
                        </h1>

                        <p className="text-[#4d4d4b] text-lg md:text-xl max-w-2xl mx-auto">
                            Explore our featured products, handpicked for quality, value, and everyday needs.
                        </p>

                        {(selectedCategory !== "All" || searchTerm) && (
                            <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-[#18474e]">
                                <span>Showing results for:</span>
                                {selectedCategory !== "All" && (
                                    <span className="bg-white px-3 py-1 rounded-full shadow-xs">
                                        Category: {selectedCategory}
                                    </span>
                                )}
                                {searchTerm && (
                                    <span className="bg-white px-3 py-1 rounded-full shadow-xs">
                                        Search: "{searchTerm}"
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <i className="fa-solid fa-circle-notch fa-spin text-4xl text-[#18474e]"></i>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto shadow-md">
                            <i className="fa-solid fa-magnifying-glass text-5xl text-gray-300 mb-4"></i>
                            <h3 className="text-xl font-bold text-gray-700 mb-2">No products found</h3>
                            <p className="text-gray-500 text-sm">
                                Try searching for another keyword or selecting a different category.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProducts.map((item) => {
                                const prodImg = item.imageUrl || `${URL}/products/image/${item._id}`;
                                return (
                                    <div
                                        key={item._id}
                                        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden group flex flex-col justify-between border border-gray-100"
                                    >
                                        <div className="p-6">
                                            {/* Product Image Container */}
                                            <div 
                                                onClick={() => nav(`/product/${item._id}`)}
                                                className="w-full h-52 bg-gray-50 rounded-xl mb-4 p-4 flex items-center justify-center relative overflow-hidden cursor-pointer"
                                            >
                                                <img
                                                    src={prodImg}
                                                    alt={item.name}
                                                    className="max-h-full object-contain group-hover:scale-105 transition duration-500"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = `${URL}/images/mobile.jpg`;
                                                    }}
                                                />
                                                <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 bg-white/90 backdrop-blur-xs text-gray-700 rounded-full shadow-xs">
                                                    {item.category}
                                                </span>
                                            </div>

                                            <h3 
                                                onClick={() => nav(`/product/${item._id}`)}
                                                className="text-xl font-bold text-[#4d4d4b] mb-2 line-clamp-1 cursor-pointer hover:text-[#18474e] transition"
                                            >
                                                {item.name}
                                            </h3>

                                            {item.description && (
                                                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                                                    {item.description}
                                                </p>
                                            )}

                                            <p className="text-[#18474e] mb-4 font-extrabold text-2xl">
                                                ₹{item.price}
                                            </p>

                                            <div className="flex items-center justify-between gap-3 mb-4">
                                                <button
                                                    onClick={() => nav(`/product/${item._id}`)}
                                                    className="flex-1 bg-[#18474e] text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-[#12383d] transition duration-300 cursor-pointer text-center"
                                                >
                                                    Explore
                                                </button>

                                                <div 
                                                    onClick={() => nav(`/product/${item._id}`)}
                                                    className="w-10 h-10 shrink-0 bg-[#f0e8da] rounded-xl flex items-center justify-center text-[#18474e] group-hover:bg-[#18474e] group-hover:text-white transition duration-300 cursor-pointer"
                                                >
                                                    <i className="fa-solid fa-arrow-right"></i>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={(e) => handleAddToCart(item, e)}
                                                className={`w-full font-semibold py-2.5 rounded-xl transition duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                                                    addedId === item._id 
                                                        ? "bg-emerald-600 text-white" 
                                                        : "bg-[#ea846b] text-white hover:bg-[#d96f57]"
                                                }`}
                                            >
                                                <i className={`fa-solid ${addedId === item._id ? "fa-check" : "fa-cart-shopping"}`}></i>
                                                <span>{addedId === item._id ? "Added to Cart!" : "Add to Cart"}</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}

export default Body;
