import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, ScrollView, TouchableOpacity, StyleSheet, Alert , Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { initDB, insertAppointment, fetchAppointmentsByDate } from "./db";

type FormData = { name: string; date: string; time: string; description: string };

export default function AppointmentForm() {
  const [form, setForm] = useState<FormData>({ name: "", date: "", time: "", description: "" });
  const [message, setMessage] = useState("");
  const [finalSlots, setFinalSlots] = useState<string[]>([]);
const [showDatePicker, setShowDatePicker] = useState(false);


const [loadingSlots, setLoadingSlots] = useState(false);

const fetchAvailableTimeSlots = async (date: string) => {  // ✅ take date param
  if (!date) return;
  setLoadingSlots(true);
  try {
    const appointments = await fetchAppointmentsByDate(date); // ✅ only that date
    const bookedSlots = appointments.map(a => a.time);

    const allSlots = generateTimeSlots();
    const available = allSlots.filter(slot => !bookedSlots.includes(slot));

    setFinalSlots(available);
    setForm(prev => ({ ...prev, time: "" })); // reset time if date changes
  } catch (err) {
    console.error("Error fetching available slots", err);
  } finally {
    setLoadingSlots(false);
  }
};

const onDateChange = (event: any, selectedDate?: Date) => {
  setShowDatePicker(false);
  if (selectedDate) {
    const formatted = selectedDate.toISOString().split("T")[0];
    handleChange("date", formatted);
    fetchAvailableTimeSlots(formatted);   // ✅ call here
  }
};


  useEffect(() => {
    initDB();
    fetchAvailableTimeSlots(form.date);
  }, []);
  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    slots.push("18:00");
    return slots;
  };
const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };


  const handleSubmit = async () => {
    if (!form.name || !form.date || !form.time || !form.description) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    await insertAppointment(form.name, form.date, form.time, form.description);
    setMessage("✅ Appointment Scheduled Successfully!");
    setForm({ name: "", date: "", time: "", description: "" });
    fetchAvailableTimeSlots();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Full Name</Text>
     
      <TextInput style={styles.input} value={form.name} onChangeText={(val) => setForm({ ...form, name: val })} placeholder="Enter your name" 
                          placeholderTextColor="#888" />
         
 {/* Date Picker */}
 <Text style={styles.label}>Enter the date</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={{ color: form.date ? "black" : "gray" }}>
          {form.date || "Select Appointment Date"}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          value={form.date ? new Date(form.date) : new Date()}
          onChange={onDateChange}
        />
      )}

      <Text style={styles.label}>Appointment Time</Text>
      <ScrollView style={styles.timeList}>
        {generateTimeSlots().map(slot => {
          const isAvailable = finalSlots.includes(slot);
          return (
            <TouchableOpacity
              key={slot}
              disabled={!isAvailable}
              style={[styles.timeSlot, form.time === slot && styles.selectedSlot, !isAvailable && styles.disabledSlot]}
              onPress={() => setForm({ ...form, time: slot })}
            >
              <Text style={{ color: isAvailable ? "#000" : "#888", textDecorationLine: isAvailable ? "none" : "line-through" }}>{slot}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, { height: 80 }]} multiline value={form.description} onChangeText={(val) => setForm({ ...form, description: val })} placeholder="Reason for appointment"
                          placeholderTextColor="#888"  />
<Text>

</Text>
      <Button title="Schedule Appointment" onPress={handleSubmit} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f9fafb", flexGrow: 1 },
  title: { fontSize: 24, fontWeight: "bold", color: "#1d4ed8", marginBottom: 20, textAlign: "center" },
  label: { fontSize: 14, fontWeight: "600", marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, backgroundColor: "#fff" },
  timeList: { maxHeight: 150, marginBottom: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 6, backgroundColor: "#fff" },
  timeSlot: { padding: 8, borderRadius: 6, marginVertical: 4, backgroundColor: "#f3f4f6" },
  selectedSlot: { backgroundColor: "#dbeafe" },
  disabledSlot: { backgroundColor: "#f9fafb" },
  message: { marginTop: 15, textAlign: "center", fontWeight: "600", color: "green" },
});
