import { supabase } from "../lib/supabase";

export const CreateList = async (list) => {
    try {
  
      const { data, error } = await supabase
        .from('lists')
        .insert(list)
        .select()
        .single()
  
  
      if (error) {
        //console.log("lists error:", error);
        return { success: false, msg: "Could not add the lists" };
      }
  
      return { success: true, data: data };
  
    } catch (error) {
      //console.log("lists error:", error);
      return { success: false, msg: "Could not add the lists" };
    }
  };


  export const fetchUserList = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('userId', userId)
        .order('created_at', { ascending: false });  
  
      if (error) {
        //console.log("Error fetching user lists:", error);
        return { success: false, msg: "Could not fetch lists" };
      }
  
      //console.log("Fetched lists for user:", data);
  
      return { success: true, data: data };
    } catch (error) {
      //console.log("Unexpected error in fetchUserlists:", error);
      return { success: false, msg: "An unexpected error occurred" };
    }
  };

  export const Updatelists = async (userId, lists, listsId) => {
    try {
  
      const { data, error } = await supabase
        .from('lists')
        .update(lists)
        .eq('userId', userId)
        .eq('id', listsId)
  
  
      if (error) {
        //console.log("lists error:", error);
        return { success: false, msg: "Could not add the lists" };
      }
  
      return { success: true, data: data };
  
    } catch (error) {
      //console.log("lists error:", error);
      return { success: false, msg: "Could not add the lists" };
    }
  };

  export const Removelists = async (userId, listsId) => {
    try {
  
      const { data, error } = await supabase
        .from('lists')
        .delete()
        .eq('userId', userId)
        .eq('id', listsId)
  
  
      if (error) {
        //console.log("lists error:", error);
        return { success: false, msg: "Could not add the lists" };
      }
  
      return { success: true, data: data };
  
    } catch (error) {
      //console.log("lists error:", error);
      return { success: false, msg: "Could not add the lists" };
    }
  };

  export const fetchUserOnHolds = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('userId', userId)
        .eq('state', 'onHold')
        .order('created_at', { ascending: false });  
  
      if (error) {
        //console.log("Error fetching user lists:", error);
        return { success: false, msg: "Could not fetch lists" };
      }
  
      //console.log("Fetched lists for user:", data);
  
      return { success: true, data: data };
    } catch (error) {
      //console.log("Unexpected error in fetchUserlists:", error);
      return { success: false, msg: "An unexpected error occurred" };
    }
  };

  export const fetchUserExecutions = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('userId', userId)
        .eq('state', 'execution')
        .order('created_at', { ascending: false });  
  
      if (error) {
        //console.log("Error fetching user lists:", error);
        return { success: false, msg: "Could not fetch lists" };
      }
  
      //console.log("Fetched lists for user:", data);
  
      return { success: true, data: data };
    } catch (error) {
      //console.log("Unexpected error in fetchUserlists:", error);
      return { success: false, msg: "An unexpected error occurred" };
    }
  };

  export const fetchUserExecuted = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('userId', userId)
        .eq('state', 'executed')
        .order('created_at', { ascending: false });  
  
      if (error) {
        //console.log("Error fetching user lists:", error);
        return { success: false, msg: "Could not fetch lists" };
      }
  
      //console.log("Fetched lists for user:", data);
  
      return { success: true, data: data };
    } catch (error) {
      //console.log("Unexpected error in fetchUserlists:", error);
      return { success: false, msg: "An unexpected error occurred" };
    }
  };

  export const GetlistsDetails = async (listsId) => {
    try {
      const { data, error } = await supabase
        .from('lists') // Replace with your table name
        .select('feasibility, impact, scalability, excitement')
        .eq('id', listsId)
        .single();
  
      if (error) throw error;
      return data;
    } catch (error) {
      //console.error('Error fetching lists details:', error);
      return null;
    }
  };
  