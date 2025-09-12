import React, { useMemo, useState } from "react";
import { Platform, View, Text, Pressable, Modal } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { PropsDatePicker } from "@/type";



function isoToDate(iso?: string) {
  if (!iso) return new Date();
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
function dateToIso(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function toDisplay(iso?: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function DatePicker({ value, onChange, placeholder = "dd/MM/yyyy", minimumDate, maximumDate, className, disabled }: PropsDatePicker) {
  const [show, setShow] = useState(false);
  const baseDate = useMemo(() => isoToDate(value), [value]);

  const [tempDate, setTempDate] = useState<Date>(baseDate);

  function open() {
    if (disabled) return;
    setTempDate(baseDate);
    setShow(true);
  }
  function close() {
    setShow(false);
  }

  function onAndroidChange(e: DateTimePickerEvent, date?: Date) {
    if (e.type === "set" && date) {
      onChange(dateToIso(date));
    }
    setShow(false);
  }

  return (
    <View>
      <Pressable
        onPress={open}
        className={`bg-white rounded-xl px-4 py-3 border border-gray-300 ${disabled ? "opacity-50" : ""} ${className ?? ""}`}
      >
        <Text className={value ? "text-gray-900" : "text-gray-400"}>
          {value ? toDisplay(value) : placeholder}
        </Text>
      </Pressable>

      {show && Platform.OS === "android" && (
        <DateTimePicker
          value={baseDate}
          mode="date"
          display="default"
          onChange={onAndroidChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {show && Platform.OS === "ios" && (
        <Modal transparent animationType="fade" onRequestClose={close}>
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white p-4 rounded-t-2xl">
              <View className="items-center">
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={(_, d) => d && setTempDate(d)}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                />
              </View>

              <View className="flex-row gap-3 mt-3">
                <Pressable onPress={close} className="flex-1 rounded-xl py-3 items-center border border-gray-300">
                  <Text className="text-gray-800 font-semibold">Cancelar</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    onChange(dateToIso(tempDate));
                    close();
                  }}
                  className="flex-1 rounded-xl py-3 items-center bg-accent-600"
                >
                  <Text className="text-white font-semibold">OK</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
