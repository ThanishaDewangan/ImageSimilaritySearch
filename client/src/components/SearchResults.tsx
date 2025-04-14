import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SimilarImage, SearchResult, ViewMode, SortMode } from "@/lib/types";
import { Eye, Download, Grid, List, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageModal from "./ImageModal";

interface SearchResultsProps {
  imageId: number | null;
  isSearching: boolean;
}

export default function SearchResults({ imageId, isSearching }: SearchResultsProps) {
  const [selectedImage, setSelectedImage] = useState<SimilarImage | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("similarity");
  const [limit, setLimit] = useState(9);
  
  const { data, isLoading, error } = useQuery<SearchResult>({
    queryKey: imageId ? ['/api/images/' + imageId + '/similar', { limit }] : [],
    enabled: !!imageId && !isSearching,
  });

  const handleSelectImage = (image: SimilarImage) => {
    setSelectedImage(image);
  };
  
  const closeModal = () => {
    setSelectedImage(null);
  };
  
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };
  
  const handleSortModeChange = (value: string) => {
    setSortMode(value as SortMode);
  };
  
  const getSortedResults = () => {
    if (!data || !data.results) return [];
    
    const sortedResults = [...data.results];
    if (sortMode === "similarity") {
      return sortedResults.sort((a, b) => b.similarityScore - a.similarityScore);
    } else {
      // If sort by date, we can just return as is since they're likely sorted by upload date
      return sortedResults;
    }
  };
  
  const loadMore = () => {
    setLimit(prevLimit => prevLimit + 6);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-dark">Similar Images</h3>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Select value={sortMode} onValueChange={handleSortModeChange}>
              <SelectTrigger className="bg-gray-50 border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="similarity">Sort by similarity</SelectItem>
                <SelectItem value="date">Sort by date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <button 
            className={`bg-gray-50 p-2 rounded-md ${viewMode === 'grid' ? 'text-primary' : 'text-gray-500 hover:text-primary'} focus:outline-none`}
            onClick={() => handleViewModeChange('grid')}
          >
            <Grid size={20} />
          </button>
          <button 
            className={`bg-gray-50 p-2 rounded-md ${viewMode === 'list' ? 'text-primary' : 'text-gray-500 hover:text-primary'} focus:outline-none`}
            onClick={() => handleViewModeChange('list')}
          >
            <List size={20} />
          </button>
        </div>
      </div>
      
      {/* Searching state */}
      {isSearching && (
        <div className="py-20">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500 text-center">Analyzing image features with deep learning...</p>
            <p className="text-sm text-gray-400 mt-2">This may take a few moments</p>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && !isSearching && imageId && (
        <div className="py-20">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500 text-center">Loading similar images...</p>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="py-20">
          <div className="flex flex-col items-center">
            <div className="bg-red-100 rounded-full p-6 mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h4 className="text-lg font-medium text-dark mb-2">Error loading results</h4>
            <p className="text-gray-500 text-center">
              {error instanceof Error ? error.message : "An error occurred while loading results"}
            </p>
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {!imageId && !isSearching && !isLoading && (
        <div className="py-20">
          <div className="flex flex-col items-center">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <Eye className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-dark mb-2">No images yet</h4>
            <p className="text-gray-500 text-center">Upload an image to find visually similar results</p>
          </div>
        </div>
      )}
      
      {/* Results display */}
      {data && data.results && data.results.length > 0 && (
        <>
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}`}>
            {getSortedResults().map((image) => (
              <div 
                key={image.id}
                className={`image-card rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
                onClick={() => handleSelectImage(image)}
              >
                <div className={`${viewMode === 'list' ? 'w-1/3' : ''} bg-gray-100`}>
                  <img 
                    src={image.imageData} 
                    className={`object-cover ${viewMode === 'list' ? 'h-32 w-full' : 'w-full h-48'}`}
                    alt={`Similar to source image`} 
                  />
                </div>
                <div className={`p-3 ${viewMode === 'list' ? 'w-2/3' : ''}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-dark">{Math.round(image.similarityScore * 100)}% similar</span>
                    <span className="text-xs text-gray-500">{image.width}×{image.height}</span>
                  </div>
                  <div className="similarity-indicator mb-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full" 
                      style={{ width: `${Math.round(image.similarityScore * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button 
                        className="p-1 text-gray-500 hover:text-primary focus:outline-none" 
                        title="View details"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectImage(image);
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="p-1 text-gray-500 hover:text-primary focus:outline-none" 
                        title="Download image"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Create a fake anchor element to trigger download
                          const link = document.createElement('a');
                          link.href = image.imageData;
                          link.download = image.filename;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <Download size={16} />
                      </button>
                    </div>
                    <span className="text-xs text-gray-500">{image.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {data.results.length >= limit && (
            <div className="mt-8 text-center">
              <Button 
                variant="outline" 
                onClick={loadMore}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Load more results
              </Button>
            </div>
          )}
        </>
      )}
      
      {/* No results state */}
      {data && data.results && data.results.length === 0 && (
        <div className="py-20">
          <div className="flex flex-col items-center">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <Eye className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-dark mb-2">No similar images found</h4>
            <p className="text-gray-500 text-center">Try uploading a different image</p>
          </div>
        </div>
      )}
      
      {/* Image modal */}
      {selectedImage && (
        <ImageModal image={selectedImage} onClose={closeModal} />
      )}
    </div>
  );
}
