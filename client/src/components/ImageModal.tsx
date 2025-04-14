import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SimilarImage } from "@/lib/types";
import { X, Download } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface ImageModalProps {
  image: SimilarImage;
  onClose: () => void;
}

export default function ImageModal({ image, onClose }: ImageModalProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.imageData;
    link.download = image.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSearchWithThis = () => {
    // This would trigger a new search using this image
    // For simplicity, we'll just close the modal for now
    onClose();
  };

  return (
    <Dialog open={!!image} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-medium text-dark">Image Details</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/3 p-4 flex items-center justify-center bg-gray-50">
            <img 
              src={image.imageData} 
              className="max-h-[60vh] max-w-full object-contain" 
              alt="Image detail view" 
            />
          </div>
          
          <div className="md:w-1/3 p-4 overflow-y-auto">
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Similarity Score</h4>
              <div className="flex items-center">
                <span className="text-xl font-semibold text-primary mr-2">
                  {Math.round(image.similarityScore * 100)}%
                </span>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${Math.round(image.similarityScore * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Image Properties</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Dimensions</span>
                  <span className="text-sm font-medium">{image.width} × {image.height} px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">File size</span>
                  <span className="text-sm font-medium">{formatBytes(image.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Format</span>
                  <span className="text-sm font-medium">
                    {image.mimeType.split('/')[1].toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Source</h4>
              <p className="text-sm text-gray-600">{image.source}</p>
              {image.source !== 'user-upload' && (
                <a href="#" className="text-sm text-primary hover:underline">View original</a>
              )}
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Feature Visualization</h4>
              <div className="bg-gray-100 p-2 rounded-md">
                <div className="grid grid-cols-4 gap-1">
                  {/* Visual representation of features (simplified) */}
                  {Array.from({ length: 8 }).map((_, i) => {
                    // Generate a random opacity between 0.2 and 0.8 for visualization
                    const opacity = (Math.random() * 0.6 + 0.2).toFixed(2);
                    return (
                      <div 
                        key={i} 
                        className="w-full aspect-square bg-primary rounded-sm" 
                        style={{ opacity }}
                      ></div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">Visual feature representation</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="default" 
                onClick={handleDownload} 
                className="flex-1 py-2 bg-primary text-white rounded-md hover:bg-primary/90 text-sm"
              >
                <Download size={16} className="mr-1" /> Download
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSearchWithThis} 
                className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
              >
                Search with this
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
