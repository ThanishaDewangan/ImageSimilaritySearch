import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { initializeModel, processImage, base64ToBuffer, bufferToBase64 } from "./imageProcessor";
import { 
  insertImageSchema, 
  insertSearchHistorySchema,
  type InsertImage,
  type InsertSearchHistory
} from "@shared/schema";
import { ZodError } from "zod";
import multer from "multer";

const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  storage: multer.memoryStorage()
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize model when server starts
  try {
    console.log("Initializing TensorFlow.js model...");
    await initializeModel();
    console.log("TensorFlow.js model initialized successfully");
  } catch (error) {
    console.error("Failed to initialize TensorFlow.js model:", error);
  }

  // API endpoints
  // Upload an image
  app.post('/api/images/upload', upload.single('image'), async (req: Request, res: Response) => {
    try {
      console.log('Upload request received:', { 
        hasFile: !!req.file,
        contentType: req.headers['content-type'],
        bodyKeys: Object.keys(req.body || {})
      });
      
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No image uploaded' });
      }

      const { mimetype, buffer, size } = req.file;
      console.log('Processing image:', { mimetype, size });
      
      // Validate MIME type
      if (!['image/jpeg', 'image/png'].includes(mimetype)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid file type. Only JPEG and PNG images are supported' 
        });
      }
      
      // Process image and extract features
      const { width, height, featureVector, processedImageBuffer } = await processImage(buffer);
      
      // Create image data object
      const imageData: InsertImage = {
        filename: req.file.originalname || 'uploaded-image',
        mimeType: mimetype,
        width,
        height,
        size,
        featureVector,
        imageData: bufferToBase64(processedImageBuffer, mimetype),
        source: 'user-upload'
      };
      
      // Validate image data
      const validatedData = insertImageSchema.parse(imageData);
      
      // Save image to storage
      const savedImage = await storage.saveImage(validatedData);
      
      res.status(201).json({ 
        success: true, 
        imageId: savedImage.id
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid image data: ' + error.message 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        error: 'Failed to process image: ' + (error instanceof Error ? error.message : 'Unknown error') 
      });
    }
  });

  // Get an image by ID
  app.get('/api/images/:id', async (req: Request, res: Response) => {
    try {
      const imageId = parseInt(req.params.id);
      
      if (isNaN(imageId)) {
        return res.status(400).json({ error: 'Invalid image ID' });
      }
      
      const image = await storage.getImage(imageId);
      
      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }
      
      res.json(image);
    } catch (error) {
      console.error('Error getting image:', error);
      res.status(500).json({ error: 'Failed to retrieve image' });
    }
  });

  // Find similar images
  app.get('/api/images/:id/similar', async (req: Request, res: Response) => {
    try {
      const imageId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      if (isNaN(imageId)) {
        return res.status(400).json({ error: 'Invalid image ID' });
      }
      
      // Check if image exists
      const sourceImage = await storage.getImage(imageId);
      if (!sourceImage) {
        return res.status(404).json({ error: 'Source image not found' });
      }
      
      // Find similar images
      const similarImages = await storage.findSimilarImages(imageId, limit);
      
      // Add search to history
      const historyData: InsertSearchHistory = {
        sourceImageId: imageId,
        resultCount: similarImages.length
      };
      
      const validatedHistoryData = insertSearchHistorySchema.parse(historyData);
      await storage.addSearchHistory(validatedHistoryData);
      
      res.json({
        sourceImage: imageId,
        results: similarImages
      });
    } catch (error) {
      console.error('Error finding similar images:', error);
      res.status(500).json({ error: 'Failed to find similar images: ' + (error instanceof Error ? error.message : 'Unknown error') });
    }
  });

  // Get search history
  app.get('/api/history', async (_req: Request, res: Response) => {
    try {
      const history = await storage.getSearchHistory();
      res.json(history);
    } catch (error) {
      console.error('Error getting search history:', error);
      res.status(500).json({ error: 'Failed to retrieve search history' });
    }
  });

  // Clear search history
  app.delete('/api/history', async (_req: Request, res: Response) => {
    try {
      await storage.clearSearchHistory();
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error clearing search history:', error);
      res.status(500).json({ error: 'Failed to clear search history' });
    }
  });

  // Add some pre-loaded images for demo purposes
  // Note: In a production environment, we would populate with real data
  app.post('/api/seed-data', async (_req: Request, res: Response) => {
    try {
      res.status(200).json({ success: true, message: "Data seeding is only available in development mode" });
    } catch (error) {
      console.error('Error seeding data:', error);
      res.status(500).json({ error: 'Failed to seed data' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
