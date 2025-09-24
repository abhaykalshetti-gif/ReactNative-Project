import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { initDB, deleteAppointment } from "./db";

// New fetchAllAppointments using async API
import * as SQLite from "expo-sqlite";
const db = SQLite.openDatabaseSync("appointments.db");

const fetchAllAppointments = async () => {
  return await db.getAllAsync("SELECT * FROM appointments ORDER BY createdAt DESC");
};

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadAppointments = async () => {
    const rows = await fetchAllAppointments();
    setAppointments(rows);
  };

  useEffect(() => {
    initDB().then(loadAppointments);
  }, []);

  const handleDelete = async (id?: number) => {
    if (!id) return;
    await deleteAppointment(id);
    Alert.alert("Deleted", "Appointment deleted successfully!");
    loadAppointments();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const formatCreatedAt = (createdAt?: string) => {
    if (!createdAt) return "";
    const dateObj = new Date(createdAt);
    const now = new Date();

    const isToday =
      dateObj.getDate() === now.getDate() &&
      dateObj.getMonth() === now.getMonth() &&
      dateObj.getFullYear() === now.getFullYear();

    if (isToday) {
      return dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return dateObj.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <View style={styles.container}>

      {appointments.length === 0 ? (
        <Text style={styles.noData}>No appointments available.</Text>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.requested}>Requested: {formatCreatedAt(item.createdAt)}</Text>
              </View>

              <Text style={styles.detail}>📅 Date: {item.date}</Text>
              <Text style={styles.detail}>⏰ Time: {item.time}</Text>
              <Text style={styles.detail}>📝 {item.description}</Text>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.deleteText}>Delete Appointment</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8f9fa" },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#1d4ed8",
  },
  noData: { textAlign: "center", color: "gray", marginTop: 20 },
  card: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  name: { fontSize: 18, fontWeight: "bold", color: "#2563eb" },
  requested: { fontSize: 12, color: "gray" },
  detail: { fontSize: 14, color: "#374151", marginVertical: 2 },
  deleteBtn: { marginTop: 8, backgroundColor: "#dc2626", padding: 8, borderRadius: 6 },
  deleteText: { color: "white", fontWeight: "600", textAlign: "center" },
});
