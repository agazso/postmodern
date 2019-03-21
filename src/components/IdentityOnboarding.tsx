import * as React from 'react';
import { SimpleTextInput } from './SimpleTextInput';
import {
    KeyboardAvoidingView,
    StyleSheet,
    View,
    Image,
    Dimensions,
} from 'react-native';
import { Author } from '../models/Author';
import { ImageData } from '../models/ImageData';
import { AsyncImagePicker } from '../AsyncImagePicker';
import { Colors } from '../styles';
import { DispatchProps } from './IdentitySettings';
import { TouchableView } from './TouchableView';

// tslint:disable-next-line:no-var-requires
const defaultUserImage = require('../../images/user_circle-white.png');
import { ReactNativeModelHelper } from '../models/ReactNativeModelHelper';

export { DispatchProps };
export interface StateProps {
    author: Author;
    gatewayAddress: string;
}

export const IdentityOnboarding = (props: DispatchProps & StateProps) => {
    const modelHelper = new ReactNativeModelHelper(props.gatewayAddress);
    const authorImageUri = modelHelper.getImageUri(props.author.image);
    return (
        <KeyboardAvoidingView style={styles.mainContainer}>
            <View style={styles.imagePicker}>
                <TouchableView
                    onPress={async () => {
                        await openImagePicker(props.onUpdatePicture);
                    }}
                >
                    <Image
                        source={authorImageUri === ''
                        ? defaultUserImage
                        : { uri: authorImageUri }
                        }
                        style={styles.faviconPicker}
                    />
                </TouchableView>
            </View>
            <View style={styles.textInputContainer}>
                <SimpleTextInput
                    style={styles.textInput}
                    defaultValue={props.author.name}
                    placeholder={'Enter your name'}
                    placeholderTextColor={Colors.BRAND_PURPLE_LIGHT}
                    autoCapitalize='none'
                    autoFocus={false}
                    autoCorrect={false}
                    selectTextOnFocus={true}
                    returnKeyType={'done'}
                    onSubmitEditing={props.onUpdateAuthor}
                    onChangeText={props.onUpdateAuthor}
                />
            </View>
        </KeyboardAvoidingView>
    );
};

const openImagePicker = async (onUpdatePicture: (image: ImageData) => void) => {
    const imageData = await AsyncImagePicker.launchImageLibrary();
    if (imageData != null) {
        onUpdatePicture(imageData);
    }
};

const WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
    mainContainer: {
        width: WIDTH,
        height: WIDTH - 30,
    },
    textInput: {
        paddingHorizontal: 8,
        paddingVertical: 8,
        color: Colors.WHITE,
        fontSize: 20,
        alignItems: 'center',
        textAlign: 'center',
    },
    textInputContainer: {
        marginHorizontal: 40,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'darkgrey',
        borderRadius: 20,
        backgroundColor: Colors.BRAND_PURPLE,
    },
    tooltip: {
        paddingHorizontal: 8,
        paddingTop: 8,
        paddingBottom: 2,
        color: 'white',
        textAlign: 'center',
    },
    imagePicker: {
        flexDirection: 'row',
        paddingHorizontal: 8,
        justifyContent: 'center',
    },
    faviconPicker: {
        borderRadius : 0.25 * WIDTH,
        width: 0.5 * WIDTH,
        height: 0.5 * WIDTH,
        marginVertical: 10,
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        margin: 0,
    },
});
