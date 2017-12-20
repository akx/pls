/* eslint-disable no-underscore-dangle */
export default class Request {
  constructor(promiseOrExecutor) {
    this.progress = null;
    this.cancelRequested = false;
    this.onProgress = [];
    this.busy = true;
    this.result = null;
    this.error = null;
    this._promise = this._initializePromise(promiseOrExecutor);
  }

  _initializePromise(promiseOrExecutor) {
    let promise;
    if (promiseOrExecutor.then) {
      promise = promiseOrExecutor;
    } else {
      promise = new Promise((resolve, reject) => promiseOrExecutor(resolve, reject, this));
    }
    return promise
      .then((result) => {
        this.busy = false;
        this.result = result;
        return result;
      })
      .catch((err) => {
        this.busy = false;
        this.error = err;
        return Promise.reject(err);
      });
  }

  then(thenner) {
    this._promise = this._promise.then(thenner);
    return this;
  }

  catch(thenner) {
    this._promise = this._promise.catch(thenner);
    return this;
  }

  reportProgress(progress) {
    this.progress = progress;
    this.onProgress.forEach(fn => fn(this.progress));
  }

  cancel() {
    if (!this.cancelRequested) {
      this.cancelRequested = true;
    }
  }
}
