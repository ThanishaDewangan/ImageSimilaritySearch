import { useQuery } from "@tanstack/react-query";
import { SearchHistoryItem } from "@/lib/types";
import { useLocation } from "wouter";
import { formatDistance } from "date-fns";
import { Calendar, Image, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function History() {
  const [_, setLocation] = useLocation();
  
  const { data: history, isLoading, error } = useQuery<SearchHistoryItem[]>({
    queryKey: ['/api/history'],
  });

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (e) {
      return "some time ago";
    }
  };

  const handleSearch = (imageId: number) => {
    setLocation('/');
    // We need to use a small delay to ensure the component is mounted before we update state
    setTimeout(() => {
      const event = new CustomEvent('history-select-image', { detail: { imageId } });
      window.dispatchEvent(event);
    }, 100);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-dark tracking-tight sm:text-4xl">
          Search History
        </h2>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          View your recent image search activities
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <div className="bg-red-100 rounded-full p-6 inline-flex mb-4">
              <Calendar className="h-8 w-8 text-red-500" />
            </div>
            <h4 className="text-lg font-medium text-dark mb-2">Error loading history</h4>
            <p className="text-gray-500">
              {error instanceof Error ? error.message : "Failed to load history"}
            </p>
          </div>
        ) : history && history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((item) => (
              <div 
                key={item.id}
                className="border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                  <img 
                    src={item.sourceImage.imageData} 
                    className="w-full h-48 object-cover" 
                    alt={`Search history - ${item.sourceImage.filename}`} 
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-dark truncate mb-1">
                    {item.sourceImage.filename}
                  </h3>
                  <div className="flex justify-between text-sm text-gray-500 mb-3">
                    <span>{item.resultCount} similar results</span>
                    <span>{formatTimeAgo(item.searchedAt)}</span>
                  </div>
                  <Button 
                    onClick={() => handleSearch(item.sourceImageId)}
                    className="w-full text-sm flex items-center justify-center"
                  >
                    Search Again <ArrowRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="bg-gray-100 rounded-full p-6 inline-flex mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-dark mb-2">No search history</h4>
            <p className="text-gray-500 mb-6">You haven't performed any image searches yet</p>
            <Button onClick={() => setLocation('/')} className="inline-flex items-center">
              <Image size={16} className="mr-2" /> Start Searching
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
