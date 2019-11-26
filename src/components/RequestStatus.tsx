import React from 'react';
import Error from './Error';
import Request from '../utils/request';

interface RequestStatusProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request: Request<any, any, any>;
  progressMessage: string;
  errorMessage?: string;
  retry: () => void;
}

const RequestStatus: React.FunctionComponent<RequestStatusProps> = ({
  request,
  progressMessage,
  errorMessage,
  retry,
}) => {
  if (!request) return null;
  if (request.error) {
    return <Error error={request.error} message={errorMessage || 'An error occurred'} retry={retry} />;
  }
  if (request.busy) {
    const { progress } = request;
    return (
      <div className="request-status">
        <div className="request-status-message">
          {(progressMessage || 'Loading').replace(
            '{n}',
            progress !== undefined && progress.total ? `${progress.total}` : '',
          )}
        </div>
        {progress && progress.loaded ? (
          <div className="request-status-progress-wrapper">
            <span>
              {progress.loaded}/{progress.total}
            </span>
            <progress max={progress.total} value={progress.loaded} />
          </div>
        ) : null}
      </div>
    );
  }
  return null;
};
export default RequestStatus;
