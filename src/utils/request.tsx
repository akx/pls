export interface Progress {
  loaded: number;
  total: number;
}

export interface ProgressWithItems<TItem> extends Progress {
  items: readonly TItem[];
}

type Executor<TResult, TError, TProgress extends Progress> = (
  resolve: (result: TResult) => void,
  reject: (error: TError) => void,
  request: Request<TResult, TError, TProgress>,
) => void;

type PromiseOrExecutor<TResult, TError, TProgress extends Progress> =
  | Promise<TResult>
  | Executor<TResult, TError, TProgress>;

export default class Request<TResult, TError = Error, TProgress extends Progress = Progress> {
  public progress: TProgress | undefined;
  public cancelRequested = false;
  public onProgress: ((progress: TProgress) => void)[] = [];
  public onComplete: ((result: TResult) => void)[] = [];
  public onError: ((error: TError) => void)[] = [];
  public busy = true;
  public result: TResult | undefined;
  public error: TError | undefined;
  private _promise: Promise<TResult>;

  constructor(promiseOrExecutor: PromiseOrExecutor<TResult, TError, TProgress>) {
    this._promise = this._initializePromise(promiseOrExecutor);
  }

  private _initializePromise(promiseOrExecutor: PromiseOrExecutor<TResult, TError, TProgress>): Promise<TResult> {
    let promise: Promise<TResult>;
    if ((promiseOrExecutor as Promise<TResult>).then) {
      promise = promiseOrExecutor as Promise<TResult>;
    } else {
      const executor = promiseOrExecutor as Executor<TResult, TError, TProgress>;
      promise = new Promise<TResult>((resolve, reject) => executor(resolve, reject, this));
    }
    return promise.then(this._handleResolve, this._handleError);
  }

  private _handleResolve = (result: TResult) => {
    this.busy = false;
    this.result = result;
    this.onComplete.forEach(completeCb => completeCb(result));
    return result;
  };

  private _handleError = (err: TError) => {
    this.busy = false;
    this.error = err;
    this.onError.forEach(errorCb => errorCb(err));
    return Promise.reject(err);
  };

  public reportProgress(progress: TProgress | undefined) {
    this.progress = progress;
    if (progress !== undefined) {
      this.onProgress.forEach(fn => fn(progress));
    }
  }

  public cancel() {
    if (!this.cancelRequested) {
      this.cancelRequested = true;
    }
  }
}
