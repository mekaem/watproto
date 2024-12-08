import { AtpAgent } from '@atproto/api';
import * as TID from '@atcute/tid';
import { Buffer } from 'node:buffer';
import * as fs from 'node:fs';

const service = 'https://bsky.social'; // or your own PDS
const identifier = 'your handle';
const password = 'your password';

const agent = new AtpAgent({
	service,
});

// Create a self-referential quote post
async function createPost() {
	await agent.login({
		identifier,
		password,
	});

	if (!agent.session) throw new Error('Not logged in');

	const now = new Date();
	const rkey = TID.now();

	const uri = `at://${agent.session.did}/app.bsky.feed.post/${rkey}`;

	console.log('Creating post with rkey:', rkey);
	console.log('URI:', uri);

	const timestamp = now.toISOString().split('.')[0] +
		'.' +
		(Math.floor(Math.random() * 1000000)).toString().padStart(6, '0') +
		'Z';

	return await agent.com.atproto.repo.createRecord({
		repo: agent.session.handle,
		collection: 'app.bsky.feed.post',
		rkey,
		validate: false,
		record: {
			$type: 'app.bsky.feed.post',
			text: 'oh no you\'re posting recursion',
			createdAt: timestamp,
			embed: {
				$type: 'app.bsky.embed.record',
				record: {
					uri: uri,
					cid: 'andthisistogoevenfurtherbeyond',
				},
			},
		},
	});
}

// Create a self-referential quote post with an image embed
async function createImagePost() {
	await agent.login({
		identifier,
		password,
	});

	if (!agent.session) throw new Error('Not logged in');

	const now = new Date();
	const rkey = TID.now();

	const file = fs.readFileSync('recursion.png');
	const image = Buffer.from(file);
	const { data } = await agent.uploadBlob(image, { encoding: 'image/png' });

	const uri = `at://${agent.session.did}/app.bsky.feed.post/${rkey}`;

	console.log('Creating post with rkey:', rkey);
	console.log('URI:', uri);
	console.log(data);

	const timestamp = now.toISOString().split('.')[0] +
		'.' +
		(Math.floor(Math.random() * 1000000)).toString().padStart(6, '0') +
		'Z';

	return await agent.com.atproto.repo.createRecord({
		repo: agent.session.did,
		collection: 'app.bsky.feed.post',
		rkey,
		record: {
			$type: 'app.bsky.feed.post',
			text: '',
			createdAt: timestamp,
			embed: {
				$type: 'app.bsky.embed.recordWithMedia',
				media: {
					$type: 'app.bsky.embed.images',
					images: [{
						alt: 'alt text',
						image: data.blob,
					}],
				},
				record: {
					$type: 'app.bsky.embed.record',
					text: '',
					record: {
						uri: uri,
						cid: `andthisistogoevenfurtherbeyond`,
					},
				},
			},
		},
	});
}

// Create an empty starter pack
async function createStarterPack() {
	const agent = new AtpAgent({
		service,
	});

	await agent.login({
		identifier,
		password,
	});

	if (!agent.session) throw new Error('Not logged in');

	const listRkey = TID.now();
	console.log('Creating list with rkey:', listRkey);

	const listResult = await agent.com.atproto.repo.createRecord({
		repo: agent.session.did,
		collection: 'app.bsky.graph.list',
		rkey: listRkey,
		record: {
			name: '∅',
			purpose: 'app.bsky.graph.defs#curatelist',
			description: '',
			createdAt: new Date().toISOString(),
		},
	});

	const starterRkey = TID.now();
	console.log('Creating starter pack with rkey:', starterRkey);

	return await agent.com.atproto.repo.createRecord({
		repo: agent.session.did,
		collection: 'app.bsky.graph.starterpack',
		rkey: starterRkey,
		record: {
			$type: 'app.bsky.graph.starterpack',
			name: '∅',
			description: '',
			list: listResult.data.uri,
			createdAt: new Date().toISOString(),
			feeds: [], // Optional array of feed URIs, empty for now
		},
	});
}

createPost().catch(console.error);
// createImagePost().catch(console.error);
// createStarterPack().catch(console.error);
