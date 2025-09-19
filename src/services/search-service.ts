import { BaseApiService } from './base-api-service';
import type {
  SearchParams,
  SearchResponse,
  SearchSuggestionsParams,
  SearchSuggestionsResponse
} from '@/types';

export class SearchService extends BaseApiService {
  private entityPath = '/search';

  async globalSearch(params: SearchParams): Promise<SearchResponse> {
    const queryParams = this.buildQueryParams({
      q: params.q,
      entity_types: params.entity_types,
      limit: params.limit,
      offset: params.offset
    });

    return await this.apiGet<SearchResponse>(this.entityPath, queryParams);
  }

  async getSearchSuggestions(params: SearchSuggestionsParams): Promise<SearchSuggestionsResponse> {
    const queryParams = this.buildQueryParams({
      query: params.query,
      limit: params.limit
    });

    return await this.apiGet<SearchSuggestionsResponse>(`${this.entityPath}/suggestions`, queryParams);
  }
}

// Export singleton instance
export const searchService = new SearchService();