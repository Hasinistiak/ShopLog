import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { useFocusEffect, useRouter } from 'expo-router';
import { CreateList, fetchUserList } from '../services/listService';
import Icon from '../assets/icons';
import theme from '../constants/theme';
import { hp, wp } from '../helpers/common';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import { getSupabaseFileurl, uploadListImage } from '../services/imageService';

const Home = () => {
  const { user } = useAuth();
  const [list, setList] = useState('');
  const [description, setDescription] = useState('');
  const [lists, setLists] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  const router = useRouter();

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need permission to access your media library!');
    }
  };

  const pickImage = async () => {
    await requestPermission();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    await requestPermission();
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCreateList = async () => {
    if (!imageUri) {
      alert('Please select an image');
      return;
    }

    const { success, data, msg } = await uploadListImage(imageUri, user?.id);

    if (!success) {
      alert(msg || 'Image upload failed');
      return;
    }

    const newList = {
      date: currentDate,
      text: list,
      userId: user?.id,
      image: data,
    };

    const res = await CreateList(newList);
    if (res.success) {
      setLists((prevLists) => [res.data, ...prevLists]);
      setList('');
      setDescription('');
      setImageUri(null);
      setModalVisible(false);
    } else {
      alert('Failed to create list');
    }
  };

  const fetchLists = async () => {
    const userId = user?.id;
    const result = await fetchUserList(userId);
    if (result.success) {
      setLists(result.data);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLists();
    }, [])
  );

  const renderListItem = ({ item }) => (
    <TouchableOpacity style={styles.gridItem} onPress={()=>router.push({pathname : 'listDetailsPage', params : {listDate : item.date, listImage : item.image, listId : item.id, listText: item.text}})}>
      <Image source={{ uri: item.image }} style={styles.gridImage} />
      <Text style={styles.gridText}>{new Date(item.date).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper bg={theme.colors.darker}>
      <View style={styles.container}>
        <Header
          title={'List Board'}
          showBackButton={false}
          showProfileIcon={true}
          mr={wp(4)}
          showSearchIcon={true}
        />

        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Icon name="add" color={theme.colors.darker} />
        </TouchableOpacity>

        <FlatList
          data={lists}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
        />

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Add New List</Text>

                  <TextInput
                    style={styles.input}
                    placeholder="Date"
                    placeholderTextColor={theme.colors.light}
                    value={currentDate}
                    onChangeText={setCurrentDate}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Text"
                    placeholderTextColor={'gray'}
                    value={list}
                    onChangeText={setList}
                  />

                  <View style={styles.imageContainer}>
                    {imageUri ? (
                      <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                    ) : (
                      <Text style={styles.imagePlaceholder}>No Image Selected</Text>
                    )}
                  </View>

                  <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                    <Text style={styles.buttonText}>Select Image</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                    <Text style={styles.buttonText}>Take Photo</Text>
                  </TouchableOpacity>

                  <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.createButton} onPress={handleCreateList}>
                      <Text style={styles.buttonText}>Create</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </ScreenWrapper>
  );
};

export default Home;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  addButton: {
    position: 'absolute',
    backgroundColor: theme.colors.Button2,
    padding: hp(1.8),
    borderRadius: 10,
    bottom: hp(2),
    right: wp(5),
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: theme.colors.dark,
    padding: wp(4),
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: theme.fontWeights.bold,
    marginBottom: hp(2),
    color: 'white',
  },
  input: {
    backgroundColor: theme.colors.darker,
    padding: 10,
    borderRadius: 8,
    marginBottom: hp(3),
    color: theme.colors.secondary,
  },
  imageContainer: {
    marginBottom: hp(2),
    alignItems: 'center',
  },
  imagePreview: {
    width: wp(80),
    height: hp(40),
    borderRadius: 10,
    marginBottom: hp(2),
  },
  imagePlaceholder: {
    color: theme.colors.light,
    fontSize: 16,
  },
  imageButton: {
    backgroundColor: theme.colors.Button2,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: hp(2),
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: theme.fontWeights.medium,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  createButton: {
    backgroundColor: theme.colors.Button2,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: hp(1),
  },
  button: {
    backgroundColor: theme.colors.light,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: hp(1),
  },
  gridContainer: {
    paddingHorizontal: wp(2),
    paddingTop: hp(2),
  },
  gridItem: {
    flex: 1,
    margin: wp(2),
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: theme.colors.dark,
    alignItems: 'center',
  },
  gridImage: {
    width: '100%',
    height: wp(40),
  },
  gridText: {
    padding: hp(1),
    color: theme.colors.light,
    fontSize: 14,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    backgroundColor: theme.colors.Button2,
    padding: hp(1.8),
    borderRadius: 10,
    bottom: hp(2),
    right: wp(5),
    zIndex: 1
  },
});
