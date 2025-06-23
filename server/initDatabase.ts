import { db } from "./db";
import { users, carListings, bids, favorites } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function initializeDatabaseWithSampleData() {
  console.log("Initializing database with sample data...");

  // Clear existing data
  await db.delete(carListings);
  await db.delete(bids);
  await db.delete(favorites);
  await db.delete(users);

  const now = new Date();

  // Create sample users
  const [adminUser] = await db.insert(users).values({
    username: "admin",
    email: "admin@autoauction.tj",
    role: "admin",
    isActive: true,
    profilePhoto: null,
  }).returning();

  const [sellerUser] = await db.insert(users).values({
    username: "seller123",
    email: "seller@autoauction.tj", 
    role: "seller",
    isActive: true,
    profilePhoto: null,
  }).returning();

  const [buyerUser] = await db.insert(users).values({
    username: "buyer456",
    email: "buyer@autoauction.tj",
    role: "buyer", 
    isActive: true,
    profilePhoto: null,
  }).returning();

  // Fixed auction end times to prevent timer reset on server restart
  const auction1EndTime = new Date('2025-06-25T13:30:00Z');
  const auction2EndTime = new Date('2025-06-25T18:45:00Z');
  const auction3EndTime = new Date('2025-06-26T12:20:00Z');
  const auction4EndTime = new Date('2025-06-26T10:15:00Z');
  const auction5EndTime = new Date('2025-06-26T14:30:00Z');
  const auction6EndTime = new Date('2025-06-27T16:45:00Z');
  const auction7EndTime = new Date('2025-06-27T11:00:00Z');
  const auction8EndTime = new Date('2025-06-28T13:15:00Z');
  const auction9EndTime = new Date('2025-06-28T17:30:00Z');
  const auction10EndTime = new Date('2025-06-29T09:45:00Z');
  const auction11EndTime = new Date('2025-06-29T15:20:00Z');
  const auction12EndTime = new Date('2025-06-30T19:10:00Z');
  const auction13EndTime = new Date('2025-06-30T21:00:00Z');
  const auction14EndTime = new Date('2025-07-01T14:30:00Z');
  const auction15EndTime = new Date('2025-07-01T16:45:00Z');
  const auction16EndTime = new Date('2025-07-02T12:00:00Z');
  const auction17EndTime = new Date('2025-07-02T18:30:00Z');
  const auction18EndTime = new Date('2025-07-03T15:15:00Z');

  // No car listings - empty database

  // No bids or favorites - empty database

  console.log("Database initialized with sample data successfully!");
}