import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Upload, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UploadResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ImageUploadProps {
  onImageUploaded: (imageId: number) => void;
}

export default function ImageUpload({ onImageUploaded }: ImageUploadProps) {
  const [uploadedImage, setUploadedImage] = useState<{
    preview: string;
    file: File;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);

      // Create artificial progress updates for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 5;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 100);

      try {
        const response = await apiRequest("POST", "/api/images/upload", undefined, formData);
        clearInterval(progressInterval);
        setUploadProgress(100);
        return await response.json() as UploadResponse;
      } catch (error) {
        clearInterval(progressInterval);
        setUploadProgress(0);
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data.success && data.imageId) {
        onImageUploaded(data.imageId);
        setTimeout(() => {
          setUploadProgress(0);
          setUploadedImage(null);
        }, 1000);
      } else {
        toast({
          title: "Upload Failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive",
        });
        setUploadProgress(0);
      }
    },
    onError: (error) => {
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      
      const file = acceptedFiles[0];
      
      // Check file type
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Only JPEG and PNG images are supported",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Image must be smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      const preview = URL.createObjectURL(file);
      setUploadedImage({ preview, file });
    },
    [toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
  });

  const removeImage = () => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage.preview);
      setUploadedImage(null);
    }
  };

  const findSimilarImages = () => {
    if (uploadedImage) {
      uploadMutation.mutate(uploadedImage.file);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-medium text-dark mb-4">Upload an Image</h3>
      
      {uploadedImage && uploadProgress === 0 ? (
        <div>
          <div className="relative w-full h-56 mb-4 rounded-lg overflow-hidden bg-gray-100">
            <img 
              className="w-full h-full object-contain" 
              src={uploadedImage.preview} 
              alt="Uploaded preview" 
            />
            <button 
              className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 rounded-full p-1 text-white"
              onClick={removeImage}
            >
              <X size={16} />
            </button>
          </div>
          <Button 
            className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90"
            onClick={findSimilarImages}
            disabled={uploadMutation.isPending}
          >
            Find Similar Images
          </Button>
        </div>
      ) : uploadMutation.isPending || uploadProgress > 0 ? (
        <div>
          <Progress value={uploadProgress} className="w-full h-2.5 mb-4" />
          <p className="text-sm text-gray-500 text-center">Processing image...</p>
        </div>
      ) : (
        <div 
          {...getRootProps()} 
          className={`drop-zone rounded-lg p-8 mb-4 flex flex-col items-center justify-center cursor-pointer ${
            isDragActive ? "active" : ""
          }`}
        >
          <Upload className="text-primary mb-2" size={32} />
          <p className="text-gray-500 text-center mb-2">
            Drag & drop an image here or click to browse
          </p>
          <p className="text-xs text-gray-400 text-center">
            Supports JPEG and PNG (Max 10MB)
          </p>
          <input {...getInputProps()} />
        </div>
      )}
      
      {uploadMutation.isError && (
        <div className="mt-4 p-2 bg-red-50 text-red-600 rounded-md flex items-center text-sm">
          <AlertCircle size={16} className="mr-2" />
          {uploadMutation.error instanceof Error 
            ? uploadMutation.error.message 
            : "Error uploading image"}
        </div>
      )}
    </div>
  );
}
