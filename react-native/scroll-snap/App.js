import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useState } from "react";
import GeeksforGeeks from "./GeekForGeeks";

export default function App() {
  const [items, setItems] = useState([
    {
      id: "1",
      name: "GeeksforGeeks View 1",
    },
    {
      id: "2",
      name: "GeeksforGeeks View 2",
    },
    {
      id: "3",
      name: "GeeksforGeeks View 3",
    },
    {
      id: "4",
      name: "GeeksforGeeks View 4",
    },
    {
      id: "5",
      name: "GeeksforGeeks View 5",
    },
    {
      id: "6",
      name: "GeeksforGeeks View 6",
    },

    {
      id: "7",
      name: "GeeksforGeeks View 7",
    },
    {
      id: "8",
      name: "GeeksforGeeks View 8",
    },
    {
      id: "9",
      name: "GeeksforGeeks View 9",
    },
    {
      id: "10",
      name: "GeeksforGeeks View 10",
    },
  ]);

  return (
    <SafeAreaView>
      <FlatList
        data={items}
        renderItem={({ item }) => <GeeksforGeeks name={item.name} />}
        keyExtractor={(item) => item.id}
        snapToAlignment="start"
        decelerationRate={"fast"}
        // snapToInterval={Dimensions.get("screen").height}
        snapToInterval={Dimensions.get("screen").height}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
