import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

// Image schema
export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalUrl: text("original_url"),
  width: integer("width"),
  height: integer("height"),
  filesize: integer("filesize"),
  format: text("format"),
  featureVector: jsonb("feature_vector").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertImageSchema = createInsertSchema(images).omit({
  id: true,
  uploadedAt: true,
});

export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;

// Search history schema
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  queryImageId: integer("query_image_id"),
  queryUrl: text("query_url"),
  resultsCount: integer("results_count"),
  searchedAt: timestamp("searched_at").defaultNow().notNull(),
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({
  id: true,
  searchedAt: true,
});

export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;

// Image search result type (not stored in DB)
export const imageSearchResultSchema = z.object({
  image: z.object({
    id: z.number(),
    filename: z.string(),
    originalUrl: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    filesize: z.number().optional(),
    format: z.string().optional(),
  }),
  similarity: z.number(),
});

export type ImageSearchResult = z.infer<typeof imageSearchResultSchema>;

// Image with base64 data for preview
export const imageWithDataSchema = z.object({
  id: z.number().optional(),
  filename: z.string(),
  data: z.string(), // base64 encoded image data
  width: z.number().optional(),
  height: z.number().optional(),
  filesize: z.number().optional(),
  format: z.string().optional(),
});

export type ImageWithData = z.infer<typeof imageWithDataSchema>;
