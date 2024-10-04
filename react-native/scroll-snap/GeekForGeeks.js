import { Dimensions, StyleSheet, Text, View } from "react-native";
import React from "react";

const GeeksforGeeks = (props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{props.name}</Text>
    </View>
  );
};

export default GeeksforGeeks;

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get("screen").height,
    width: Dimensions.get("screen").width,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3B5323",
    borderColor: "yellow",
    borderWidth: 2,
    alignSelf: "center",
  },
  title: {
    color: "#fff",
    fontSize: 20,
  },
});
