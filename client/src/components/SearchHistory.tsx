import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SearchHistoryItem } from "@/lib/types";
import { Calendar, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";

interface SearchHistoryProps {
  onHistoryItemSelected: (imageId: number) => void;
}

export default function SearchHistory({ onHistoryItemSelected }: SearchHistoryProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: history, isLoading, error } = useQuery<SearchHistoryItem[]>({
    queryKey: ['/api/history'],
  });
  
  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/history");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/history'] });
      toast({
        title: "History cleared",
        description: "Your search history has been cleared",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clear history",
        variant: "destructive",
      });
    },
  });
  
  const handleClearHistory = () => {
    clearHistoryMutation.mutate();
  };

  const handleHistoryItemClick = (imageId: number) => {
    onHistoryItemSelected(imageId);
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (e) {
      return "some time ago";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-dark">Search History</h3>
        <button 
          className="text-sm text-gray-500 hover:text-primary"
          onClick={handleClearHistory}
          disabled={clearHistoryMutation.isPending}
        >
          {clearHistoryMutation.isPending ? "Clearing..." : "Clear"}
        </button>
      </div>
      
      <div className="history-scrollbar overflow-y-auto max-h-96">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            {error instanceof Error ? error.message : "Failed to load history"}
          </div>
        ) : history && history.length > 0 ? (
          history.map((item) => (
            <div 
              key={item.id}
              className="flex items-center mb-4 p-2 rounded-lg hover:bg-gray-50 cursor-pointer" 
              onClick={() => handleHistoryItemClick(item.sourceImageId)}
            >
              <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                <img 
                  src={item.sourceImage.imageData} 
                  className="w-full h-full object-cover" 
                  alt="Search history thumbnail" 
                />
              </div>
              <div className="ml-3 flex-grow">
                <p className="text-sm font-medium text-dark truncate">
                  {item.sourceImage.filename}
                </p>
                <p className="text-xs text-gray-500">
                  {item.resultCount} similar {item.resultCount === 1 ? 'result' : 'results'}
                </p>
                <p className="text-xs text-gray-400">
                  {formatTimeAgo(item.searchedAt)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Calendar className="mx-auto text-gray-300 mb-2" size={24} />
            <p className="text-sm text-gray-500">No search history yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
