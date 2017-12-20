export default ({ error, message, retry }) => (
  <div>
    {message}
    {retry ? <button onClick={() => retry()}>Try again</button> : null}
    <details>
      <summary>Error Details</summary>
      {error.toString()}
      <br />
      <pre>{JSON.stringify(error, null, 2)}</pre>
    </details>
  </div>
);
