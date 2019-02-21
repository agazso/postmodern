import * as React from 'react';
import { Post, PostReferences, Author } from '../models/Post';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, DefaultStyle } from '../styles';
import { View, ActivityIndicator, TouchableOpacity, TouchableWithoutFeedback, Dimensions, Platform, StyleSheet, Image, Text, Linking, Alert, Share } from 'react-native';
import { TouchableView } from './TouchableView';
import { DateUtils } from '../DateUtils';
import { Utils } from '../Utils';
import { ImageView } from './ImageView';
import { isSwarmLink } from '../swarm/Swarm';
import { ImageData } from '../models/ImageData';
// @ts-ignore
import Markdown from 'react-native-easy-markdown';
import { ErrorBoundary } from './ErrorBoundary';
import { Debug } from '../Debug';
import { ReactNativeModelHelper } from '../models/ReactNativeModelHelper';

const WindowWidth = Dimensions.get('window').width;
const modelHelper = new ReactNativeModelHelper();

export interface StateProps {
    showSquareImages: boolean;
    isSelected: boolean;
    post: Post;
    currentTimestamp: number;
    author: Author;
    togglePostSelection: (post: Post) => void;
    navigate: (view: string, {}) => void;
}

export interface DispatchProps {
    onDeletePost: (post: Post) => void;
    onSharePost: (post: Post) => void;
}

type CardProps = StateProps & DispatchProps;

export const Card = (props: CardProps) => {
    return (
        <View
            style={[styles.container, {
                margin: 0,
                padding: 0,
                paddingTop: 5,
                borderWidth: 0,
            }]}
            key={'card-' + props.post._id}
            testID={'YourFeed/Post' + props.post._id}
        >

            <CardTop
                post={props.post}
                currentTimestamp={props.currentTimestamp}
                author={props.author}
                navigate={props.navigate}
                onSharePost={props.onSharePost}
            />
            <TouchableOpacity
                activeOpacity={1}
                onLongPress={() => props.togglePostSelection(props.post)}
                onPress={() => openPost(props.post)}
                style = {{
                    backgroundColor: '#fff',
                    padding: 0,
                    paddingTop: 0,
                    marginTop: 0,
                }}
            >
                {props.post.images.map((image, index) => {
                    const [width, height] = calculateImageDimensions(image, WindowWidth, props.showSquareImages);
                    return (
                        <ImageView
                            testID={(image.uri || '') + index}
                            key={(image.uri || '') + index}
                            source={image}
                            style={{
                                width: width,
                                height: height,
                            }}
                        />
                    );
                })}
                { props.post.text === '' ||
                    <CardMarkdown key={props.post._id} text={props.post.text}/>
                }
                <ButtonList {...props}/>
            </TouchableOpacity>
        </View>
    );
};

export const MemoizedCard = React.memo(Card);

const ActionIcon = (props: { name: string}) => {
    const iconSize = 20;
    return <Icon name={props.name} size={iconSize} color={Colors.DARK_GRAY} />;
};

const isPostShareable = (post: Post, author: Author): boolean => {
    if (post.author == null ) {
        return false;
    }
    if (post.author.identity == null) {
        // RSS post
        return true;
    }
    if (author.identity == null) {
        return false;
    }
    if (post.author.identity.publicKey === author.identity.publicKey) {
        if (post.link != null) {
            return false;
        }
        return true;
    }
    return true;
};

const ShareButton = (props: {post: Post, onSharePost: (post: Post) => void, author: Author}) => {
    const isShareable = isPostShareable(props.post, props.author);
    const shareIconName = isShareable ? 'share-outline' : 'share';
    const onPress = isShareable ? () => props.onSharePost(props.post) : undefined;
    return (
        <TouchableView style={styles.share} onPress={onPress}>
        { props.post.isUploading === true
            ? <ActivityIndicator color={Colors.DARK_GRAY} />
            : <ActionIcon name={shareIconName}/>
        }
        </TouchableView>
    );
};

const ButtonList = (props: CardProps) => {
    const likeIconName = props.post.liked === true ? 'heart' : 'heart-outline';
    if (props.isSelected) {
        return (
            <View
                testID='CardButtonList'
                style={styles.itemImageContainer}>
                <TouchableView style={styles.like} onPress={() => props.post.liked = true}>
                    <ActionIcon name={likeIconName}/>
                </TouchableView>
                <TouchableView style={styles.comment} onPress={() => alert('go comment!')}>
                    <ActionIcon name='comment-multiple-outline'/>
                </TouchableView>
                <TouchableView style={styles.share} onPress={() => onDeleteConfirmation(props.post, props.onDeletePost)}>
                    <ActionIcon name='trash-can-outline'/>
                </TouchableView>
                <TouchableView style={styles.share}>
                    {/* <ActionIcon name='playlist-edit'/> */}
                </TouchableView>
                <ShareButton
                    post={props.post}
                    onSharePost={props.onSharePost}
                    author={props.author}
                />
            </View>
        );
    }
    return <View/>;
};

const CardTopIcon = (props: { post: Post }) => {
    if (props.post.author) {
        const imageUri = modelHelper.getAuthorImageUri(props.post.author);
        const imageSource = imageUri === ''
            ? require('../../images/user_circle.png')
            : { uri: imageUri };
        return (
            <Image source={imageSource} style={DefaultStyle.favicon} />
        );
    } else {
        return <View/>;
    }
};

