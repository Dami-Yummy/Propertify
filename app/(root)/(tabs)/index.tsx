
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { useRouter } from "expo-router";
import { Pressable } from "react-native";

import {
    getProperties,
    Property,
} from "../../../database/propertyQueries";

export default function HomeScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Reload properties whenever Home becomes active
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
        } catch (err) {
          console.error("Failed to load properties:", err);
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3985D6" />
      </View>
    );
  }

  return (

    <View style={styles.container}>

        <Image source={require("../../../assets/images/App-Icon.jpg")} 
        style={{ width: 50, height: 50, alignSelf: "center", marginTop: 30 }} />





  <Text style={styles.heading}>
    <Text style={styles.properti}>Properti</Text>
    <Text style={styles.fy}>fy</Text>
  </Text>   


      <Text style={styles.count}>
        {properties.length} Properties Available
      </Text>

      {error ? (
        <Text style={styles.empty}>
          Unable to load properties.
        </Text>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No properties found. Add your first property!
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
                style={styles.card}
                onPress={() =>
                router.push({
                pathname: "../(tabs)/property/[id]",
                params: { id: String(item.id) },
                })
                } >
            

              {item.image_uri ? (
                <Image
                  source={{ uri: item.image_uri }}
                  style={styles.image}
                />
              ) : (
                <View style={styles.placeholder}>
                  <Text>No Image</Text>
                </View>
              )}

              <View style={styles.details}>
                <Text style={styles.title}>{item.title}</Text>

                <Text style={styles.price}>
                  Rs. {item.price.toLocaleString("en-LK")}
                </Text>

                <Text style={styles.location}>
                  📍 {item.location || "Location not set"}
                </Text>

                {item.description ? (
                  <Text style={styles.description} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
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
    fontSize: 50,
    fontWeight: "bold",
    marginBottom: 5,
  
    textAlign: "center",
  },
  count: {
    fontSize: 14,
    color: "#777",
    marginBottom: 20,
  },
  list: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 190,
    resizeMode: "cover",
  },
  placeholder: {
    height: 190,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  details: {
    padding: 15,
  },
  title: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3985D6",
    marginBottom: 6,
  },
  location: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#777",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    textAlign: "center",
    color: "#888",
    marginTop: 50,
  },
    properti: {
      fontSize: 36,
      fontWeight: '800',
      color: '#41526d',
      fontStyle: 'italic',
    },
    fy: {
      fontSize: 22,
      fontWeight: '600',
      color: '#3B82F6',
    }
});
