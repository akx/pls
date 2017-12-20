export default ({ request, progressMessage, errorMessage, retry }) => {
  if (!request) return null;
  if (request.error) {
    return (
      <Error
        error={request.error}
        message={errorMessage || 'An error occurred'}
        retry={retry}
      />
    );
  }
  if (request.busy) {
    const progress = request.progress;
    return (
      <div>
        {(progressMessage || 'Loading').replace('{n}', progress && progress.total ? `${progress.total}` : '')}...
        {progress && progress.loaded ? (
          <div>
            <span>{progress.loaded}/{progress.total}</span>
            <progress max={progress.total} value={progress.loaded}/>
          </div>
        ) : null}
      </div>
    );
  }
  return null;
}
