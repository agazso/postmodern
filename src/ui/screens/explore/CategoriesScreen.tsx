import * as React from 'react';
import { StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Colors } from '../../../styles';
import { RegularText } from '../../misc/text';
import { Category } from '../../../models/recommendation/NewsSource';
import { NavigationHeader } from '../../../components/NavigationHeader';
import { RowItem } from '../../misc/RowButton';

const CATEGORIES_LABEL = 'CATEGORIES';

export interface StateProps {
    categories: Category[];
    navigation: any;
}

export interface DispatchProps { }

export const CategoriesScreen = (props: StateProps & DispatchProps) => {
    const categories = props.categories.map((category: Category) => {
        return (
            <RowItem
                key={category.name}
                title={category.name}
                buttonStyle='navigate'
                onPress={() => {
                    props.navigation.navigate('SubCategoriesContainer', {
                        title: category.name,
                        subCategories: category.subCategories,
                    });
                }}
            />
        );
    });
    return (
        <SafeAreaView style={{ backgroundColor: Colors.WHITE, flex: 1 }}>
            <NavigationHeader title='Explore' onPressLeftButton={() => props.navigation.goBack()}/>
            <ScrollView style={{ backgroundColor: Colors.BACKGROUND_COLOR }}>
                <RegularText style={styles.label}>
                    {CATEGORIES_LABEL}
                </RegularText>
                {categories}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    label: {
        paddingHorizontal: 10,
        paddingTop: 20,
        paddingBottom: 7,
        color: Colors.GRAY,
    },
});