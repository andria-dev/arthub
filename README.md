# Art Hub

This is a project for hosting your art and being able to write stories and descriptions for them. Along with this you'll be able to privately share the art via a unique URL.

## File structure

After trying the `destiny` npm package for organizing files and realizing it made an even more complicated mess. I decided on a simple structure.

All front-end code goes in `src/`.

- `./pages/` — files that contain routes
- `./components/` — re-usable React components
- `./styles/` — only CSS files
- `./shared/` — non-component modules
		- _can contain components_ if they are related to the module

## Service Worker

Currently, the service worker is disabled. If possible, the goal is to make the service worker do the following:

- **Cache images** — artwork, profile photo, etc…
- Display a page stating that the user is **offline** to prevent user from seeing scary network errors.

## State management

For state management, I opted to use React's Context API as I don't have a lot of global state.

With this, I'm using Firebase which is notoriously hard to set up with React in a manageable way. This rings even more true in terms of React's new Suspense API as at the time of writing this, there don't appear to be any firebase libraries that fully support the Suspense API. To remedy this I built a few functions and components myself in the `./shared/firebase.js` file.

- `<FirebaseProvider>` — provides the global state while allowing for use of the Suspense API.
		- `<FirebaseUserResource>`
		- `<FirebaseCharactersResource>`
- `useUser()` — gets the user from context
- `useCharacters()` — gets the characters from context
- `async fetchImageURL(userID, fileID)` — downloads the URL for the image, fetches the image, creates a blob, caches the blob in memory, and returns it.
- `useCharacterWithImages(id)` — gets a specific character from context and creates resources for all of its images

To build these, I created some common use functions for the Suspense API in the `./shared/resources.js` file

- `readResource({status, suspender, result})`
- `createResource(promise)`
- `createResourceFromSubscription(subscribe)`
- `createDocumentResource(documentRef)`
- `useDocumentResource(documentRef, resource)`

<small>Note, you can read the actual documentation for these functions in the source code above each of them.</small>

## Transitions

I am using the `framer-motion` package from npm for animation, transitions, and page transitions.

## User Stories

- [x] Create characters with:
	- [x] A name
	- [x] A rich-text story — uses trix-editor
	- [x] Can upload artwork
	- [ ] Each work of art can have an `alt` — Non-MVP
- [x] Edit characters:
	- [x] Name
	- [x] Rich-text story — trix-editor
	- [x] Remove old artwork
	- [x] Add new artwork
	- [ ] Edit alts — Non-MVP
- [x] View character
	- [x] Name
	- [x] Rich-text story — trix-editor in readonly mode
	- [x] Artwork
- [x] Delete character
  - [x] Removes the character document
  - [x] Deletes files related to the character
  - [x] Confirms the user really wants to delete their character — Non-MVP
- [x] Sharing
	- [x] Share character via unique link <br>
		`[{characterId: string, alias: string, shareId: string}]`
	- [x] Un-share character links
	- [x] View shared links
- [ ] Responsive UI
	- [x] Mobile
	- [x] Tablet (sorta)
	- [ ] Desktop (I mean it's usable on Desktop just not )

## Firebase

My structure right now is:

- ~~collection: users~~
	- ~~document: \<user-id\>~~
		- ~~array field: characters~~
			- ~~string: id~~
			- ~~Array\<string\>: files~~
			- ~~String: name~~
			- ~~String: story~~

~~I would like to convert over to sub-collections for more concise saving of an individual character in the `saveCharacterMachine` and, if I'm correct, larger storage size. This would potentially look like the following:~~

```json5
{
	"users": /* collection */ {
		"<user-id>": /* document */ {
			// This is used for indicating which shared document the user is currently viewing.
			"currentShareId": "<share-id>",
		},
	},
	"characters": /* collection */ {
		"<character-id>": /* document */ {
			"files": ["array of file ids"],
			"name": "Character's name",
			"story": "JSON string of character story made with Trix",
			"roles": {
				"owner": "<user-id>",
			},
		},
	},
	"shares": /* collection */ {
		"<share-id>": /* document */ {
			"alias": "Alias created by user",
			"characterId": "<character-id>",
			"roles": {
				"owner": "<user-id>",
			},
		},
	},
}
```

## Testing

```bash
yarn test
```

This application currently has no tests as it is a gift, and I'm on a time crunch. Alongside this, I have no knowledge of testing with Firebase's Firestore and Storage APIs.

## Formatting

```bash
yarn format
```

I'm currently using Prettier but would like to switch to ESLint as it is more versatile and supposedly quicker.

## Running the application

```bash
# For development
yarn start

# For production
yarn build
```
