import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ScreenWrapper from '../components/ScreenWrapper';
import theme from '../constants/theme';
import Header from '../components/Header';
import Icon from '../assets/icons';
import { useRouter } from 'expo-router';

const searchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [lists, setLists] = useState([]);
  const router = useRouter()

  // Fetch ideas based on search query
  useEffect(() => {
    const fetchLists = async () => {
      if (searchQuery.trim() === '') {
        setLists([]); // Clear results if the search query is empty
        return;
      }
  
      try {
        let query = supabase.from('lists').select('*');
  
        // Check the length of the searchQuery to determine how to query dates
        if (searchQuery.length === 10) { // Exact date (YYYY-MM-DD)
          query = query.eq('date', searchQuery); 
        } else if (searchQuery.length === 7) { // Partial date (YYYY-MM)
          const startDate = `${searchQuery}-01`;
          const endDate = `${searchQuery}-31`; // Covers all days in the month
          query = query.gte('date', startDate).lte('date', endDate);
        } else if (searchQuery.length === 4) { // Partial date (YYYY)
          const startDate = `${searchQuery}-01-01`;
          const endDate = `${searchQuery}-12-31`;
          query = query.gte('date', startDate).lte('date', endDate);
        } else {
          // Invalid format; skip fetching
          setLists([]);
          return;
        }
  
        // Execute the query
        const { data, error } = await query;
  
        if (error) {
          console.error('Error fetching lists:', error);
          setLists([]); // Clear results on error
        } else {
          setLists(data); // Update state with fetched data
        }
      } catch (error) {
        console.error('Error in fetchLists:', error);
      }
    };
  
    fetchLists();
  }, [searchQuery]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}
      onPress={() =>
        router.push({
          pathname: 'listDetailsPage',
          params: {
            listId: item.id,
            listText: item.text,
            listImage: item.image,
            listDate: item.date,
          },
        })
      }>
      <Text style={styles.cardTitle}>{item.date}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper bg={theme.colors.darker}>
      <Header title={'Search'} />

      <View style={styles.container}>
      <FlatList
  ListHeaderComponent={
    <View style={styles.searchBar}>
      <Icon name={'search'} color={'white'} size={20} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search Your Lists..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor={theme.colors.light}
      />
    </View>
  }
  data={lists}
  renderItem={renderItem}
  keyExtractor={(item) => item.id.toString()} // Use `item.id` and convert it to a string
  contentContainerStyle={styles.resultsContainer}
  showsVerticalScrollIndicator={false}
/>

      </View>
    </ScreenWrapper>
  );
};

export default searchPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: theme.colors.darker,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.dark,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: theme.colors.light,
    marginLeft: 8,  // Add spacing between icon and input
  },
  resultsContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: theme.colors.dark,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.light,
  },
});
