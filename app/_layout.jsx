import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { Stack, useRouter } from 'expo-router'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { getUserData } from '../services/userservice'


const _layout = ()=>{
  return (
    <View style={{ flex: 1 }}>
    <AuthProvider>
      <MainLayout/>
    </AuthProvider>
    </View>
  )
}

const MainLayout = () => {
  const {setAuth, setUserData} = useAuth();
  const router = useRouter();

  useEffect(()=>{
    supabase.auth.onAuthStateChange((_event, session) => {
      //console.log('session user: ', session?.user?.id);


      if(session){
        setAuth(session?.user)
        updateUserData(session?.user, session?.user?.email);
        router.replace('/home')

      }else{
        setAuth(null)
        router.replace('/welcome')

      }

    })
  }, [])

  const updateUserData = async (user, email)=>{
    let res = await getUserData(user?.id);
    if(res.success) setUserData({...res.data, email});
  } 

  return (
    <Stack
        screenOptions={{
            headerShown:false,
            animation: 'slide_from_right',
        }}
    >
    </Stack>
  )
}

export default _layout