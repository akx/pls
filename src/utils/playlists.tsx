import { createPlaylistWithTracks } from '../spotifyApi/playlists';

export async function createNewPlaylistInteractive(spotifyUris: readonly string[]) {
  if (!spotifyUris.length) {
    alert('No tracks to create a playlist from.');
    return;
  }
  const title = prompt('What should the new playlist be called?');
  if (!title) {
    return;
  }
  try {
    await createPlaylistWithTracks(title, spotifyUris);
  } catch (err) {
    console.error(err);
    alert(`Error creating playlist: ${err}`);
  }
}
