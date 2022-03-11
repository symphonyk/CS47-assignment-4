import { StyleSheet, Text, SafeAreaView, FlatList, View, Image, Pressable } from "react-native";
import { useState, useEffect } from "react";
import { ResponseType, useAuthRequest } from "expo-auth-session";
import { myTopTracks, albumTracks } from "./utils/apiOptions";
import { REDIRECT_URI, SCOPES, CLIENT_ID, ALBUM_ID } from "./utils/constants";
import Colors from "./Themes/colors"
import millisToMinutesAndSeconds from "./utils/millisToMinuteSeconds.js"
import { Ionicons } from '@expo/vector-icons';
import { WebView } from "react-native-webview";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

// Endpoints for authorizing with Spotify
const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token"
};

const Stack = createStackNavigator();

let contentDisplayed = null;
export default function App() {
  const [token, setToken] = useState("");
  const [tracks, setTracks] = useState([]);
  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId: CLIENT_ID,
      scopes: SCOPES,
      // In order to follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
      // this must be set to false
      usePKCE: false,
      redirectUri: REDIRECT_URI
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { access_token } = response.params;
      setToken(access_token);
    }
  }, [response]);


  useEffect(() => {
    const fetchTracks = async () => {
      // TODO: Comment out which one you don't want to use
      // myTopTracks or albumTracks

      const res = await myTopTracks(token);
      // const res = await albumTracks(ALBUM_ID, token);
      setTracks(res);
    };
    if (token) {
        fetchTracks(); }
      }, [token]);

  const SpotifyAuthentButton = () => {
    return (
      <Pressable
        onPress = {() => {
          promptAsync();
        }}
        style = {({ pressed }) => [
          {
            backgroundColor: pressed
            ? 'darkgreen'
            : 'limegreen',
            borderRadius: '100%',
            height: 35,
            width: 200,
          },
        ]}>
          <View syle = {{display: 'flex', flexDirection: "row", justifyContent: 'center', alignItems:'center'}}>
          <Image style = {{width:20, height: 20, marginTop: 7}} source = {require("./assets/spotify-logo.png")}/>
          <Text style = {{paddingLeft: 27, color: 'white', fontWeight: 'bold', fontSize: 13, marginTop: -15}}>
            CONNECT WITH SPOTIFY
          </Text>
          </View>
        </Pressable>
    );
  }

  const Track = ({imgURL, Title, Artist, Album, Time, e_url, p_url}) => {
    const navigation = useNavigation();
    return(
      <Pressable style = {styles.trackStyles}
        onPress={() => {
        navigation.navigate("PlayButton", { e_url: e_url})
      }}>
      <Pressable onPress={(e) => {
        e.stopPropagation()
        navigation.navigate("Preview", {p_url: p_url});
      }}>
        <Ionicons name="play-circle" size={25} color={Colors.spotify} />
      </Pressable>
      <View style = {styles.ImgAndTitlesStyles}>
        <Image source = {{ uri: imgURL}} style = {{width: 45, height:45,}}/>
        <View style={styles.titleArtistStyles}>
          <Text style = {styles.trackInfo} numberOfLines={1}>{Title}</Text>
          <Text style = {styles.artistInfo}numberOfLines={1}>{Artist}</Text>
        </View>
      </View>
      <View style = {styles.AlbumAndTimeStyles}>
        <Text style = {styles.trackInfo}numberOfLines={1}>{Album}</Text>
        <Text style = {styles.trackInfoTime}numberOfLines={1}>{millisToMinutesAndSeconds(Time)}</Text>
      </View>
      </Pressable>
    );
  }

  const renderItem = ({item}) => (
    <Track
    Artist = {item.album.artists[0].name}
    imgURL={item.album.images[0].url}
    Title = {item.name}
    Album = {item.album.name}
    Time = {item.duration_ms}
    e_url = {item.external_urls.spotify}
    p_url = {item.preview_url}
  />)

  const TopTracks = () => {
    return (
      <View style = {styles.TopTracksPage}>
        <View style = {styles.TopTracksTitle}>
          <Image style = {styles.TopTrackslogo} source={require("./assets/spotify-logo.png")}/>
          <Text style = {styles.TitleMyTopTracks}>My Top Tracks</Text>
        </View>

      <View style = {styles.TopTracksStyles}>
        <FlatList
        data = {tracks}
        renderItem = {renderItem}
        keyExtractor = {item => item.id}
    />
      </View>
      </View>
        );
      }


  function PlayButton({ navigation, route }) {
    return (
      <WebView source={{ uri: route.params.e_url }} />
    );
  }

  function Preview({ navigation, route }) {
    return (
      <WebView source={{ uri: route.params.p_url }} />
    );
  }

  function Auth() {
    return (
      <SafeAreaView style={styles.container}>
        {contentDisplayed}
      </SafeAreaView>
    );
  }


if (token) {
    // Authenticated, make API request
    contentDisplayed = <TopTracks/>
  }else{
    contentDisplayed = <SpotifyAuthentButton/>
}
  
return (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen options={{ headerShown: false }} name="Auth" component={Auth} />
      <Stack.Screen
        name="PlayButton" component={PlayButton} />
      <Stack.Screen
        name="Preview" component={Preview} />
    </Stack.Navigator>
  </NavigationContainer>
);
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: Colors.background,
    alignItems: 'center',
  },


  trackInfo: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13

  },

  artistInfo: {
    color: 'darkgray',
    fontWeight: 'bold',
    fontSize: 10

  },

  trackInfoTime: {
    color: "white",
    textAlign: 'center',
    fontSize: 12,
    width: 30,
    marginLeft: 8,
  },


  trackStyles: {
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginTop: 5,
    marginBottom: 5
  },


  ImgAndTitlesStyles: {
    flexDirection: "row",
    justifyContent: 'flex-start',
    flex: -1
  },

  AlbumAndTimeStyles: {
    flexDirection: "row",
    justifyContent: 'flex-end',
    flex: 10
  },

  TimingStyles: {
    flexDirection: "row",
  },

  titleArtistStyles: {
    width: '75%'
  },

  TopTracksStyles: {
    flex: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column'
  },

  TopTracksPage: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: "center",
    alignItems: "center",
  },

  TopTracksTitle:{
    display: 'flex',
    backgroundColor: Colors.background,
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  },

  TopTrackslogo: {
    height: 20,
    width: 20,
  },

  TitleMyTopTracks: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
  }


});
