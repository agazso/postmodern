import * as React from 'react';
import {
    View,
    StyleSheet,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AsyncImagePicker } from '../AsyncImagePicker';
import { Post } from '../models/Post';
import { TouchableView, TOUCHABLE_VIEW_DEFAULT_HIT_SLOP } from './TouchableView';
import { DefaultStyle, Colors } from '../styles';
import { RegularText } from '../ui/misc/text';
import { ImageData } from '../models/ImageData';
import { ReactNativeModelHelper } from '../models/ReactNativeModelHelper';
import { defaultImages } from '../defaultImages';
import { TypedNavigation } from '../helpers/navigation';
import { ImageDataView } from '../components/ImageDataView';
import { ContactFeed } from '../models/ContactFeed';
import { Feed } from '../models/Feed';

export interface StateProps {
    navigation: TypedNavigation;
    profileImage: ImageData;
    gatewayAddress: string;
    selectedFeeds: Feed[];
}

export interface DispatchProps {
    onSaveDraft: (draft: Post) => void;
}

export type Props = StateProps & DispatchProps;

export class FeedHeader extends React.PureComponent<Props> {
    public launchCamera = async () => {
        const imageData = await AsyncImagePicker.launchCamera();
        if (imageData == null) {
            return;
        }

        const post: Post = {
            images: [imageData],
            text: '',
            createdAt: Date.now(),
        };
        this.props.onSaveDraft(post);
        this.props.navigation.navigate('Post', {
            selectedFeeds: this.props.selectedFeeds,
        });
    }

    public render() {
        return (
            <View
                style={styles.container}
                testID='welcome'
            >
                <ProfileIcon profileImage={this.props.profileImage} gatewayAddress={this.props.gatewayAddress}/>
                <TouchableView
                    onPress={() =>
                        this.props.navigation.navigate('Post', {
                            selectedFeeds: this.props.selectedFeeds,
                        })
                    }
                    style={styles.headerTextContainer}
                    hitSlop={{
                        ...TOUCHABLE_VIEW_DEFAULT_HIT_SLOP,
                        left: 0,
                    }}
                    testID='FeedHeader/TouchableHeaderText'
                >
                    <RegularText style={styles.headerText}>What's up?</RegularText>
                </TouchableView>
                <TouchableView
                    onPress={this.launchCamera}
                    style={styles.cameraIconContainer}
                >
                    <Icon
                        name='photo-camera'
                        size={30}
                        color={Colors.BRAND_PURPLE}
                    />
                </TouchableView>
            </View>
        );
    }
}

const ProfileIcon = (props: { profileImage: ImageData, gatewayAddress: string }) => {
    const modelHelper = new ReactNativeModelHelper(props.gatewayAddress);
    return (
        <ImageDataView
            source={props.profileImage}
            modelHelper={modelHelper}
            defaultImage={defaultImages.defaultUser}
            style={[DefaultStyle.faviconLarge, { marginLeft: 10 }]}/>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        backgroundColor: Colors.WHITE,
        marginBottom: 10,
    },
    cameraIconContainer: {
        paddingHorizontal: 10,
        paddingRight: 15,
    },
    headerTextContainer: {
        flex: 1,
    },
    headerText: {
        color: Colors.PINKISH_GRAY,
        fontSize: 18,
        paddingLeft: 10,
    },
});