const CardTopOriginalAuthorText = (props: {
    references: PostReferences | undefined,
    navigate: (view: string, {}) => void,
}) => {
    if (props.references == null || props.references.originalAuthor == null) {
        return null;
    } else {
        const feedUrl = props.references.originalAuthor.uri;
        const name = props.references.originalAuthor.name;
        return (
            <TouchableView
                style={{flexDirection: 'row'}}
                onPress={() => props.navigate('Feed', {
                    feedUrl,
                    name,
                })}
            >
                <Text style={styles.originalAuthor}> via {props.references.originalAuthor.name}</Text>
            </TouchableView>
            );
    }
};

const CardTop = (props: {
    post: Post,
    currentTimestamp: number,
    author: Author,
    navigate: (view: string, {}) => void,
    onSharePost: (post: Post) => void,
}) => {
    const printableTime = DateUtils.printableElapsedTime(props.post.createdAt, props.currentTimestamp) + ' ago';
    const authorName = props.post.author ? props.post.author.name : 'Space Cowboy';
    const url = props.post.link || '';
    const hostnameText = url === '' ? '' : ' -  ' + Utils.getHumanHostname(url);
    return (
        <TouchableOpacity
            testID={'CardTop'}
            onPress={() => props.navigate('Feed', {
                feedUrl: props.post.author && props.post.author.uri,
                name: authorName,
            })}
            style={styles.infoContainer}
        >
            <CardTopIcon post={props.post}/>
            <View style={styles.usernameContainer}>
                <View style={{flexDirection: 'row'}}>
                    <Text style={styles.username} numberOfLines={1}>{authorName}</Text>
                    <CardTopOriginalAuthorText
                        references={props.post.references}
                        navigate={props.navigate}
                    />
                </View>
                <Text style={styles.location}>{printableTime}{hostnameText}</Text>
            </View>
        </TouchableOpacity>
    );
};

const CardMarkdown = (props: { text: string }) => (
    <ErrorBoundary>
        <Markdown
            style={styles.markdownStyle}
            renderLink={(href: string, title: string, children: React.ReactNode) => {
                return (
                    <TouchableWithoutFeedback
                        key={'linkWrapper_' + href + Date.now()}
                        onPress={() => Linking.openURL(href).catch(() => { /* nothing */ })}
                    >
                        <Text key={'linkWrapper_' + href + Date.now()} style={{textDecorationLine: 'underline'}}>
                            {children}
                        </Text>
                    </TouchableWithoutFeedback>
                );
            }}
        >{props.text}</Markdown>
    </ErrorBoundary>
);

const openPost = async (post: Post) => {
    if (post.link) {
        if (!isSwarmLink(post.link)) {
            await Linking.openURL(post.link);
        }
    }
};

const onDeleteConfirmation = (post: Post, onDeletePost: (post: Post) => void) => {
    Alert.alert(
        'Are you sure you want to delete?',
        undefined,
        [
            { text: 'Cancel', onPress: () => Debug.log('Cancel Pressed'), style: 'cancel' },
            { text: 'OK', onPress: async () => await onDeletePost(post) },
        ],
        { cancelable: false }
    );
};

const calculateImageDimensions = (image: ImageData, maxWidth: number, showSquareImages: boolean): number[] => {
    if (showSquareImages) {
        return [maxWidth, maxWidth];
    }
    return modelHelper.calculateImageDimensions(image, maxWidth);
};

const HeaderOffset = 20;
const TranslucentBarHeight = Platform.OS === 'ios' ? HeaderOffset : 0;
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
        padding: 0,
        paddingTop: 0,
        paddingBottom: 0,
        marginBottom: 12,
        marginTop: 0,
    },
    infoContainer : {
        flexDirection: 'row',
        height: 38,
        alignSelf: 'stretch',
        marginBottom: 5,
        marginLeft: 5,
    },
    usernameContainer: {
        justifyContent: 'center',
        flexDirection: 'column',
        flex: 1,
    },
    location: {
        fontSize: 10,
        color: 'gray',
    },
    itemImageContainer: {
        flexDirection: 'row',
        height: 40,
        alignSelf: 'stretch',
        marginLeft: 5,
        marginTop: 5,
        justifyContent: 'space-evenly',
    },
    like: {
        marginHorizontal: 20,
        marginVertical: 5,
        marginLeft: 5,
    },
    comment: {
        marginHorizontal: 20,
        marginVertical: 5,
    },
    share: {
        marginHorizontal: 20,
        marginVertical: 5,
    },
    edit: {
        marginHorizontal: 20,
        marginVertical: 5,
    },
    likeCount: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 2,
    },
    commentItem: {
        fontSize: 10 ,
        color: 'rgba(0, 0, 0, 0.5)',
        marginTop: 5,
    },
    captionContainer: {
        marginTop: 2 ,
        flexDirection: 'row',
        alignItems: 'center',
    },
    captionText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 8,
        color: 'rgba(0, 0, 0, 0.5)',
        marginTop: 5,
    },
    seperator: {
        height: 1,
        alignSelf: 'stretch',
        marginHorizontal: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    hashTag: {
        fontStyle: 'italic',
        color: 'blue',
    },
    footer: {
        marginVertical: 5,
        alignSelf: 'stretch',
        marginHorizontal: 20,
        flexDirection: 'column',
    },
    username: {
        fontWeight: 'bold',
        color: Colors.DARK_GRAY,
    },
    originalAuthor: {
        fontWeight: 'normal',
        color: Colors.GRAY,
    },
    text: {
        fontSize: 12,
        color: Colors.DARK_GRAY,
    },
    likedContainer: {
        backgroundColor: 'transparent',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    markdownStyle: {
        marginVertical: 10,
        marginHorizontal: 10,
    },
    translucentBar: {
        height: TranslucentBarHeight,
        width: '100%',
        position: 'absolute',
        backgroundColor: '#e6e6e6ff',
        opacity: 0.5,
        top: 0,
        left: 0,
    },
    refreshControl: {
    },
});
