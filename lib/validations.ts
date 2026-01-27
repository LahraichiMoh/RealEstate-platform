import { z } from "zod";

// Client validation
export const clientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  city: z.string().optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;

// Client user creation (by super admin)
export const createClientUserSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(["OWNER", "AGENT"]).default("OWNER"),
  clientId: z.string().min(1, "Client is required"),
});

export type CreateClientUserInput = z.infer<typeof createClientUserSchema>;

// Project validation
export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Invalid slug format"),
  description: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  coverImage: z.string().optional(),
  floorsCount: z.number().int().min(1, "Must have at least 1 floor"),
});

export type ProjectInput = z.infer<typeof projectSchema>;

// Floor validation
export const floorSchema = z.object({
  floorNumber: z.number().int().min(0),
  label: z.string().optional(),
});

export type FloorInput = z.infer<typeof floorSchema>;

// Apartment validation
export const apartmentSchema = z.object({
  number: z.string().min(1, "Apartment number is required"),
  rooms: z.number().int().min(1),
  area: z.number().min(0),
  price: z.number().min(0),
  status: z.enum(["AVAILABLE", "RESERVED", "SOLD"]).default("AVAILABLE"),
  coordinates: z.any().optional(), // JSON polygon points
});

export type ApartmentInput = z.infer<typeof apartmentSchema>;

// Reservation request validation
export const reservationRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email"),
  message: z.string().optional(),
  apartmentId: z.string().optional(),
  projectId: z.string().min(1),
});

export type ReservationRequestInput = z.infer<typeof reservationRequestSchema>;

// Login validation
export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Filter validation for apartments
export const apartmentFilterSchema = z.object({
  status: z.string().optional(),
  minRooms: z.number().optional(),
  maxRooms: z.number().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minArea: z.number().optional(),
  maxArea: z.number().optional(),
});

export type ApartmentFilter = z.infer<typeof apartmentFilterSchema>;

// Domain validation
export const domainSchema = z.object({
  domain: z.string()
    .min(1, "Domain is required")
    .regex(/^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/, "Invalid domain format"),
  isPrimary: z.boolean().default(false),
});

export type DomainInput = z.infer<typeof domainSchema>;
