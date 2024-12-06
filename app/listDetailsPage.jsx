import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Pressable,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { hp, wp } from '../helpers/common';
import { Removelists, Updatelists } from '../services/listService'; 
import theme from '../constants/theme';

import { useAuth } from '../contexts/AuthContext';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import { uploadListImage } from '../services/imageService';


const listDetails = () => {
  const { listImage, listDate, listId, listText } = useLocalSearchParams();
  const [date, setDate] = useState(listDate || '');
  const [imageUri, setImageUri] = useState(listImage || ''); 
  const [isChanged, setIsChanged] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDateModalVisible, setIsDateModalVisible] = useState(false);
  const [imageWidth, setImageWidth] = useState(0); 
  const [imageHeight, setImageHeight] = useState(0); 
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {
    if (date !== listDate || imageUri !== listImage) {
      setIsChanged(true);
    } else {
      setIsChanged(false);
    }
  }, [date, imageUri]);

  const requestPermission = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need permission to access your media library!');
    }
  }, []);

  const pickImage = async () => {
    await requestPermission();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
    }
  };

  const takePhoto = async () => {
    await requestPermission();
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
    }
  };

  const handleSave = async () => {
    let updatedList = {
      date,
      image: imageUri,
    };

    if (imageUri.startsWith('file://')) {
      // Upload image to Supabase if it's a local file URI
      const uploadResult = await uploadListImage(imageUri, user.id);
      if (uploadResult.success) {
        updatedList = {
          ...updatedList,
          image: uploadResult.data, // Use the public URL returned from Supabase
        };
      } else {
        Alert.alert('Error', 'Failed to upload image.');
        return;
      }
    }

    const res = await Updatelists(user.id, updatedList, listId);
    if (res.success) {
      Alert.alert('Success', 'List updated successfully!');
      handleCloseEditModal()
    } else {
      Alert.alert('Error', 'Failed to update the list.');
    }
  };

  const handleImagePress = () => {
    setIsModalVisible(true);
  };

  const handleCloseDateModal = () => {
    setIsDateModalVisible(false)
  }

  const handleCloseModal = () => {
    setIsModalVisible(false); 
  };

  const handleDatePress = () => {
    setIsDateModalVisible(true)
  }

  const onImageLoad = (event) => {
    const { width, height } = event.nativeEvent.source;
    const screenWidth = Dimensions.get('window').width;
    const ratio = width / height;
    const newHeight = screenWidth / ratio; 
    setImageWidth(screenWidth);
    setImageHeight(newHeight);
  };

  useEffect(() => {
    if (imageUri) {
      Image.getSize(imageUri, (width, height) => {
        const aspectRatio = width / height;
        const newHeight = wp(100) / aspectRatio;
        setImageHeight(newHeight);
      });
    }
  }, [imageUri]);

  const handleImageLongPress = () => {
    setIsEditModalVisible(true); 
  };
  
  const handleCloseEditModal = () => {
    setIsEditModalVisible(false); 
  };

  const handleListRemove = async () => {
    const res = await Removelists(user?.id, listId)
    if (res.success) {
      router.back()
    }

  }

  const confirmRemove = () => {
    Alert.alert(
      "Remove Confirmation", 
      'Are you sure you want to remove this list?',
      [
        {
          text: "Close",
          style: "cancel", 
        },
        {
          text: "Remove", 
          style: "destructive", 
          onPress: handleListRemove, 
        },
      ],
      { cancelable: true }
    );
  };


  return (
    <ScreenWrapper bg={theme.colors.darker}>
      
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Header title={listDate} setTitleOnPress={handleDatePress} showDeleteIcon={true} onDeletePress={confirmRemove}/>        

        {/* Image Section */}
        <View style={[styles.imageContainer, { height: imageHeight }]}>
          <Pressable onPress={handleImagePress} onLongPress={handleImageLongPress}>
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.listText}>{listText}</Text>
          </Pressable>
        </View>

      </ScrollView>

      {/* Modal to show image in original aspect ratio */}
      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <TouchableWithoutFeedback onPress={handleCloseModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Image
                source={{ uri: imageUri }}
                style={[styles.modalImage, { width: imageWidth, height: imageHeight }]}
                resizeMode="contain"
                onLoad={onImageLoad} 
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

       {/* Editable Date */}
       <Modal visible={isDateModalVisible} transparent={true} animationType="fade">
  <TouchableWithoutFeedback onPress={handleCloseDateModal}>
    <View style={styles.dateModalOverlay}>
      <View style={styles.dateModalContent}>
        <Text style={styles.dateModalTitle}>Edit Date</Text>
        <TextInput
          style={styles.dateInput}
          value={date}
          onChangeText={setDate}
          placeholder="Enter Date (e.g., YYYY-MM-DD)"
          placeholderTextColor={theme.colors.light}
        />
        <View style={styles.dateModalActions}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCloseDateModal}>
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
              setIsDateModalVisible(false);
            }}
          >
            <Text style={styles.actionButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </TouchableWithoutFeedback>
</Modal>
<Modal visible={isEditModalVisible} transparent={true} animationType="fade">
  <TouchableWithoutFeedback onPress={handleCloseEditModal}>
    <View style={styles.modalOverlay}>
      <View style={styles.editModalContent}>
        <TouchableOpacity style={styles.editActionButton} onPress={pickImage}>
          <Text style={styles.editActionText}>Change Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editActionButton} onPress={takePhoto}>
          <Text style={styles.editActionText}>Take Photo</Text>
        </TouchableOpacity>
        {isChanged && (
          <TouchableOpacity style={styles.editActionButton} onPress={handleSave}>
            <Text style={styles.editActionText}>Save Changes</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.cancelButton} onPress={handleCloseEditModal}>
          <Text style={styles.editActionText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableWithoutFeedback>
</Modal>



    </ScreenWrapper>
  );
};

