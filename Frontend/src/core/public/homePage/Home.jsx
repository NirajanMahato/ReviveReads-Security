import React, { useRef, useState } from 'react'
import HeroSection from './HeroSection';
import RecommendSection from './RecommendSection';
import Navbar from '../../../components/Navbar';
import BottomNavBar from '../../../components/BottomNavBar';
import Footer from '../../../components/Footer';

const Home = () => {

  const recommendRef = useRef(null);
  const [activeTab, setActiveTab] = useState("Recommended");

  const scrollToRecommendSection = () => {
    setActiveTab("New Listings");
    recommendRef.current?.scrollIntoView({behavior: 'smooth'});
  }
  return (
    <>
      <div className="min-h-screen mx-auto max-w-[1300px]">
        <Navbar/>
        <HeroSection scrollToRecommendSection={scrollToRecommendSection} />
        <div ref={recommendRef}>
          <RecommendSection activeTab={activeTab} setActiveTab={setActiveTab}/>
        </div>
        <BottomNavBar/>
        <Footer/>
      </div>
    </>
  );
}

export default Home