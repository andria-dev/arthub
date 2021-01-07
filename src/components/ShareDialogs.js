import {
	useContext, useRef, useState, Suspense,
} from 'react';

import {Image, Text} from '@fluentui/react';
import {useId} from '@reach/auto-id';
import {AnimatePresence, motion} from 'framer-motion';

import {
	Dialog, DialogParagraph, DialogTitle, DialogAction, DialogActionBar,
} from './Dialog.js';
import {TextInput} from './Input/Input.js';
import {ShareContext} from '../shared/machines.js';
import {firestore, useCharacters, useUser} from '../shared/firebase.js';
import {createQueryResource, useQueryResource} from '../shared/resources.js';
import {Loading} from './Loading.js';
import {FadeLayout} from './FadeLayout.js';

export function ConfirmShareDialog() {
	const [current, send] = useContext(ShareContext);
	const characters = useCharacters();
	const character = characters.find((currentCharacter) => currentCharacter.id === current.context.characterId);

	function handleSubmit(event) {
		event.preventDefault();
		send('CONFIRMED', {alias: event.target.linkAlias.value});
	}

	function dismiss() {
		send('DISMISS');
	}

	return (
		<Dialog isOpen={current.matches('shareCharacters.confirming')} onDismiss={dismiss}>
			<DialogTitle style={{textAlign: 'center'}}>Shared-Link Details</DialogTitle>
			<DialogParagraph style={{marginBottom: 20, textAlign: 'center'}}>
				You are creating a public link for sharing your character <strong>{character?.name}</strong>.
			</DialogParagraph>

			<form style={{width: '100%'}} onSubmit={handleSubmit}>
				<TextInput
					name="linkAlias"
					label="Link alias"
					placeholder="Jane's link..."
					frameProps={{style: {width: '100%'}}}
					required
					autoComplete="off"
				/>
				<DialogActionBar>
					<DialogAction variant="primary" type="submit">Confirm</DialogAction>
					<DialogAction variant="secondary" onClick={dismiss}>Cancel</DialogAction>
				</DialogActionBar>
			</form>
		</Dialog>
	);
}

export function SharingCharacterDialog() {
	const [current] = useContext(ShareContext);

	return (
		<Dialog isOpen={current.matches('shareCharacters.sharing')}>
			<DialogTitle style={{textAlign: 'center'}}>Sharing!</DialogTitle>
			<Image src="/lava-lamp.svg" alt="Lava lamp upload animation" width={170} height={170} />
		</Dialog>
	);
}

export function ShowShareUrlDialog() {
	const [current, send] = useContext(ShareContext);

	function dismiss() {
		send('DISMISS');
	}

	return (
		<Dialog isOpen={current.matches('shareCharacters.showUrl')} onDismiss={dismiss}>
			<DialogTitle style={{textAlign: 'center'}}>Here's your link!</DialogTitle>
			<DialogParagraph style={{textAlign: 'center'}}>
				Give this link to your friends and they will be able to see your cool character!
			</DialogParagraph>
			<div style={{display: 'flex', alignItems: 'flex-end'}}>
				<TextInput
					label="Your link"
					frameProps={{width: '100%'}}
					value={current.context.url}
					readOnly
				/>
				<DialogAction
					variant="tertiary"
					style={{marginLeft: '10px', minWidth: '80px'}}
					onClick={() => send('COPY')}
				>
					Copy
				</DialogAction>
			</div>
			{current.matches('shareCharacters.showUrl.copied') && <DialogParagraph>Copied!</DialogParagraph>}
			{current.matches('shareCharacters.showUrl.notCopied') && <DialogParagraph>Not copied</DialogParagraph>}
			<DialogActionBar>
				<DialogAction variant="primary" onClick={dismiss}>Done</DialogAction>
				<DialogAction variant="secondary" onClick={() => send('VIEW_SHARED')}>View Links</DialogAction>
			</DialogActionBar>
		</Dialog>
	);
}

