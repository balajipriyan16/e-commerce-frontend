function Categories({ searchTerm, setSearchTerm, selectedCategory, setSelectedCategory }) {
    const categories = [
        "All",
        "Mobiles & Accessories",
        "Computers & Laptops",
        "TVs & Home Appliances",
        "Fashion"
    ];

    return (
        <>
            <div className="bg-[#18474e] py-5 shadow-sm">
                <div className="mx-6 md:mx-12 lg:mx-30">

                    <div className="flex flex-col lg:flex-row items-center gap-5">

                        <div className="flex gap-3 flex-wrap justify-center lg:justify-start flex-1">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition cursor-pointer ${
                                        selectedCategory === cat
                                            ? "bg-white text-[#18474e] font-bold shadow-xs"
                                            : "text-white hover:text-gray-200 hover:bg-white/10"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="w-full lg:w-auto lg:min-w-70 xl:min-w-87.5">
                            <div className="flex items-center gap-3 w-full px-4 py-2.5 bg-white rounded-full shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-[#18474e]/20 transition">
                                <span className="cursor-pointer">
                                    <i className="fa-solid fa-magnifying-glass text-gray-500"></i>
                                </span>

                                <input
                                    type="text"
                                    value={searchTerm || ""}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search products by name or category..."
                                    className="w-full min-w-0 outline-none bg-transparent text-gray-800 text-sm"
                                />

                                {searchTerm && (
                                    <button 
                                        onClick={() => setSearchTerm("")}
                                        className="text-gray-400 hover:text-gray-600 text-xs"
                                    >
                                        <i className="fa-solid fa-circle-xmark"></i>
                                    </button>
                                )}
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </>
    );
}

export default Categories;