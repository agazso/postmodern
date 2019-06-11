import { ImageData } from '@felfele/felfele-core';
import { Platform, Alert } from 'react-native';
import { Debug } from '../../felfele-core/src/helpers/Debug';
import ImagePicker from 'react-native-image-picker';

// tslint:disable-next-line:no-var-requires
const RNFS = require('react-native-fs');
// tslint:disable-next-line:no-var-requires
const RNGRP = require('react-native-get-real-path');

interface Response {
    customButton: string;
    didCancel: boolean;
    error: string;
    data: string;
    uri: string;
    origURL?: string;
    isVertical: boolean;
    width: number;
    height: number;
    fileSize: number;
    type?: string;
    fileName?: string;
    path?: string;
    latitude?: number;
    longitude?: number;
    timestamp?: string;
}

interface CustomButtonOptions {
    name?: string;
    title?: string;
}

interface Options {
    title?: string;
    cancelButtonTitle?: string;
    takePhotoButtonTitle?: string;
    chooseFromLibraryButtonTitle?: string;
    customButtons?: Array<CustomButtonOptions>;
    cameraType?: 'front' | 'back';
    mediaType?: 'photo' | 'video' | 'mixed';
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    videoQuality?: 'low' | 'medium' | 'high';
    durationLimit?: number;
    rotation?: number;
    allowsEditing?: boolean;
    noData?: boolean;
    storageOptions?: StorageOptions;
}

interface StorageOptions {
    skipBackup?: boolean;
    path?: string;
    cameraRoll?: boolean;
    waitUntilSaved?: boolean;
}

const defaultImagePickerOtions: Options = {
    allowsEditing: false,
    noData: true,
    mediaType: 'photo',
    rotation: 360,
    storageOptions: {
        cameraRoll: true,
        waitUntilSaved: true,
    },
};

const removePathPrefix = async (response: Response): Promise<string> => {
    if (Platform.OS === 'ios') {
        const documentPath = 'file://' + RNFS.DocumentDirectoryPath + '/';
        const path = response.uri;
        if (path.startsWith(documentPath)) {
            return path.substring(documentPath.length);
        }
    } else if (Platform.OS === 'android') {
        const filePath = await RNGRP.getRealPathFromURI(response.uri);
        return 'file://' + filePath;
    }
    return response.uri;
};

export class AsyncImagePicker {
    public static async launchImageLibrary(): Promise<ImageData | null> {
        return this.launchPicker(this.launchImageLibraryWithPromise);
    }

    public static async showImagePicker(): Promise<ImageData | null> {
        return this.launchPicker(this.showImagePickerWithPromise);
    }

    public static async launchCamera(): Promise<ImageData | null> {
        return this.launchPicker(this.launchCameraWithPromise);
    }

    private static async launchPicker(pickerFunction: (options: Options) => Promise<Response>): Promise<ImageData | null> {
        const response = await pickerFunction(defaultImagePickerOtions);
        if (response.error) {
            Debug.log('AsyncImagePicker.launchPicker', response.error);
            if (Platform.OS === 'ios') {
                Alert.alert('Allow permissions',
                    '\nPlease go to Settings app, find Felfele and enable access to photos',
                );
            }
            return null;
        }
        if (response.didCancel) {
            return null;
        }
        const uri = await removePathPrefix(response);
        Debug.log('launchPicker: ', uri, response.uri, response.fileName);
        const imageData: ImageData = {
            uri: undefined,
            width: response.width,
            height: response.height,
            localPath: uri,
        };
        return imageData;

    }

    private static launchImageLibraryWithPromise(options: Options): Promise<Response> {
        return new Promise((resolve, reject) => {
            ImagePicker.launchImageLibrary(options, resolve);
        });
    }

    private static launchCameraWithPromise(options: Options): Promise<Response> {
        return new Promise((resolve, reject) => {
            ImagePicker.launchCamera(options, resolve);
        });
    }

    private static showImagePickerWithPromise(options: Options): Promise<Response> {
        return new Promise((resolve, reject) => {
            ImagePicker.showImagePicker(options, resolve);
        });
    }
}
