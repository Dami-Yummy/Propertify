import * as SQLite from "expo-sqlite";

export interface Property {
  id: number;
  title: string;
  description: string | null;
  price: number;
  location: string | null;
  property_type: string | null;
  image_uri: string | null;
  created_at: string;
}

export type PropertyInput = {
  title: string;
  description?: string | null;
  price: number;
  location?: string | null;
  property_type?: string | null;
  image_uri?: string | null;
};

// CREATE - Add a new property
export async function createProperty(
  db: SQLite.SQLiteDatabase,
  property: PropertyInput
) {
  return await db.runAsync(
    `INSERT INTO properties
      (title, description, price, location,
       property_type, image_uri)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      property.title,
      property.description ?? null,
      property.price,
      property.location ?? null,
      property.property_type ?? null,
      property.image_uri ?? null,
    ]
  );
}

// READ - Get all properties
export async function getProperties(
  db: SQLite.SQLiteDatabase
): Promise<Property[]> {
  return await db.getAllAsync<Property>(
    "SELECT * FROM properties ORDER BY id DESC"
  );
}

// READ - Get a property by ID
export async function getPropertyById(
  db: SQLite.SQLiteDatabase,
  id: number
): Promise<Property | null> {
  return await db.getFirstAsync<Property>(
    "SELECT * FROM properties WHERE id = ?",
    [id]
  );
}

// UPDATE - Edit an existing property
export async function updateProperty(
  db: SQLite.SQLiteDatabase,
  id: number,
  property: PropertyInput
) {
  return await db.runAsync(
    `UPDATE properties
     SET title = ?, description = ?, price = ?,
         location = ?, property_type = ?, image_uri = ?
     WHERE id = ?`,
    [
      property.title,
      property.description ?? null,
      property.price,
      property.location ?? null,
      property.property_type ?? null,
      property.image_uri ?? null,
      id,
    ]
  );
}

// DELETE - Remove a property
export async function deleteProperty(
  db: SQLite.SQLiteDatabase,
  id: number
) {
  return await db.runAsync(
    "DELETE FROM properties WHERE id = ?",
    [id]
  );
}