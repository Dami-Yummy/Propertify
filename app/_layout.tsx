import { Slot } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";

import { DATABASE_NAME, initializeDatabase } from "../database/database";
import "../global.css";

export default function RootLayout() {
  return (
    <SQLiteProvider
      databaseName={DATABASE_NAME}
      onInit={initializeDatabase}
    >
      <Slot />
    </SQLiteProvider>
  );
}
