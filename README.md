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

- [ ] Create characters with:
  - [x] A name
  - [x] A rich-text story (switching to https://github.com/basecamp/trix)
  - [x] Can upload artwork
  - [ ] Each work of art can have an `alt`
- [ ] Edit characters:
  - [ ] Name
  - [ ] Rich-text story
  - [ ] Remove old artwork
  - [ ] Add new artwork
  - [ ] Edit alts
- [x] View character
  - [x] Name
  - [x] Rich-text story — not raw markdown or anything else
  - [x] Artwork
- [x] Delete character and all related artwork
- [ ] Sharing
  - [ ] Share character via unique link
  - [ ] Share character with time-sensitive link
  - [ ] Un-share character link

## Testing

```bash
yarn test
```

This application currently has no tests as it is a gift, and I'm on a time crunch.

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
