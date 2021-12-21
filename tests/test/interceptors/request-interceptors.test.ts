import { BeautifulApiClient, RequestInterceptor, RequestInterceptorFunction } from '../../../src'
import { AxiosRequestConfig } from 'axios'
import { testServer } from '../../testHelpers'
import { PostsApiService } from '../../fixture/fixtures'

describe('Request interceptors', () => {
  const interceptedHeaderValue = `100`

  test('RequestInterceptorFunction', async () => {
    const interceptor = (config: AxiosRequestConfig) => {
      config.headers!['INTERCEPTOR'] = interceptedHeaderValue
      return config
    }

    await verifyInterceptor(interceptor)
  })

  test('RequestInterceptor class', async () => {
    class Interceptor extends RequestInterceptor {
      onFulfilled(config: AxiosRequestConfig) {
        config.headers!['INTERCEPTOR'] = interceptedHeaderValue
        return config
      }
    }

    await verifyInterceptor(new Interceptor())
  })

  async function verifyInterceptor(interceptor: RequestInterceptorFunction | RequestInterceptor) {
    const builder = new BeautifulApiClient(testServer.url, {
      log: true,
      requestInterceptors: [interceptor],
    })
    const service = builder.build(PostsApiService)

    const result = await service.get()

    expect(result.config.headers!['INTERCEPTOR']).toBe(interceptedHeaderValue)
  }
})
