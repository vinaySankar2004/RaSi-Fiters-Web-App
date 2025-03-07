import React from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import "./Home.css";

const Home = () => {
    return (
        <div className="home-container">
            <Navbar />
            <HeroSection />
        </div>
    );
};

export default Home;
