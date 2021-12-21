import { BasePath, BaseService, GET, Timeout, ApiResponse } from '../../src'
import { API_PREFIX } from './fixtures'

@BasePath(API_PREFIX)
export class TimeoutService extends BaseService {
  @GET('/sleep-500')
  sleep500(): ApiResponse {}

  @GET('/sleep-500')
  @Timeout(300)
  timeoutIn300(): ApiResponse {}

  @GET('/sleep-500')
  @Timeout(600)
  timeoutIn600(): ApiResponse {}
}
