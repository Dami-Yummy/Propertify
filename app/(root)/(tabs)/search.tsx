
import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import {
    getProperties,
    type Property,
} from "../../../database/propertyQueries";

export default function SearchScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  const [searchText, setSearchText] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Load properties when the Search tab is opened
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadProperties = async () => {
        try {
          setLoading(true);
          setError(false);

          const data = await getProperties(db);

          if (active) {
            setProperties(data);
          }
        } catch (error) {
          console.error("Search loading failed:", error);
          if (active) setError(true);
        } finally {
          if (active) setLoading(false);
        }
      };

      loadProperties();

      return () => {
        active = false;
      };
    }, [db])
  );

  // Filter property records using search text
  const filteredProperties = useMemo(() => {
    const query = searchText.trim().toLocaleLowerCase();

    if (!query) return properties;

    return properties.filter((property) => {
      const title = property.title.toLocaleLowerCase();
      const location =
        (property.location ?? "").toLocaleLowerCase();
      const description =
        (property.description ?? "").toLocaleLowerCase();

      return (
        title.includes(query) ||
        location.includes(query) ||
        description.includes(query)
      );
    });
  }, [properties, searchText]);

  // Navigate to the property details page
  const openProperty = (id: number) => {
    router.push({
      pathname: "/(root)/(tabs)/property/[id]",
      params: { id: String(id) },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Search Properties</Text>

      {/* Search input */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={22}
          color="#777"
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Search title, location..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
          autoCorrect={false}
        />

        {searchText.length > 0 && (
          <Pressable onPress={() => setSearchText("")}>
            <Ionicons
              name="close-circle"
              size={22}
              color="#999"
            />
          </Pressable>
        )}
      </View>

      {/* Results count */}
      <Text style={styles.resultCount}>
        {filteredProperties.length} Properties Found
      </Text>

      {/* Loading or search results */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#3985D6"
          style={{ marginTop: 30 }}
        />
      ) : error ? (
        <Text style={styles.emptyText}>
          Could not load properties.
        </Text>
      ) : (
        <FlatList
          data={filteredProperties}
          keyExtractor={(item) => item.id.toString()}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="search-outline"
                size={50}
                color="#BBBBBB"
              />

              <Text style={styles.emptyText}>
                {searchText.trim()
                  ? "No matching properties found."
                  : "No properties available yet."}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => openProperty(item.id)}
            >
              {item.image_uri ? (
                <Image
                  source={{ uri: item.image_uri }}
                  style={styles.propertyImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons
                    name="home-outline"
                    size={35}
                    color="#999"
                  />
                </View>
              )}

              <View style={styles.propertyDetails}>
                <Text
                  style={styles.propertyTitle}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>

                <Text style={styles.price}>
                  Rs. {item.price.toLocaleString("en-LK")}
                </Text>

                <View style={styles.locationRow}>
                  <Ionicons
                    name="location-outline"
                    size={15}
                    color="#777"
                  />

                  <Text
                    style={styles.location}
                    numberOfLines={1}
                  >
                    {item.location || "Not specified"}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 16,
  },
  heading: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#222",
    marginTop: 30
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 14,
    height: 55,
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: "#222",
  },
  resultCount: {
    fontSize: 14,
    color: "#777",
    marginBottom: 15,
  },
  list: {
    paddingBottom: 30,
    flexGrow: 1,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginBottom: 14,
    overflow: "hidden",
    elevation: 2,
    minHeight: 120,
  },
  propertyImage: {
    width: 120,
    height: 125,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: 120,
    height: 125,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
  },
  propertyDetails: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#222",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3985D6",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    fontSize: 13,
    color: "#777",
    marginLeft: 4,
    flexShrink: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 70,
  },
  emptyText: {
    color: "#999",
    fontSize: 15,
    marginTop: 15,
    textAlign: "center",
  },
});
