import React from 'react';

export default class Tracklist extends React.Component {
  render() {
    const { playlist, tracks } = this.props;
    return (
      <table>
        <thead>
        <tr>
          <th>Artist</th>
          <th>Track</th>
          <th>Album</th>
          <th>Duration</th>
        </tr>
        </thead>
        <tbody>
        {(tracks || []).map(ple => {
          const track = ple.track;
          return (
            <tr key={`${track.id}_${ple.originalIndex}`}>
              <td>{track.artists.map((a) => a.name).join(', ')}</td>
              <td>{track.name}</td>
              <td>{(track.album ? track.album.name : null)}</td>
              <td>{Math.round(track.duration_ms / 1000)}</td>
              <td>
                <details><pre>{JSON.stringify(ple, null, 2)}</pre></details>
              </td>
            </tr>
          );
        })}
        </tbody>
      </table>
    );
  }
}
