
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { deleteProperty } from "../../../../database/propertyQueries";

import {
  getPropertyById,
  type Property,
} from "../../../../database/propertyQueries";

export default function PropertyDetailsScreen() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const handleDelete = () => {
  if (!property) return;

  Alert.alert(
    "Delete Property",
    "Are you sure you want to delete this property? This action cannot be undone.",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProperty(db, property.id);

            Alert.alert(
              "Success",
              "Property deleted successfully!"
            );

            router.back();
          } catch (error) {
            console.error("Delete failed:", error);
            Alert.alert(
              "Error",
              "Could not delete the property."
            );
          }
        },
      },
    ]
  );
};

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadProperty() {
        setLoading(true);
        setError(false);

        try {
          const propertyId = Number(id);

          if (!Number.isSafeInteger(propertyId) || propertyId <= 0) {
            throw new Error("Invalid property ID");
          }

          const data = await getPropertyById(db, propertyId);

          if (active) setProperty(data);
        } catch (err) {
          console.error("Failed to load property:", err);
          if (active) setError(true);
        } finally {
          if (active) setLoading(false);
        }
      }

      loadProperty();

      return () => {
        active = false;
      };
    }, [db, id])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3985D6" />
      </View>
    );
  }

  if (error || !property) {
    return (
      <View style={styles.center}>
        <Text>
          {error
            ? "Unable to load property."
            : "Property not found."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {property.image_uri ? (
        <Image
          source={{ uri: property.image_uri }}
          style={styles.image}
        />
      ) : (
        <View style={styles.placeholder}>
          <Text>No Image Available</Text>
        </View>
      )}



      <View style={styles.content}>
        <Text style={styles.title}>{property.title}</Text>

        <Text style={styles.price}>
          Rs. {property.price.toLocaleString("en-LK")}
        </Text>

        <Text style={styles.location}>
          📍 {property.location || "Location not specified"}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.heading}>Description</Text>

        <Text style={styles.description}>
          {property.description || "No description available."}
        </Text>
   
      </View>

        <TouchableOpacity
        style={styles.editButton}
        onPress={() =>
            router.push({
            pathname: "/(root)/edit-property/[id]",
            params: { id: String(property.id) },
            })
        }
        >
        <Text style={styles.editButtonText}>
            Edit Property
        </Text>
        </TouchableOpacity>

        <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
        >
        <Text style={styles.deleteButtonText}>
            Delete Property
        </Text>
        </TouchableOpacity>

      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  image: {
    width: "100%",
    height: 260,
    resizeMode: "cover",
  },
  placeholder: {
    height: 260,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 10,
  },
  price: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#3985D6",
    marginBottom: 12,
  },
  location: {
    fontSize: 16,
    color: "#666666",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 22,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#555555",
    lineHeight: 25,
  },
  deleteButton: {
    backgroundColor: "#FF4D4D",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    margin: 20,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#3985D6",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    margin: 20,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