export default listDetails;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, 
    backgroundColor: theme.colors.darker,
    paddingBottom: hp(3),
  },
  
  dateInput: {
    width: '100%',
    backgroundColor: theme.colors.dark,
    padding: hp(2),
    borderRadius: 8,
    fontSize: 16,
    color: theme.colors.light,
  },
  imageContainer: {
    width: '100%',
    marginBottom: hp(4),
    marginTop: hp(4)
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: hp(3),
  },
  changeImageButton: {
    backgroundColor: theme.colors.Button2,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: theme.fontWeights.medium,
  },
  saveButton: {
    backgroundColor: theme.colors.Button2,
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: theme.fontWeights.bold,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 1)',
  },

  dateModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  dateModalContent: {
    width: '90%',
    backgroundColor: theme.colors.darker,
    borderRadius: 10,
    padding: hp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  dateModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.light,
    marginBottom: hp(2),
    textAlign: 'center',
  },
  dateInput: {
    width: '100%',
    backgroundColor: theme.colors.dark,
    padding: hp(2),
    borderRadius: 8,
    fontSize: 16,
    color: theme.colors.light,
    marginBottom: hp(2),
  },
  dateModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(2),
  },
  cancelButton: {
    backgroundColor: theme.colors.Button,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(5),
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: theme.colors.Button2,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(5),
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
  },
  editModalContent: {
    width: '80%',
    backgroundColor: theme.colors.dark,
    borderRadius: 12,
    paddingVertical: hp(3),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  editActionButton: {
    backgroundColor: theme.colors.Button2,
    paddingVertical: hp(2),
    borderRadius: 8,
    marginBottom: hp(1.5),
    width: '90%',
    alignItems: 'center',
  },

  editActionText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  listText: {
    fontSize: 16,
    color: theme.colors.light, 
    fontWeight: theme.fontWeights.medium,
    marginTop: hp(2), 
    marginLeft: hp(2),
    marginRight: hp(2)
  },
});

