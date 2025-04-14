import { useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import SearchResults from "@/components/SearchResults";
import SearchHistory from "@/components/SearchHistory";

export default function Home() {
  const [currentImageId, setCurrentImageId] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleImageUploaded = (imageId: number) => {
    setIsSearching(true);
    setCurrentImageId(imageId);
    
    // Simulate a brief search delay for UX purposes
    setTimeout(() => {
      setIsSearching(false);
    }, 1000);
  };
  
  const handleHistoryItemSelected = (imageId: number) => {
    setCurrentImageId(imageId);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-dark tracking-tight sm:text-4xl">
          AI-Powered Image Search
        </h2>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Find visually similar images through the power of deep learning
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left column: Upload and History */}
        <div className="w-full lg:w-1/3">
          <ImageUpload onImageUploaded={handleImageUploaded} />
          <SearchHistory onHistoryItemSelected={handleHistoryItemSelected} />
        </div>
        
        {/* Right column: Results */}
        <div className="w-full lg:w-2/3">
          <SearchResults 
            imageId={currentImageId} 
            isSearching={isSearching} 
          />
        </div>
      </div>
    </main>
  );
}
