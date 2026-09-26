import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { 
    auth, 
    googleProvider 
} from "../config";
import { 
    onAuthStateChanged, 
    signInWithPopup, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    updateProfile, 
    signOut 
} from "firebase/auth";

const AuthContext = createContext();
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [dbUser, setDbUser] = useState(null);
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Helper to update shared user & order state
    const updateUserData = (updatedDbUser) => {
        if (updatedDbUser) {
            setDbUser(updatedDbUser);
            setCart(updatedDbUser.cart || []);
            setOrders(updatedDbUser.orders || []);
        }
    };

    // Sync user with MongoDB backend and merge guest cart if present
    const syncUserWithBackend = async (firebaseUser) => {
        if (!firebaseUser || !firebaseUser.email) {
            setDbUser(null);
            setCart([]);
            setOrders([]);
            return;
        }

        try {
            const nameToSave = firebaseUser.displayName || firebaseUser.email.split("@")[0];
            const res = await axios.post(`${BACKEND_URL}/users/sync`, {
                name: nameToSave,
                email: firebaseUser.email,
                firebaseUid: firebaseUser.uid
            });
            
            if (res.data) {
                const dbCart = res.data.cart || [];
                // Check if user has an un-synced guest cart from before login
                const localCartStr = localStorage.getItem("mykart_cart");
                let guestCart = [];
                try {
                    guestCart = localCartStr ? JSON.parse(localCartStr) : [];
                } catch (e) {
                    guestCart = [];
                }

                if (guestCart.length > 0) {
                    // Merge guest cart items into user's DB cart
                    const mergedCart = [...dbCart];
                    guestCart.forEach(gItem => {
                        const idx = mergedCart.findIndex(m => m.productId === gItem.productId);
                        if (idx > -1) {
                            mergedCart[idx].quantity += gItem.quantity;
                        } else {
                            mergedCart.push(gItem);
                        }
                    });

                    localStorage.removeItem("mykart_cart");
                    setDbUser({ ...res.data, cart: mergedCart });
                    setCart(mergedCart);
                    setOrders(res.data.orders || []);

                    // Save merged cart to DB
                    await axios.post(`${BACKEND_URL}/users/cart`, {
                        email: firebaseUser.email,
                        cart: mergedCart
                    });
                } else {
                    setDbUser(res.data);
                    setCart(dbCart);
                    setOrders(res.data.orders || []);
                }
            }
        } catch (error) {
            console.error("Error syncing user with MongoDB:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                await syncUserWithBackend(currentUser);
            } else {
                setDbUser(null);
                // Load local guest cart if any
                const localCart = JSON.parse(localStorage.getItem("mykart_cart") || "[]");
                setCart(localCart);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Save cart to MongoDB if logged in, or localStorage if guest
    const saveCartToBackend = async (newCart) => {
        setCart(newCart);
        if (user && user.email) {
            try {
                const res = await axios.post(`${BACKEND_URL}/users/cart`, {
                    email: user.email,
                    cart: newCart
                });
                if (res.data) {
                    setDbUser(res.data);
                }
            } catch (error) {
                console.error("Error updating cart in MongoDB:", error);
                throw new Error("Failed to save cart. Please check your network connection.");
            }
        } else {
            localStorage.setItem("mykart_cart", JSON.stringify(newCart));
        }
    };

    const addToCart = async (product, quantity = 1) => {
        const existingIndex = cart.findIndex(item => item.productId === (product._id || product.productId));
        let updatedCart;
        if (existingIndex > -1) {
            updatedCart = [...cart];
            updatedCart[existingIndex].quantity += quantity;
        } else {
            updatedCart = [
                ...cart,
                {
                    productId: product._id || product.productId,
                    name: product.name,
                    price: product.price,
                    category: product.category,
                    description: product.description || "",
                    quantity: quantity
                }
            ];
        }
        await saveCartToBackend(updatedCart);
    };

    const removeFromCart = async (productId) => {
        const updatedCart = cart.filter(item => item.productId !== productId);
        await saveCartToBackend(updatedCart);
    };

    const updateQuantity = async (productId, quantity) => {
        if (quantity <= 0) {
            await removeFromCart(productId);
            return;
        }
        const updatedCart = cart.map(item => 
            item.productId === productId ? { ...item, quantity } : item
        );
        await saveCartToBackend(updatedCart);
    };

    const clearCart = async () => {
        await saveCartToBackend([]);
    };

    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await syncUserWithBackend(result.user);
            return result.user;
        } catch (error) {
            console.error("Error signing in with Google:", error);
            throw error;
        }
    };

    const loginWithEmail = async (email, password) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            await syncUserWithBackend(result.user);
            return result.user;
        } catch (error) {
            console.error("Error logging in with email:", error);
            throw error;
        }
    };

    const signupWithEmail = async (name, email, password) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            if (name && result.user) {
                await updateProfile(result.user, { displayName: name });
            }
            const updatedUser = auth.currentUser || result.user;
            setUser({ ...updatedUser });
            await syncUserWithBackend(updatedUser);
            return updatedUser;
        } catch (error) {
            console.error("Error signing up with email:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setDbUser(null);
            setCart([]);
            setOrders([]);
            localStorage.removeItem("mykart_cart");
        } catch (error) {
            console.error("Error logging out:", error);
            throw error;
        }
    };

    // Extract user's first name in UPPERCASE
    const getFirstNameUpper = (currentUser = user) => {
        if (!currentUser) return "PROFILE";
        if (currentUser.displayName && currentUser.displayName.trim()) {
            const firstName = currentUser.displayName.trim().split(" ")[0];
            return firstName.toUpperCase();
        }
        if (currentUser.email) {
            const emailName = currentUser.email.split("@")[0].split(".")[0];
            return emailName.toUpperCase();
        }
        return "PROFILE";
    };

    return (
        <AuthContext.Provider value={{
            user,
            dbUser,
            cart,
            orders,
            loading,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            updateUserData,
            loginWithGoogle,
            loginWithEmail,
            signupWithEmail,
            logout,
            getFirstNameUpper,
            syncUserWithBackend
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
