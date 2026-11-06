import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform } from "react-native";



function IOSTabs() {
  return (

    <NativeTabs>

      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf="house.fill" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search">
        <Icon sf="magnifyingglass" />
        <Label>Search</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="create">
        <Icon sf="plus.circle.fill" />
        <Label>Add Property</Label>
      </NativeTabs.Trigger>
      
    </NativeTabs>
);
}

function AndroidTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3985D6",
        tabBarInactiveTintColor: "#222222",
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 65,
          paddingBottom: 5,
          paddingTop: 5,
        },
      }}
    >


      <Tabs.Screen
        name="create"
        options={{
          title: "Add Property",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
  name="property/[id]"
  options={{
    href: null,
  }}
/>

      

    </Tabs>
  );
}


export default function TabsLayout() {
  return Platform.OS === "ios" ? <IOSTabs /> : <AndroidTabs />;
}