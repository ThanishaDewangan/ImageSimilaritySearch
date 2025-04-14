import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User entity (kept from original)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Image entity to store uploaded images and their feature vectors
export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  size: integer("size").notNull(),
  source: text("source").default("user-upload"),
  featureVector: jsonb("feature_vector").notNull(),
  imageData: text("image_data").notNull(), // base64 encoded image
  uploadedAt: timestamp("uploaded_at").defaultNow()
});

export const insertImageSchema = createInsertSchema(images).omit({
  id: true,
  uploadedAt: true,
});

export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;

// Search history to track user searches
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  sourceImageId: integer("source_image_id").notNull().references(() => images.id),
  resultCount: integer("result_count").notNull(),
  searchedAt: timestamp("searched_at").defaultNow()
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true,
  searchedAt: true,
});

export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;

// Define relations
export const searchHistoryRelations = relations(searchHistory, ({ one }) => ({
  sourceImage: one(images, {
    fields: [searchHistory.sourceImageId],
    references: [images.id],
  }),
}));

// Similar image result object (not a table, just for API responses)
export const similarImageSchema = z.object({
  id: z.number(),
  filename: z.string(),
  mimeType: z.string(),
  width: z.number(),
  height: z.number(),
  size: z.number(),
  source: z.string(),
  similarityScore: z.number(),
  imageData: z.string()
});

export type SimilarImage = z.infer<typeof similarImageSchema>;

// Search results response schema
export const searchResultsSchema = z.object({
  sourceImage: z.number(),
  results: z.array(similarImageSchema)
});

export type SearchResults = z.infer<typeof searchResultsSchema>;

// Upload response schema
export const uploadResponseSchema = z.object({
  success: z.boolean(),
  imageId: z.number().optional(),
  error: z.string().optional()
});

export type UploadResponse = z.infer<typeof uploadResponseSchema>;
