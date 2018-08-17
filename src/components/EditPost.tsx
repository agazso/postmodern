import * as React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Keyboard,
    Button,
    Platform,
    ActivityIndicator,
    Alert,
    AlertIOS,
} from 'react-native';
import { AsyncImagePicker } from '../AsyncImagePicker';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { ImagePreviewGrid } from './ImagePreviewGrid';
import { ImageData, Post } from '../models/Post';
import { LocalPostManager } from '../LocalPostManager';
import { Debug } from '../Debug';
import { SimpleTextInput } from './SimpleTextInput';

interface PostScreenNavigationActions {
    cancel?: () => Promise<void>;
    post?: () => Promise<void>;
}

const navigationActions: PostScreenNavigationActions = {
    cancel: undefined,
    post: undefined,
};

export interface StateProps {
    navigation: any;
}

export interface DispatchProps {
    onPost: (post: Post) => void;
}

type Props = StateProps & DispatchProps;

interface State {
    text: string;
    uploadedImages: ImageData[];
    isKeyboardVisible: boolean;
    isLoading: boolean;
    paddingBottom: number;
    keyboardHeight: number;
    post?: Post;
}

export class EditPost extends React.Component<Props, State> {
    public static navigationOptions = {
        header: undefined,
        title: 'Update status',
        headerLeft: <Button title='Cancel' onPress={() => navigationActions.cancel!()} />,
        headerRight: <Button title='Post' onPress={() => navigationActions.post!()} />,
    };

    public state: State;

    private keyboardDidShowListener;
    private keyboardWillShowListener;
    private keyboardDidHideListener;

    constructor(props) {
        super(props);
        this.state = {
            text: '',
            uploadedImages: [],
            isKeyboardVisible: false,
            isLoading: true,
            paddingBottom: 0,
            keyboardHeight: 0,
            post: undefined,
        };
        navigationActions.cancel = () => this.onCancelConfirmation();
        navigationActions.post = () => this.onPressSubmit();

        this.getPostForEditing().then(post => {
            if (post) {
                console.log('PostScreen.constructor: ', post);
                this.setState({
                    text: post.text,
                    uploadedImages: post.images,
                    isLoading: false,
                    post: post,
                });
            } else {
                this.setState({
                    isLoading: false,
                    post: {
                        images: [],
                        text: '',
                        createdAt: Date.now(),
                    },
                });
            }
        });
    }

    public onKeyboardDidShow(e) {
        console.log('onKeyboardDidShow', this.state.keyboardHeight);

        if (Platform.OS === 'android') {
            this.onKeyboardWillShow(e);
        }

        this.setState({
            isKeyboardVisible: true,
        });
    }

    public onKeyboardWillShow(e) {
        const extraKeyboardHeight = 15;
        const baseKeyboardHeight = e.endCoordinates ? e.endCoordinates.height : e.end.height;
        this.setState({
            keyboardHeight: baseKeyboardHeight + extraKeyboardHeight,
        });

        console.log('onKeyboardWillShow', this.state.keyboardHeight);
    }

    public onKeyboardDidHide() {
        console.log('onKeyboardDidHide');
        this.setState({
            isKeyboardVisible: false,
            keyboardHeight: 0,
        });
    }

