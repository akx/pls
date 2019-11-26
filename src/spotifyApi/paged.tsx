import Request, { ProgressWithItems } from '../utils/request';
import { PagedResponse } from '../types/spotify';
import { requestAuthenticated } from './auth';

export type PagedResourceRequest<TResource> = Request<TResource[], Error, ProgressWithItems<TResource>>;

export function loadPagedResource<TResource>(
  url: string,
  params: { [key: string]: string },
  limit: number,
  requestLimit = 50,
): PagedResourceRequest<TResource> {
  let offset = 0;
  const items: TResource[] = [];
  return new Request<TResource[], Error, ProgressWithItems<TResource>>((resolve, reject, request) => {
    async function loadPage() {
      try {
        const { data } = await requestAuthenticated<PagedResponse<TResource>>({
          url,
          params: { ...params, limit: requestLimit, offset },
        });
        data.items.forEach(item => items.push(item));
        request.reportProgress({
          total: data.total,
          loaded: items.length,
          items,
        });
        if (request.cancelRequested) {
          reject(new Error('cancel'));
          return;
        }
        if (data.next && items.length < limit) {
          offset += data.limit;
          setTimeout(loadPage, 16);
        } else {
          resolve(items);
        }
      } catch (e) {
        return reject(e);
      }
    }

    loadPage();
  });
}
