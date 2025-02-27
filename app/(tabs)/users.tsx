import {
  StyleSheet,
  FlatList,
  View,
  ActivityIndicator,
  Button,
} from "react-native";
import { useEffect, useState } from "react";
import { fetchUserScores } from "@/api/supabaseService";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

interface User {
  id: number;
  name: string;
  score: number;
  difficulty_level: string;
}

const ITEMS_PER_PAGE = 10;

export default function TabTwoScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const fetchUsers = async (pageNum: number) => {
    setLoading(true);
    try {
      const data = await fetchUserScores(pageNum, ITEMS_PER_PAGE);
      if (Array.isArray(data)) {
        setUsers(data);
        setHasMore(data.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error("Error fetching user scores", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.title}>
          Users List {users.length > 0 ? `(${users.length})` : 0}
        </ThemedText>
      </ThemedView>

      <View style={styles.tableHeader}>
        <ThemedText style={styles.headerText}>Name</ThemedText>
        <ThemedText style={styles.headerText}>Score</ThemedText>
        <ThemedText style={styles.headerText}>Difficulty</ThemedText>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <ThemedText style={styles.cell}>{item.name}</ThemedText>
            <ThemedText style={styles.cell}>{item.score}</ThemedText>
            <ThemedText style={styles.cell}>{item.difficulty_level}</ThemedText>
          </View>
        )}
        ListFooterComponent={
          loading ? <ActivityIndicator size="small" color="#000" /> : null
        }
      />

      {/* Pagination Buttons */}
      <View style={styles.paginationContainer}>
        <Button
          title="Previous"
          onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        />
        <ThemedText style={styles.pageNumber}>Page {page}</ThemedText>
        <Button
          title="Next"
          onPress={() => setPage((prev) => prev + 1)}
          disabled={!hasMore}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  title: { textAlign: "center", fontSize: 20 },
  titleContainer: { flexDirection: "row", marginBottom: 20, padding: 10 },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
    backgroundColor: "#f0f0f0",
  },
  headerText: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
    color: "#000",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  cell: { flex: 1, textAlign: "center" },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  pageNumber: { marginHorizontal: 10, fontSize: 16, fontWeight: "bold" },
});