    public componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => this.onKeyboardDidShow(e));
        this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', (e) => this.onKeyboardWillShow(e));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => this.onKeyboardDidHide());
    }

    public unregisterListeners() {
        if (this.keyboardDidShowListener) {
            this.keyboardDidShowListener.remove();
            this.keyboardDidShowListener = null;
        }
        if (this.keyboardWillShowListener) {
            this.keyboardWillShowListener.remove();
            this.keyboardWillShowListener = null;
        }
        if (this.keyboardDidHideListener) {
            this.keyboardDidHideListener.remove();
            this.keyboardDidHideListener = null;
        }

    }

    public componentDidlUnmount() {
        this.unregisterListeners();
    }

    public render() {
        if (this.state.isLoading) {
            return this.renderActivityIndicator();
        }

        console.log('EditPost.render: ', this, this.state);

        return (
            <View
                style={{flexDirection: 'column', paddingBottom: this.state.keyboardHeight, flex: 1, height: '100%', backgroundColor: 'white'}}
            >
                    <View style={{flex: 14, flexDirection: 'column'}}>
                        <SimpleTextInput
                            style={{
                                marginTop: 0,
                                flex: 3,
                                fontSize: 16,
                                padding: 10,
                                paddingVertical: 10,
                                textAlignVertical: 'top',
                            }}
                            multiline={true}
                            numberOfLines={4}
                            onSubmitEditing={() => {this.hideKeyboard(); }}
                            onChangeText={(text) => this.setState({text})}
                            defaultValue={this.state.text}
                            placeholder="What's your story?"
                            placeholderTextColor='gray'
                            underlineColorAndroid='transparent'
                            autoFocus={true}
                        />
                        <ImagePreviewGrid
                            columns={4}
                            images={this.state.uploadedImages}
                            onRemoveImage={this.onRemoveImage}
                            height={100}
                        />
                    </View>
                    <View style={{
                        flexDirection: 'row',
                        borderTopWidth: 1,
                        borderTopColor: 'lightgray',
                        padding: 5,
                        margin: 0,
                        height: 30,
                    }}>
                        {this.renderActionButton(this.openImagePicker, 'Photos/videos', 'md-photos', '#808080', true)}
                    </View>
            </View>
        );
    }

    private onRemoveImage = (removedImage: ImageData) => {
        const uploadedImages = this.state.uploadedImages.filter(image => image != null && image.uri !== removedImage.uri);
        this.setState({
            uploadedImages,
        });
    }

    private async getPostForEditing(): Promise<Post | null> {
        console.log(this.props.navigation);
        if (this.props.navigation.state.params != null && this.props.navigation.state.params.post != null) {
            return this.props.navigation.state.params.post;
        }
        return await LocalPostManager.loadDraft();
    }

    private onCancel() {
        this.hideKeyboard();
        this.unregisterListeners();
        this.props.navigation.goBack();
    }

    private hideKeyboard() {
        if (this.state.isKeyboardVisible) {
            Keyboard.dismiss();
            this.setState({
                isKeyboardVisible: false,
            });
        }
    }

    private showCancelConfirmation() {
        const options: any[] = [
            { text: 'Save', onPress: async () => await this.onSave() },
            { text: 'Discard', onPress: async () => await this.onDiscard() },
            { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        ];

        if (Platform.OS === 'ios') {
            AlertIOS.alert(
                'Save this post as a draft?',
                undefined,
                options,
            );
        }
        else {
            Alert.alert('Save this post as a draft?',
                undefined,
                options,
                { cancelable: true },
            );
        }
    }

    private async onDiscard() {
        await LocalPostManager.deleteDraft();
        this.onCancel();
    }

    private async onSave() {
        this.setState({
           isLoading: true,
        });

        console.log(this.state.text, this.state.uploadedImages.length);

        const post: Post = {
            images: this.state.uploadedImages,
            text: this.state.text,
            createdAt: Date.now(),
        };

        try {
            await LocalPostManager.saveDraft(post);
            Debug.log('Draft saved', post._id);
        } catch (e) {
            Alert.alert(
                'Error',
                'Saving draft failed, try again later!',
                [
                    {text: 'OK', onPress: () => console.log('OK pressed')},
                ],
            );
        }

        this.onCancel();
    }

    private async onCancelConfirmation() {
        console.log('onCancelConfirmation', this.state.isKeyboardVisible);
        this.hideKeyboard();
        await new Promise(resolve => setTimeout(resolve, 0));
        console.log('Cancel');
        if (this.state.text !== '' || this.state.uploadedImages.length > 0) {
            this.showCancelConfirmation();
        } else {
            this.onCancel();
        }
    }

    private openImagePicker = async () => {
        const imageData = await AsyncImagePicker.launchImageLibrary();
        if (imageData != null) {
            this.setState({
                uploadedImages: this.state.uploadedImages.concat([imageData]),
            });
        }
    }

    private async onPressSubmit() {
        if (this.state.isLoading) {
            return;
        }

        await this.sendUpdate();
        this.onCancel();
    }

    private async sendUpdate() {
        this.setState({
           isLoading: true,
        });

        console.log(this.state.text, this.state.uploadedImages.length, this.state.post);

        const post = this.state.post;
        if (post != null) {
            post.images = this.state.uploadedImages;
            post.text = this.state.text;
            post.updatedAt = Date.now();

            this.props.onPost(post);
        }
    }

    private renderActivityIndicator() {
        return (
            <View
                style={{
                    flexDirection: 'column',
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    width: '100%',
                }}
            >
                <ActivityIndicator style={{width: '100%', height: 120, flex: 5}} />
            </View>
        );
    }

    private renderActionButton(onPress, text, iconName, color, showText) {
        const iconSize = showText ? 20 : 30;
        const justifyContent = showText ? 'center' : 'space-around';
        return (
            <TouchableOpacity onPress={onPress} style={{margin: 0, padding: 0, flex: 1, justifyContent: justifyContent}}>
                <View style={{flex: 1, flexDirection: 'row', margin: 0, padding: 0, alignItems: 'center', justifyContent: justifyContent}}>
                    <View style={{flex: 1, justifyContent: 'center'}}><Ionicons name={iconName} size={iconSize} color={color} /></View>
                    { showText &&
                        <Text style={{fontSize: 14, flex: 10}}>{text}</Text>
                    }
                </View>
            </TouchableOpacity>
        );
    }
}
