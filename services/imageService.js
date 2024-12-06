import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { supabaseUrl } from '../constants';

// Function to upload a product image to Supabase
export const uploadListImage = async (fileUri, userId) => {
    try {
        if (!fileUri) {
            throw new Error('File URI is invalid or null.');
        }

        // Log the file URI to check if it's correct
        console.log('File URI:', fileUri);

        // Check if the file exists before attempting to read it
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        console.log('File info:', fileInfo); // Log file info to inspect
        if (!fileInfo.exists) {
            throw new Error('File does not exist at the specified URI.');
        }

        // Read the file as Base64
        const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        // Decode the Base64 string to binary data
        const fileBuffer = decode(fileBase64);

        // Generate a unique file name for the product image
        const fileName = getFileName(userId);

        // Get the mime type based on file extension
        const mimeType = getMimeType(fileUri);

        // Upload the file to Supabase storage
        const { data, error } = await supabase.storage
            .from('ListImages') // Assuming this is your Supabase bucket for product images
            .upload(fileName, fileBuffer, {
                cacheControl: '3600',
                upsert: false,
                contentType: mimeType, // Use the dynamic content type
            });

        if (error) {
            console.error('File upload error:', error);
            return { success: false, msg: error.message || 'Could not upload image' };
        }

        console.log('Upload successful:', data);

        // Return the image path, which can be used to generate the public URL
        const imageUrl = getSupabaseFileurl(data.path);
        return { success: true, data: imageUrl };
    } catch (error) {
        console.log('File upload error:', error.message || error);
        return { success: false, msg: error.message || 'Could not upload image' };
    }
};

// Function to get the full public URL of the uploaded image from Supabase Storage
export const getSupabaseFileurl = (filePath) => {
    if (filePath) {
        return `${supabaseUrl}/storage/v1/object/public/ListImages/${filePath}`;
;
    }
    return null;
};

// Function to generate a unique file name with the user ID and a timestamp
export const getFileName = (userId) => {
    return `product_${userId}_${new Date().getTime()}.png`; // .png is used as the file extension
};

// Function to get the mime type based on file extension
const getMimeType = (fileUri) => {
    const extension = fileUri.split('.').pop().toLowerCase();
    const mimeTypes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'bmp': 'image/bmp',
        // Add other formats as needed
    };
    return mimeTypes[extension] || 'image/jpeg'; // Default to 'image/jpeg' if mime type is unknown
};

// Function to save the image URL to the database
export const saveListImageUrl = async (listId, imageUrl) => {
    try {
        const { data, error } = await supabase
            .from('lists')
            .insert('image', imageUrl)
            .eq('id', listId);

        if (error) {
            console.log(error.message);
        }

        console.log('Product image URL saved:', data);
    } catch (error) {
        console.log('Error saving image URL:', error.message);
        return { success: false, msg: error.message };
    }
};

// Example of using the above functions in a process like creating a list
export const handleCreateList = async (fileUri, userId, listId) => {
    try {
        const uploadResult = await uploadListImage(fileUri, userId);
        if (!uploadResult.success) {
            return { success: false, msg: uploadResult.msg };
        }

        const imageUrl = uploadResult.data; // Get the image URL from the upload result
        await saveListImageUrl(listId, imageUrl); // Save the image URL in the database
        return { success: true, msg: 'List created with image successfully' };
    } catch (error) {
        console.log('Error creating list:', error.message);
        return { success: false, msg: error.message };
    }
};
