import * as React from 'react';
import {
    View,
    KeyboardAvoidingView,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import { NavigationHeader } from './NavigationHeader';
import { SimpleTextInput } from './SimpleTextInput';
import { Colors, ComponentColors } from '../styles';
import { TypedNavigation } from '../helpers/navigation';
import { RowItem } from '../ui/buttons/RowButton';
import * as Swarm from '../swarm/Swarm';
import { FragmentSafeAreaViewWithoutTabBar } from '../ui/misc/FragmentSafeAreaView';

export interface StateProps {
    swarmGatewayAddress: string;
    navigation: TypedNavigation;
}

export interface DispatchProps {
    onChangeSwarmGatewayAddress: (address: string) => void;
}

export type Props = StateProps & DispatchProps;

export interface State {
}

export const SwarmSettings = (props: Props) => (
    <FragmentSafeAreaViewWithoutTabBar>
        <NavigationHeader
            navigation={props.navigation}
            title={'Swarm settings'}
        />
        <ScrollView keyboardShouldPersistTaps={'handled'}>
            <KeyboardAvoidingView style={styles.container}>
                <Text style={styles.tooltip}>Swarm gateway address</Text>
                <SimpleTextInput
                    style={styles.row}
                    defaultValue={props.swarmGatewayAddress}
                    placeholder={'https://swarm-gateways.net'}
                    autoCapitalize='none'
                    autoFocus={true}
                    autoCorrect={false}
                    selectTextOnFocus={true}
                    returnKeyType={'done'}
                    onSubmitEditing={props.onChangeSwarmGatewayAddress}
                    onEndEditing={() => {}}
                />

                <View style={{paddingBottom: 20}} />

                <RowItem
                    icon={
                        <MaterialCommunityIcon name='server-network' />
                    }
                    title={`Use default: ${Swarm.defaultGateway}`}
                    onPress={() => props.onChangeSwarmGatewayAddress(Swarm.defaultGateway)}
                    buttonStyle='none'
                />
                <RowItem
                    icon={
                        <MaterialCommunityIcon name='server-network' />
                    }
                    title={`Use debug server: http://localhost:8500`}
                    onPress={() => props.onChangeSwarmGatewayAddress('http://localhost:8500')}
                    buttonStyle='none'
                />

            </KeyboardAvoidingView>
        </ScrollView>
    </FragmentSafeAreaViewWithoutTabBar>
);

const styles = StyleSheet.create({
    mainContainer: {
        height: '100%',
        backgroundColor: ComponentColors.HEADER_COLOR,
        flex: 1,
    },
    container: {
        height: '100%',
        backgroundColor: ComponentColors.BACKGROUND_COLOR,
    },
    row: {
        width: '100%',
        backgroundColor: 'white',
        borderBottomColor: 'lightgray',
        borderBottomWidth: 1,
        borderTopColor: 'lightgray',
        borderTopWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 8,
        color: Colors.DARK_GRAY,
        fontSize: 16,
    },
    tooltip: {
        paddingHorizontal: 8,
        paddingTop: 8,
        paddingBottom: 2,
        color: Colors.GRAY,
    },
});
