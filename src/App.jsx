import { useState } from "react";
import Header from "./components/Header/Header.jsx";
import Body from "./components/Body/Body.jsx";
import Categories from "./components/Header/Categories.jsx";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <>
      <Header />
      <Categories 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        selectedCategory={selectedCategory} 
        setSelectedCategory={setSelectedCategory} 
      />
      <Body 
        searchTerm={searchTerm} 
        selectedCategory={selectedCategory} 
      />
    </>
  );
}

export default App;
