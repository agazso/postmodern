import { connect } from 'react-redux';

import { AppState } from '../reducers/AppState';
import { StateProps, DispatchProps, FeedListEditor, FeedSection } from '../components/FeedListEditor';
import { Feed } from '../models/Feed';
import { getFollowedFeeds, getKnownFeeds, getContactFeeds } from '../selectors/selectors';
import { TypedNavigation } from '../helpers/navigation';
import { sortFeedsByName } from '../helpers/feedHelpers';
import { Debug } from '../Debug';

const addSection = (title: string, feeds: Feed[]): FeedSection[] => {
    if (feeds.length > 0) {
        return [{
            title: `${title} (${feeds.length})`,
            data: feeds,
        }];
    }
    return [];
};

const mapStateToProps = (state: AppState, ownProps: { navigation: TypedNavigation, showExplore: boolean }): StateProps => {
    const navParamFeeds = ownProps.navigation.getParam<'FeedListViewerContainer', 'feeds'>('feeds');
    const navParamShowExplore = ownProps.navigation.getParam<'FeedListViewerContainer', 'showExplore'>('showExplore');
    const ownFeeds = navParamFeeds
        ? []
        : state.ownFeeds
    ;
    const followedFeeds = sortFeedsByName(navParamFeeds
        ? navParamFeeds
        : getFollowedFeeds(state)
    );
    const knownFeeds = sortFeedsByName(navParamFeeds
        ? []
        : getKnownFeeds(state)
    );
    const contactFeeds = sortFeedsByName(navParamFeeds
        ? []
        : getContactFeeds(state)
    );

    Debug.log('FeedListViewerContainer.mapStateToProps', contactFeeds);

    const sections: FeedSection[] = ([] as FeedSection[]).concat(
        addSection('Your contacts', contactFeeds),
        addSection('Channels you follow', followedFeeds),
        addSection('Your channels', ownFeeds),
        addSection('Other channels', knownFeeds),
    );

    return {
        sections,
        navigation: ownProps.navigation,
        gatewayAddress: state.settings.swarmGatewayAddress,
        title: 'All channels',
        showExplore: navParamShowExplore,
    };
};

export const mapDispatchToProps = (dispatch: any, ownProps: { navigation: TypedNavigation }): DispatchProps => {
    return {
        openExplore: () => {
            ownProps.navigation.navigate('CategoriesContainer', {});
        },
        onPressFeed: (feed: Feed) => {
            ownProps.navigation.navigate('FeedFromList', {
                feedUrl: feed.feedUrl,
                name: feed.name,
            });
        },
    };
};

export const FeedListViewerContainer = connect(mapStateToProps, mapDispatchToProps)(FeedListEditor);
