import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import YouTubePlayer from 'react-native-youtube-iframe';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

const VideoPlaying = () => {
    const [playing, setPlaying] = useState(false);
    const [averageRating, setAverageRating] = useState(null);

    useEffect(() => {
        // Fetch the average rating when the component mounts
        const fetchAverageRating = async () => {
            try {
                const ratingsCollection = collection(db, 'ratings');
                const ratingsSnapshot = await getDocs(ratingsCollection);

                let totalRating = 0;
                let ratingCount = 0;

                ratingsSnapshot.forEach(doc => {
                    totalRating += doc.data().rating;
                    ratingCount += 1;
                });

                if (ratingCount > 0) {
                    const average = totalRating / ratingCount;
                    setAverageRating(average.toFixed(1));
                } else {
                    setAverageRating(0);
                }
            } catch (error) {
                console.error('Error fetching average rating:', error);
            }
        };

        fetchAverageRating();
    }, []);

    const onStateChange = useCallback(state => {
        if (state === 'ended') {
            setPlaying(false);
            Alert.alert('Video has finished...Thanks for watching!');
        }
    }, []);

    const togglePlaying = useCallback(() => {
        setPlaying(prev => !prev);
    }, []);

    return (
        <View>
            <View style={styles.aboutAppContainer}>
                <Text style={styles.aboutAppTitle}>About App</Text>
                {averageRating !== null && (
                    <Text style={styles.appRatingText}>App Rating: {averageRating} / 5</Text>
                )}
                <YouTubePlayer
                    style={{ borderRadius: 20, marginTop: 5 }}
                    height={250}
                    play={playing}
                    videoId={'tzyGQJNIsHo'}
                    onChangeState={onStateChange}
                />
            </View>
            <View>
                <Text style={styles.aboutAppDescription}>
                    The book rental app provides users with a convenient way 
                    to access a wide range of books without the need to purchase them outright.
                </Text>
            </View>
        </View>
    );
};

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
        marginBottom: 10,
    },
    appRatingText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    aboutAppDescription: {
        fontSize: 20,
        lineHeight: 25,
        alignItems: "center",
        paddingLeft: 10,
    },
});

export default VideoPlaying;