function ShareLinkItem({share, onToggle}) {
	const id = useId();

	function handleChange(event) {
		if (onToggle) onToggle(event.target.checked);
	}

	return (
		<motion.div
			initial={{opacity: 0}}
			animate={{opacity: 1}}
			exit={{opacity: 0}}
			style={{
				display: 'grid', gridTemplateColumns: '46px 1fr', width: '100%', marginBottom: 15,
			}}
		>
			<input
				id={id}
				type="checkbox"
				style={{placeSelf: 'center', width: 30, height: 30}}
				onChange={handleChange}
			/>
			<TextInput value={`${window.location.origin}/shared-character/${share.id}`} readOnly />
			<Text
				style={{gridColumnStart: 2, marginLeft: 10}}
				as="label"
				// @ts-ignore
				htmlFor={id}
				variant="medium"
			>{share.alias}
			</Text>
		</motion.div>
	);
}

function ShareLinksList({reference, resource}) {
	const shares = useQueryResource(reference, resource);
	/** @type {import('react').MutableRefObject<HTMLFieldSetElement>} */
	const fieldsetRef = useRef();
	const [checked, setChecked] = useState([]);

	const [current, send] = useContext(ShareContext);
	function dismiss() {
		send('DISMISS');
	}

	function unCheck() {
		fieldsetRef?.current?.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
			checkbox.checked = false;
		});
		setChecked([]);
	}
	function revoke() {
		send('REVOKE_SHARES', {shareIdsToRevoke: checked});
		unCheck();
	}
	function copy() {
		send('COPY', {shareId: `${window.location.origin}/shared-character/${checked[0]}`});
		unCheck();
	}

	const minWidth = checked.length === 1 ? '80px' : '';

	return (
		<>
			<fieldset
				ref={fieldsetRef}
				style={{width: '100%', padding: 0, border: 'none'}}
			>
				<DialogTitle as="legend" style={{textAlign: 'center'}}>Your links</DialogTitle>
				{shares.map((share) => (
					<AnimatePresence key={share.id}>
						<ShareLinkItem
							share={share}
							onToggle={(isChecked) => {
								if (isChecked) {
									setChecked((prev) => [...prev, share.id]);
								} else {
									setChecked((prev) => prev.filter((id) => id !== share.id));
								}
							}}
						/>
					</AnimatePresence>
				))}
				<AnimatePresence>
					{shares.length === 0 ? (
						<FadeLayout style={{display: 'grid'}}>
							<Text as="p" style={{textAlign: 'center'}}>
								You don't have any shared-links right now.{' '}
								Try sharing one of your characters first.
							</Text>
						</FadeLayout>
					) : null}
				</AnimatePresence>
			</fieldset>

			{current.matches('viewShares.idle.copied') && <Text as="p" style={{textAlign: 'center'}}>Copied!</Text>}
			{current.matches('viewShares.idle.notCopied') && (
				<Text as="p" style={{textAlign: 'center'}}>
					Not copied!
				</Text>
			)}
			{current.matches('viewShares.idle.revoked') && <Text as="p" style={{textAlign: 'center'}}>Revoked!</Text>}
			{current.matches('viewShares.idle.notRevoked') && (
				<Text as="p" style={{textAlign: 'center'}}>
					Not revoked!
				</Text>
			)}

			<DialogActionBar style={{justifyContent: 'space-evenly'}}>
				{checked.length === 1 ? (
					<DialogAction variant="primary" onClick={copy} style={{minWidth}}>
						Copy
					</DialogAction>
				) : null}
				{checked.length ? (
					<DialogAction
						variant={checked.length === 1 ? 'tertiary' : 'primary'}
						onClick={revoke}
						style={{minWidth}}
					>Revoke
					</DialogAction>
				) : null}
				<DialogAction
					variant={checked.length === 0 ? 'primary' : 'secondary'}
					onClick={dismiss}
					style={{minWidth}}
				>Exit
				</DialogAction>
			</DialogActionBar>
		</>
	);
}

export function ViewShareLinksDialog() {
	const [current, send] = useContext(ShareContext);

	function dismiss() {
		send('DISMISS');
	}

	const user = useUser();
	const reference = firestore.collection('shares').where('roles.owner', '==', user.uid);
	const resource = createQueryResource(reference);

	return (
		<Dialog isOpen={current.matches('viewShares')} onDismiss={dismiss} style={{minHeight: '100px'}}>
			<form style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
				<Suspense fallback={<Loading label="Getting your shares..." />}>
					<ShareLinksList reference={reference} resource={resource} />
				</Suspense>
			</form>
		</Dialog>
	);
}
