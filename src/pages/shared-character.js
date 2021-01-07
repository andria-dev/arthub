import {assign, Machine} from 'xstate';
import {useMachine} from '@xstate/react';
import {Link, useParams} from 'react-router-dom';
import {Text} from '@fluentui/react';

import {auth, firestore, useUser} from '../shared/firebase.js';
import {Loading} from '../components/Loading.js';
import {Center} from '../components/Center.js';
import {FadeLayout} from '../components/FadeLayout.js';
import {SharedCharacter} from '../components/SharedCharacter.js';
import {createDocumentResource} from '../shared/resources.js';

/**
 * @typedef {{alias: string, characterId: string, roles: {owner: string}}} Share
 *//**
 *
 * @type {import('xstate').StateMachine<
 * 	{
 * 		shareId: string,
 * 		user: import('firebase').User,
 * 		share: Share
 * 	},
 * 	import('xstate').EventObject,
 * >}
 */
const uploadShareInfoMachine = Machine({
	id: 'create-anon',
	initial: 'uploading',
	context: {shareId: '', user: null, share: null},
	states: {
		uploading: {
			invoke: {
				src: async (context) => {
					let {user} = context;
					if (!user) {
						const userCredentials = await auth.signInAnonymously();
						user = userCredentials.user;
					}

					await firestore
						.collection('users')
						.doc(user.uid)
						.set({currentShareId: context.shareId});

					const shareSnapshot = await firestore.collection('shares').doc(context.shareId).get();
					if (!shareSnapshot.exists) {
						throw new Error(`Share "${context.shareId}" is non-existent.`);
					}

					return shareSnapshot.data();
				},
				onDone: {
					target: 'created',
					actions: ['setShare'],
				},
				onError: 'failed',
			},
		},
		created: {type: 'final'},
		failed: {
			on: {
				RETRY: 'uploading',
			},
		},
	},
}, {
	actions: {
		setShare: assign({share: (ctx, event) => event.data}),
	},
});

export function SharedCharacterPage() {
	// @ts-ignore
	const {shareId} = useParams();

	const user = useUser();
	const [current, send] = useMachine(uploadShareInfoMachine.withContext({
		...uploadShareInfoMachine.context,
		shareId,
		user,
	}));

	if (current.matches('uploading')) {
		return <Loading label="Verifying share information..." />;
	}

	if (current.matches('failed')) {
		return (
			<FadeLayout style={{height: '100%'}}>
				<Center>
					<div style={{
						display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px',
					}}
					>
						{/* @ts-ignore */}
						<Text variant="title" style={{textAlign: 'center'}}>Uh oh..</Text>
						<Text variant="medium" style={{textAlign: 'center', marginBottom: '20px'}}>
							Unable to verify share, would you like to try again?
						</Text>
						<Link to="/landing" style={{marginBottom: '10px'}}>Take me to the landing page</Link>
						<button type="button" onClick={() => send('RETRY')}>Retry</button>
					</div>
				</Center>
			</FadeLayout>
		);
	}

	if (current.matches('created')) {
		const reference = firestore.collection('characters').doc(current.context.share.characterId);
		const resource = createDocumentResource(reference);
		return <SharedCharacter reference={reference} resource={resource} />;
	}
}
