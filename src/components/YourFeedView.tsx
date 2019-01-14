import * as React from 'react';
import { RefreshableFeed } from './RefreshableFeed';
import { Feed } from '../models/Feed';
import { Post } from '../models/Post';
import { Settings } from '../models/Settings';
import { FeedHeader } from './FeedHeader';

export interface DispatchProps {
    onRefreshPosts: (feeds: Feed[]) => void;
    onSavePost: (post: Post) => void;
}

export interface StateProps {
    navigation: any;
    posts: Post[];
    feeds: Feed[];
    settings: Settings;
}

type Props = StateProps & DispatchProps;

export const YourFeedView = (props: Props) => {
    return (
        <RefreshableFeed {...props}>
            {{
                listHeader: <FeedHeader
                                navigation={props.navigation}
                                onSavePost={props.onSavePost}
                            />,
            }}
        </RefreshableFeed>
    );
};

export const MemoizedYourFeedView = React.memo(YourFeedView);