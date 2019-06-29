import { syncTests } from '../../src/social/syncTest';
import { makeLocalSwarmStorage } from '../../src/swarm-social/localSwarmStorage';
import { PostCommandLogStorage } from '../../src/social/api';
import { Debug } from '../../src/Debug';

let localSwarmStorage: PostCommandLogStorage;
const source = 'storage';

beforeAll(() => Debug.setDebugMode(false));
beforeEach(() => localSwarmStorage = makeLocalSwarmStorage());

test('Test sharing posts to storage', async () =>
    syncTests.testSharePostsStorage(source, localSwarmStorage));

test('Test unsynced post command log with no unsynced commands ', async () =>
    syncTests.testUnsyncedPostCommandLogWithNoUnsyncedCommands(source, localSwarmStorage));

test('Test unsynced post command log with one unsynced command ', async () =>
    syncTests.testUnsyncedPostCommandLogWithOneUnsyncedCommand(source, localSwarmStorage));

test('Test latest posts after first sync', async () =>
    syncTests.testLatestPostsAfterFirstSync(source, localSwarmStorage));

test('Test merging the same commandlog with one uploaded', async () =>
    syncTests.testMergeTheSamePostWithOneUploadedStorage(source, localSwarmStorage));

test('Test sharing posts with remove on storage', async () =>
    syncTests.testSharePostsWithRemoveOnStorage(source, localSwarmStorage));

test('Test syncing posts with empty local storage', async () =>
    syncTests.testSyncLocalEmptyPostCommandLogWithStorage(source, localSwarmStorage));

test('Test syncing posts with local storage', async () =>
    syncTests.testSyncLocalPostCommandLogWithStorage(localSwarmStorage));

test('Test syncing posts concurrently with local storage', async () =>
    syncTests.testSyncConcurrentPostCommandLogWithStorage(localSwarmStorage));

test('Test resyncing posts with local storage', async () =>
    syncTests.testResyncLocalPostCommandLogWithStorage(localSwarmStorage));
