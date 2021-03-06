import { keccak256 } from 'js-sha3';
import crypto from 'crypto';

import { Version, BuildNumber } from '../Version';
import { apiTests } from '../social/apiTest';
import { syncTests } from '../social/syncTest';
import * as Swarm from '../swarm/Swarm';
import { stringToByteArray } from '../helpers/conversion';
import { Debug } from '../Debug';
import { parseArguments, addOption } from './cliParser';
import { feedCommandDefinition } from './feedCommands';
import { output, setOutput, jsonPrettyPrint } from './cliHelpers';
import { swarmConfig } from './swarmConfig';
import { RSSFeedManager } from '../RSSPostManager';
import * as urlUtils from '../helpers/urlUtils';
import { fetchOpenGraphData } from '../helpers/openGraph';
import { fetchHtmlMetaData } from '../helpers/htmlMetaData';
import { protocolTestCommandDefinition as protocolCommandDefinition } from './protocolCommands';
import { swarmHelperTests } from './swarmHelperTest';
import { privateChannelProtocolTests } from '../protocols/privateChannelProtocolTest';
import { benchmarkCommandDefinition } from './benchmarkCommands';

// tslint:disable-next-line:no-var-requires
const fetch = require('node-fetch');
// tslint:disable-next-line:no-var-requires
const FormData = require('form-data');

declare var process: {
    argv: string[];
    env: any;
};
declare var global: any;

global.__DEV__ = true;
global.fetch = fetch;
global.FormData = FormData;

Debug.setDebugMode(false);
Debug.showTimestamp = true;

const definitions =
    addOption('-q, --quiet', 'quiet mode', () => setOutput(() => {}))
    .
    addOption('-v, --verbose', 'verbose mode', () => Debug.setDebugMode(true))
    .
    addOption('-n, --no-colors', 'no colors in output', () => Debug.useColors = false)
    .
    addCommand('version', 'Print app version', () => output(Version))
    .
    addCommand('buildNumber', 'Print app build number', () => output(BuildNumber))
    .
    addCommand('test [name]', 'Run integration tests', async (testName) => {
            const allTests: any = {
                ...apiTests,
                ...syncTests,
                ...swarmHelperTests,
                ...privateChannelProtocolTests,
            };
            if (process.env.SWARM_GATEWAY != null) {
                output('Running with SWARM at', process.env.SWARM_GATEWAY);
            }
            if (testName == null) {
                for (const test of Object.keys(allTests)) {
                    output('Running test:', test);
                    await allTests[test]();
                    if (Debug.isDebugMode) {
                        output('Finished test:', test, '\n\n');
                    }
                }
                output(`${Object.keys(allTests).length} tests passed succesfully`);
            } else {
                const test = allTests[testName];
                output('\nRunning test: ', testName);
                await test();
            }
    })
    .addCommand('bugreport [endpoint]', 'Send bugreport to endpoint', async (endpoint) => {
        const response = await fetch(endpoint, {
            headers: {
                'Content-Type': 'text/plain',
            },
            method: 'POST',
            body: 'Bugreport',
        });
    })
    .addCommand('swarm', 'Swarm related commands',
        addOption('--gateway <address>', 'Swarm gateway address', (gatewayAddress) => swarmConfig.gatewayAddress = gatewayAddress)
        .
        addCommand('get <hash>', 'Download the data by hash', async (hash: string) => {
            const bzz = Swarm.makeBzzApi(swarmConfig.gatewayAddress);
            const data = await bzz.downloadString(hash, 0);
            output(data);
        })
        .
        addCommand('set <data>', 'Upload data', async (data: string) => {
            const bzz = Swarm.makeBzzApi(swarmConfig.gatewayAddress);
            const hash = await bzz.uploadString(data);
            output(hash);
        })
        .
        addCommand('sha3 <input>', 'Generate SHA3 hash of input', (input) => {
            const byteArrayData = stringToByteArray(input);
            const paddingByteArray: number[] = new Array<number>(4096 - byteArrayData.length);
            paddingByteArray.fill(0);
            const hash = keccak256.hex(byteArrayData.concat(paddingByteArray));
            output(hash);
        })
        .
        addCommand('id', 'Generate an identity', async () => {
            const generateRandom = (length: number) => Promise.resolve(crypto.randomBytes(length));
            const identity = await Swarm.generateSecureIdentity(generateRandom);
            output('Generated identity:', jsonPrettyPrint(identity));
        })
        .
        addCommand('uploadImage <path-to-image>', 'Upload an image to Swarm', async (localPath) => {
            const bzz = Swarm.makeBzzApi(swarmConfig.gatewayAddress);
            const files: Swarm.File[] = [
                {
                    name: 'image',
                    localPath,
                    mimeType: Swarm.imageMimeTypeFromFilenameExtension(localPath),
                },
            ];
            const hash = await bzz.uploadFiles(files);
            output(hash);
        })
        .
        addCommand('feed', 'Swarm Feed related commands', feedCommandDefinition)
    )
    .
    addCommand('rss <url>', 'Fetch RSS feed of url', async (url: string) => {
        const canonicalUrl = urlUtils.getCanonicalUrl(url);
        const feed = await RSSFeedManager.fetchFeedFromUrl(canonicalUrl);
        output('rss feed', {feed});
    })
    .
    addCommand('opengraph <url>', 'Fetch OpenGraph data of url', async (url: string) => {
        const canonicalUrl = urlUtils.getHttpsUrl(urlUtils.getCanonicalUrl(url));
        const data = await fetchOpenGraphData(canonicalUrl);
        output({data});
    })
    .
    addCommand('metadata <url>', 'Fetch metadata of url', async (url: string) => {
        const canonicalUrl = urlUtils.getHttpsUrl(urlUtils.getCanonicalUrl(url));
        const data = await fetchHtmlMetaData(canonicalUrl);
        output({data});
    })
    .
    addCommand('protocol', 'Test protocols', protocolCommandDefinition)
    .
    addCommand('benchmark', 'Measure the time a function takes', benchmarkCommandDefinition)
;

parseArguments(process.argv, definitions, output, output);
