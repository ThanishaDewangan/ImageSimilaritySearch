import { images, type Image, type InsertImage, searchHistory, type SearchHistory, type InsertSearchHistory, type SimilarImage, users, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, ne, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User methods from original
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  
  // Image methods
  getImage(id: number): Promise<Image | undefined>;
  getAllImages(): Promise<Image[]>;
  saveImage(image: InsertImage): Promise<Image>;
  
  // Search history methods
  getSearchHistory(): Promise<(SearchHistory & { sourceImage: Image })[]>;
  addSearchHistory(history: InsertSearchHistory): Promise<SearchHistory>;
  clearSearchHistory(): Promise<void>;
  
  // Find similar images based on feature vector
  findSimilarImages(sourceImageId: number, limit?: number): Promise<SimilarImage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, any>;
  private imagesMap: Map<number, Image>;
  private searchHistoryMap: Map<number, SearchHistory>;
  
  private userCurrentId: number;
  private imageCurrentId: number;
  private searchHistoryCurrentId: number;

  constructor() {
    this.users = new Map();
    this.imagesMap = new Map();
    this.searchHistoryMap = new Map();
    
    this.userCurrentId = 1;
    this.imageCurrentId = 1;
    this.searchHistoryCurrentId = 1;
  }

  // User methods from original
  async getUser(id: number): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = this.userCurrentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Image methods
  async getImage(id: number): Promise<Image | undefined> {
    return this.imagesMap.get(id);
  }
  
  async getAllImages(): Promise<Image[]> {
    return Array.from(this.imagesMap.values());
  }
  
  async saveImage(insertImage: InsertImage): Promise<Image> {
    const id = this.imageCurrentId++;
    const uploadedAt = new Date();
    // Ensure source has a default value if undefined
    const source = insertImage.source || 'user-upload';
    const image: Image = { ...insertImage, id, uploadedAt, source };
    this.imagesMap.set(id, image);
    return image;
  }

  // Search history methods
  async getSearchHistory(): Promise<(SearchHistory & { sourceImage: Image })[]> {
    return Array.from(this.searchHistoryMap.values())
      .sort((a, b) => {
        // Handle potential null values
        const dateA = a.searchedAt?.getTime() || 0;
        const dateB = b.searchedAt?.getTime() || 0;
        return dateB - dateA;
      })
      .map(history => {
        const sourceImage = this.imagesMap.get(history.sourceImageId);
        if (!sourceImage) {
          throw new Error(`Source image with id ${history.sourceImageId} not found`);
        }
        return { ...history, sourceImage };
      });
  }
  
  async addSearchHistory(insertHistory: InsertSearchHistory): Promise<SearchHistory> {
    const id = this.searchHistoryCurrentId++;
    const searchedAt = new Date();
    const history: SearchHistory = { ...insertHistory, id, searchedAt };
    this.searchHistoryMap.set(id, history);
    return history;
  }
  
  async clearSearchHistory(): Promise<void> {
    this.searchHistoryMap.clear();
  }
  
  // Find similar images based on feature vector cosine similarity
  async findSimilarImages(sourceImageId: number, limit: number = 10): Promise<SimilarImage[]> {
    const sourceImage = await this.getImage(sourceImageId);
    if (!sourceImage) {
      throw new Error(`Source image with id ${sourceImageId} not found`);
    }
    
    const sourceFeatureVector = sourceImage.featureVector as number[];
    
    // Calculate cosine similarity between source image and all other images
    const similarities: { image: Image; score: number }[] = [];
    
    for (const image of this.imagesMap.values()) {
      // Skip the source image itself
      if (image.id === sourceImageId) continue;
      
      const targetFeatureVector = image.featureVector as number[];
      const similarity = this.calculateCosineSimilarity(sourceFeatureVector, targetFeatureVector);
      
      similarities.push({ image, score: similarity });
    }
    
    // Sort by similarity score in descending order and take the top 'limit' results
    const sortedResults = similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    // Format results
    return sortedResults.map(({ image, score }) => ({
      id: image.id,
      filename: image.filename,
      mimeType: image.mimeType,
      width: image.width,
      height: image.height,
      size: image.size,
      source: image.source || 'unknown', // Ensure source is always a string
      similarityScore: Math.round(score * 100) / 100, // Round to 2 decimal places
      imageData: image.imageData
    }));
  }
  
  // Helper method to calculate cosine similarity between two vectors
  private calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same length');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }
    
    if (normA === 0 || normB === 0) {
      return 0; // To avoid division by zero
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export class DatabaseStorage implements IStorage {
  // Helper method to calculate cosine similarity between two vectors
  private calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same length');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }
    
    if (normA === 0 || normB === 0) {
      return 0; // To avoid division by zero
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Image methods
  async getImage(id: number): Promise<Image | undefined> {
    const [image] = await db.select().from(images).where(eq(images.id, id));
    return image || undefined;
  }
  
  async getAllImages(): Promise<Image[]> {
    return await db.select().from(images);
  }
  
  async saveImage(insertImage: InsertImage): Promise<Image> {
    // Ensure source has a default value if needed
    const imageData = {
      ...insertImage,
      source: insertImage.source || 'user-upload'
    };
    
    const [image] = await db
      .insert(images)
      .values(imageData)
      .returning();
    
    return image;
  }

  // Search history methods
  async getSearchHistory(): Promise<(SearchHistory & { sourceImage: Image })[]> {
    const results = await db
      .select({
        history: searchHistory,
        sourceImage: images
      })
      .from(searchHistory)
      .innerJoin(images, eq(searchHistory.sourceImageId, images.id))
      .orderBy(desc(searchHistory.searchedAt));
    
    return results.map(({ history, sourceImage }) => ({
      ...history,
      sourceImage
    }));
  }
  
  async addSearchHistory(insertHistory: InsertSearchHistory): Promise<SearchHistory> {
    const [history] = await db
      .insert(searchHistory)
      .values(insertHistory)
      .returning();
    
    return history;
  }
  
  async clearSearchHistory(): Promise<void> {
    await db.delete(searchHistory);
  }
  
  // Find similar images based on feature vector cosine similarity
  async findSimilarImages(sourceImageId: number, limit: number = 10): Promise<SimilarImage[]> {
    const sourceImage = await this.getImage(sourceImageId);
    if (!sourceImage) {
      throw new Error(`Source image with id ${sourceImageId} not found`);
    }
    
    // Get all images except the source image
    const allImages = await db
      .select()
      .from(images)
      .where(ne(images.id, sourceImageId));
    
    const sourceFeatureVector = sourceImage.featureVector as number[];
    
    // Calculate similarities
    const similarities = allImages.map(image => {
      const targetFeatureVector = image.featureVector as number[];
      const similarity = this.calculateCosineSimilarity(sourceFeatureVector, targetFeatureVector);
      return { image, score: similarity };
    });
    
    // Sort by similarity score in descending order and take the top 'limit' results
    const sortedResults = similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    // Format results
    return sortedResults.map(({ image, score }) => ({
      id: image.id,
      filename: image.filename,
      mimeType: image.mimeType,
      width: image.width,
      height: image.height,
      size: image.size,
      source: image.source || 'unknown', // Ensure source is always a string
      similarityScore: Math.round(score * 100) / 100, // Round to 2 decimal places
      imageData: image.imageData
    }));
  }
}

// Use the DatabaseStorage for production
export const storage = new DatabaseStorage();
