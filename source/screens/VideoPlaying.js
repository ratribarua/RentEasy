import { useCallback, useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native'
import YouTubePlayer from 'react-native-youtube-iframe';

const VideoPlaying = () => {
    const [playing ,setPlaying] = useState(false);

    const onStateChange = useCallback(state => {
        if(state === 'ended'){
            setPlaying(false);
            Alert.alert('video has finished playing!');
        }
    }, []);

    const togglePlaying = useCallback(() => {
        setPlaying(prev =! prev);
    },[]);

    return (
        <View>
            <View style={styles.aboutAppContainer}>
                <Text style={styles.aboutAppTitle}>About App</Text>
                <YouTubePlayer
                style={{ borderRadius:20, marginTop: 5}}
                height={230}
                play= {playing}
                videoId={'tzyGQJNIsHo'}
                onChangeState={onStateChange}
            />
            </View>
            <View><Text style={styles.aboutAppDescription}>
                    
The book rental app provides users with a convenient way to access a wide range of books without the need to purchase them outright.
                </Text></View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // Your styles here
    },
    aboutAppContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#f0f0f0',
    },
    aboutAppTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    aboutAppDescription: {
        fontSize: 20,
        lineHeight: 25,
       alignItems:"center",
       paddingLeft:10,
    }
});

export default VideoPlaying;
