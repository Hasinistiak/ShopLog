import { StyleSheet, Text, View, Image, Pressable } from 'react-native'
import React from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import { hp, wp } from '../helpers/common'
import theme from '../constants/theme'
import Button from '../components/Button'
import { useRouter } from 'expo-router'


const welcome = () => {
    const router = useRouter();
    return (
        <ScreenWrapper bg={theme.colors.dark}>
            <StatusBar style='dark' />
            <View style={styles.container}>

                {/* title */}
                <View style={{ gap: 20 }}>
                    <Text style={styles.title}>Shop Log</Text>
                    <Text style={styles.subTitle}>
                        Never lose a list
                    </Text>
                </View>

                {/* button */}
                <View style={styles.button}>
                    <Button
                        title="Get Started!"
                        buttonStyle={{ marginHorisontal: wp(3) }}
                        onPress={() => router.push('signup')}
                    />
                    <View style={styles.bottomTextContainer}>
                        <Text style={styles.loginText}>
                            Already Have an Account?
                        </Text>
                        <Pressable onPress={() => router.push('login')}>
                            <Text style={[styles.loginText, { color: theme.colors.Button2 }]}>Login</Text>
                        </Pressable>
                    </View>
                </View>

            </View>
        </ScreenWrapper>
    )
}

export default welcome

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.dark,
        paddingHorizontal: wp(3),
    },

    title: {
        color: theme.colors.light,
        fontSize: hp(4),
        textAlign: 'center',
        fontWeight: theme.fontWeights.medium,
        font: theme.fonts.primary
    },

    subTitle: {
        textAlign: 'center',
        paddingHorizontal: wp(10),
        fontSize: hp(1.8),
        color: theme.colors.secondary,
    },

    button: {
        marginTop: hp(8),
        gap: 30,
        width: '100%'
    },

    bottomTextContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },

    loginText: {
        textAlign: 'center',
        color: theme.colors.secondary,
        fontSize: hp(1.8)
    }

})