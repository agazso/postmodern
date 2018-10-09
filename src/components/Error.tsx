import * as React from 'react';
import { Text, View, Button } from 'react-native';
import { DefaultStyle } from '../styles';

export default class Error extends React.Component<any, any> {
    public render() {
        return (
            <View style={DefaultStyle.container}>
                <Text>{this.props.text}</Text>
                <Button
                    onPress={() => this.props.navigation.goBack()}
                    title='Ok' />
            </View>
        );
    }
}
