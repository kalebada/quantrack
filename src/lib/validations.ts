import { z } from "zod";

export const memberSignupSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  school: z.string().trim().min(1, "School/Organization is required").max(255),
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters"),
  teamCode: z.string().optional(),
  terms: z.boolean().refine(val => val === true, "You must agree to the terms")
});

export const teamAdminSignupSchema = z.object({
  orgName: z.string().trim().min(1, "Team name is required").max(255),
  established: z.string().min(1, "Date founded is required"),
  regNo: z.string().trim().max(100).optional(),
  orgType: z.string().trim().min(1, "Team type is required").max(100),
  website: z.string().trim().url("Invalid URL").max(255).optional().or(z.literal("")),
  mission: z.string().trim().max(500).optional(),
  adminFirstName: z.string().trim().min(1, "Admin first name is required").max(100),
  adminLastName: z.string().trim().min(1, "Admin last name is required").max(100),
  adminEmail: z.string().trim().email("Invalid email address").max(255),
  adminPhone: z.string().trim().min(1, "Phone number is required").max(20),
  adminTitle: z.string().trim().min(1, "Job title is required").max(100),
  password: z.string().min(8, "Password must be at least 8 characters"),
  address: z.string().trim().min(1, "Address is required").max(255),
  city: z.string().trim().min(1, "City is required").max(100),
  country: z.string().trim().min(1, "Country is required").max(100),
  terms: z.boolean().refine(val => val === true, "You must agree to the terms"),
  accuracy: z.boolean().refine(val => val === true, "You must confirm accuracy")
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});
