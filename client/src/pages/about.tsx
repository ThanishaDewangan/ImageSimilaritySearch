import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Image, Cpu, Eye, Search, Database, ArrowRight } from "lucide-react";

export default function About() {
  const [_, setLocation] = useLocation();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-dark tracking-tight sm:text-4xl">
          About VisualMind
        </h2>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Discover how our AI-powered image search engine works
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-dark mb-4">How It Works</h3>
          <div className="space-y-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="bg-primary bg-opacity-10 p-2 rounded-lg">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-dark">1. Upload</h4>
                <p className="text-gray-500 mt-1">
                  Upload any image you want to find similar matches for. We support JPEG and PNG formats up to 10MB.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="bg-primary bg-opacity-10 p-2 rounded-lg">
                  <Cpu className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-dark">2. Process</h4>
                <p className="text-gray-500 mt-1">
                  Our deep learning model extracts feature vectors from your image, creating a unique numerical "fingerprint".
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="bg-primary bg-opacity-10 p-2 rounded-lg">
                  <Search className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-dark">3. Compare</h4>
                <p className="text-gray-500 mt-1">
                  We use cosine similarity to find images with similar visual characteristics in our database.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="bg-primary bg-opacity-10 p-2 rounded-lg">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-dark">4. Discover</h4>
                <p className="text-gray-500 mt-1">
                  View results ranked by similarity, with detailed information about each matching image.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-dark mb-4">Technology</h3>
          <p className="text-gray-600 mb-6">
            VisualMind leverages state-of-the-art deep learning models to power its image search capabilities. Here's the technology stack behind our platform:
          </p>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-medium text-dark">Deep Learning Model</h4>
              <p className="text-gray-500 mt-1">
                We use MobileNet, a lightweight convolutional neural network designed for efficient feature extraction from images.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-dark">Feature Extraction</h4>
              <p className="text-gray-500 mt-1">
                The model converts images into 1024-dimensional feature vectors that capture visual information like shapes, textures, and colors.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-dark">Similarity Calculation</h4>
              <p className="text-gray-500 mt-1">
                Cosine similarity measures how similar two images are by comparing the angle between their feature vectors in multidimensional space.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-dark">Image Processing</h4>
              <p className="text-gray-500 mt-1">
                Each uploaded image is processed to ensure optimal quality for feature extraction while preserving visual information.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-primary bg-opacity-5 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold text-dark mb-4">Ready to Try It Yourself?</h3>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Upload an image and discover visually similar matches using our AI-powered search engine.
        </p>
        <Button 
          onClick={() => setLocation('/')}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-white px-6"
        >
          Start Searching <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </main>
  );
}

// Import Lucide icon for the "Upload" step
function Upload(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
