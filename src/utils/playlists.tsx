import { createPlaylistWithTracks } from '../spotifyApi/playlists';
import { AugmentedPlaylistEntry } from '../types/pls';
import { releaseDateField } from '../consts';

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

export function getValueFromEntry(entry: AugmentedPlaylistEntry, f: string): any {
  if (f === releaseDateField) {
    return entry.album?.release_date;
  }
  if (f in entry) {
    return entry[f as keyof AugmentedPlaylistEntry];
  }
}
