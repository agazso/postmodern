import * as React from 'react';
import { StyleSheet, KeyboardAvoidingView, View, TextInput, Dimensions, ScrollView } from 'react-native';
import { FragmentSafeAreaViewWithoutTabBar } from '../../misc/FragmentSafeAreaView';
import { NavigationHeader } from '../../../components/NavigationHeader';
import { FloatingButton } from '../../misc/FloatingButton';
import { TypedNavigation } from '../../../helpers/navigation';
import Icon, { CloseIcon } from '../../../CustomIcon';
import { TouchableView } from '../../../components/TouchableView';
import { RegularText, BoldText, MediumText } from '../../misc/text';
import { Colors, ComponentColors, DefaultNavigationBarHeight } from '../../../styles';

interface Contact {
    name: string;
    pages: string[];
}

const testContacts: Contact[] = [
    {
        name: 'Attila',
        pages: ['Felfele', 'Komondor'],
    },
    {
        name: 'DaniF',
        pages: ['Komondor'],
    },
    {
        name: 'XANTS',
        pages: ['Komondor', 'Felfele', 'XANTS'],
    },
    {
        name: 'Pierluigi',
        pages: ['Italian mafia', 'Komondor'],
    },
    {
        name: 'Simo',
        pages: ['Italian mafia'],
    },
];

interface DispatchProps {
}

interface StateProps {
    navigation: TypedNavigation;
}

const Button = (props: {label: string, onPress: () => void}) => (
    <TouchableView style={styles.buttonContainer} onPress={props.onPress}>
        <BoldText style={styles.buttonLabel}>{props.label}</BoldText>
    </TouchableView>
);

const InviteActionView = (props: {text: string, buttonLabel: string, onPress: () => void}) => (
    <View style={[styles.row, styles.inviteActionContainer]}>
        <BoldText style={styles.inviteActionLabel}>{props.text}</BoldText>
        <Button label={props.buttonLabel} onPress={props.onPress} />
    </View>
);

const makeProfilePagesLabel = (pages: string[]): string =>
    'From ' + (
        pages.length < 2
        ? pages.join('')
        : pages.length === 2
            ? `${pages[0]} & ${pages[1]}`
            : `${pages[0]} & ${pages.length - 1} others pages`
    )
;

const Contact = (props: {contact: Contact}) => (
    <View style={[styles.row, styles.contactContainer]}>
        <View style={styles.contactProfilePicture}></View>
        <View style={styles.contactLabelContainer}>
            <BoldText style={styles.contactProfileNameLabel}>{props.contact.name}</BoldText>
            <RegularText style={styles.contactProfilePagesLabel}>{makeProfilePagesLabel(props.contact.pages)}</RegularText>
        </View>
        <Button label='INVITE' onPress={() => {}} />
    </View>
);

export const InviteToPageScreen = (props: DispatchProps & StateProps) => (
    <FragmentSafeAreaViewWithoutTabBar>
        <NavigationHeader
            title='INVITE'
            navigation={props.navigation}
            leftButton={{
                label: <Icon size={48} name='arrow1_left2' />,
                onPress: () => props.navigation.goBack(null),
            }}
        />
        <KeyboardAvoidingView
            style={styles.container}
            keyboardVerticalOffset={DefaultNavigationBarHeight}
            behavior='height'
        >
            <ScrollView style={styles.scrollContainer}>
                <MediumText style={styles.inviteTitleLabel}>Invite people to contribute to your page</MediumText>
                <RegularText style={styles.inviteSubtitleLabel}>They will be able to view and post content.</RegularText>
                <InviteActionView
                    text='Invite someone remotely'
                    buttonLabel='SEND A LINK'
                    onPress={() => {}}
                />
                <InviteActionView
                    text='Face to face?'
                    buttonLabel='SHOW A QR CODE'
                    onPress={() => {}}
                />
                <View style={styles.separator}></View>
                <RegularText style={styles.inviteExistingContactsLabel}>Invite existing contacts (from other pages)</RegularText>
                { testContacts.map((contact, i) => <Contact contact={contact} key={i} />)}
            </ScrollView>
            <FloatingButton
                iconName='arrow2_right3'
                iconSize={48}
                onPress={() => props.navigation.navigate('CreatePageDone', {})}
            />
        </KeyboardAvoidingView>
    </FragmentSafeAreaViewWithoutTabBar>
);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        flex: 1,
        backgroundColor: ComponentColors.BACKGROUND_COLOR,
    },
    scrollContainer: {
        flex: 1,
        shadowColor: Colors.BLACK,
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 0,
            height: 0.2,
        },
        shadowRadius: 0.5,
    },
    inviteTitleLabel: {
        paddingTop: 18,
        fontSize: 18,
        alignSelf: 'center',
    },
    inviteSubtitleLabel: {
        paddingTop: 5,
        paddingBottom: 18,
        fontSize: 14,
        alignSelf: 'center',
    },
    row: {
        backgroundColor: Colors.WHITE,
        height: 78,
        borderBottomColor: Colors.LIGHTER_GRAY,
        borderBottomWidth: 1,
    },
    inviteActionContainer: {
        paddingLeft: 18,
        paddingRight: 9,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    inviteActionLabel: {
        fontSize: 14,
    },
    buttonContainer: {
        backgroundColor: Colors.BLACK,
        height: 25,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonLabel: {
        paddingHorizontal: 10,
        color: Colors.WHITE,
        fontSize: 12,
    },
    separator: {
        shadowColor: Colors.BLACK,
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 0,
            height: 0.2,
        },
        shadowRadius: 0.5,
    },
    inviteExistingContactsLabel: {
        paddingTop: 30,
        paddingLeft: 9,
        paddingBottom: 18,
        fontSize: 14,
    },
    contactContainer: {
        paddingHorizontal: 9,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    contactProfilePicture: {
        width: 59,
        height: 59,
        backgroundColor: '#FF9FED',
        borderRadius: 29,
    },
    contactLabelContainer: {
        flex: 1,
        flexDirection: 'column',
        paddingLeft: 10,
    },
    contactProfileNameLabel: {
        fontSize: 14,
    },
    contactProfilePagesLabel: {
        fontSize: 12,
        color: Colors.LIGHTISH_GRAY,
    },
});
