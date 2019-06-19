import { formatDuration } from '../utils/format';
import { DETAILS_FIELDS } from '../consts';
import { AugmentedPlaylistEntry } from '../types/pls';
import React from 'react';
import { NumberLimits } from './types';
import Qscale from '../utils/qscale';

const numQscale = new Qscale(20, [253, 147, 38], [110, 239, 112], 0.9);
numQscale.install();

interface PlaylistEntriesTableProps {
  entry: AugmentedPlaylistEntry;
  colorize: boolean;
  numberLimits: NumberLimits;
}

const PlaylistEntriesTableRow: React.FunctionComponent<PlaylistEntriesTableProps> = ({
  entry,
  colorize,
  numberLimits,
}) => {
  return (
    <tr key={entry.originalIndex}>
      <td>{(entry.originalIndex || 0) + 1}</td>
      <td>{entry.artists.map(a => a.name).join(', ')}</td>
      <td>{entry.name}</td>
      <td>{entry.album ? entry.album.name : null}</td>
      <td>{formatDuration(entry.duration_ms)}</td>
      {DETAILS_FIELDS.map(f => {
        const value = entry[f as keyof AugmentedPlaylistEntry];
        const className =
          colorize && numberLimits[f]
            ? numQscale.getClassName(value as number, numberLimits[f][0], numberLimits[f][1])
            : undefined;
        return (
          <td key={f} title={f} className={className}>
            {value}
          </td>
        );
      })}
    </tr>
  );
};

export default PlaylistEntriesTableRow;
