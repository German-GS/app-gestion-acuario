// app/(tabs)/explore.tsx
import { useFocusEffect } from "expo-router";
import { collection, getDocs, query } from "firebase/firestore";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTheme } from "../../constants/theme";
import { db } from "../../firebaseConfig";

// Interfaz para definir la estructura de un artículo
interface Article {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
}

// Componente para mostrar cada tarjeta de artículo
const ArticleCard = ({ article }: { article: Article }) => {
  return (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: article.imageUrl }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{article.title}</Text>
        <Text style={styles.cardSummary}>{article.summary}</Text>
      </View>
    </TouchableOpacity>
  );
};

const ExploreScreen = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchArticles = async () => {
        try {
          const articlesQuery = query(collection(db, "articles"));
          const snapshot = await getDocs(articlesQuery);
          const articlesData = snapshot.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              } as Article)
          );
          setArticles(articlesData);
        } catch (error) {
          console.error("Error al cargar los artículos:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchArticles();
    }, [])
  );

  if (isLoading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color={AppTheme.COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.list}>
        <Text style={styles.title}>Explorar Guías</Text>
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.COLORS.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: AppTheme.SIZES.padding,
  },
  title: {
    ...AppTheme.FONTS.h1,
    marginBottom: AppTheme.SIZES.padding,
  },
  card: {
    backgroundColor: AppTheme.COLORS.white,
    borderRadius: AppTheme.SIZES.radius * 1.5,
    marginBottom: AppTheme.SIZES.margin,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    overflow: "hidden", // Para que la imagen respete los bordes redondeados
  },
  cardImage: {
    width: "100%",
    height: 150,
  },
  cardContent: {
    padding: AppTheme.SIZES.margin,
  },
  cardTitle: {
    ...AppTheme.FONTS.h3,
    marginBottom: AppTheme.SIZES.base,
  },
  cardSummary: {
    ...AppTheme.FONTS.body2,
    color: AppTheme.COLORS.darkGray,
  },
});

export default ExploreScreen;
