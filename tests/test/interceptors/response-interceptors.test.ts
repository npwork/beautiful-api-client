import { BeautifulApiClient, ResponseInterceptor, ResponseInterceptorFunction } from '../../../src'
import { AxiosResponse } from 'axios'
import { testServer, validateThrows } from '../../testHelpers'
import { PostsApiService } from '../../fixture/fixtures'
import { DataType } from '../../../src/constants'

describe('Response interceptors', () => {
  const interceptedHeaderValue = 100

  test('ResponseInterceptorFunction', async () => {
    const interceptor = <T>(value: AxiosResponse<T>) => {
      value.data['INTERCEPTOR'] = interceptedHeaderValue
      return value
    }

    await verifyInterceptor(interceptor)
  })

  test('ResponseInterceptor class', async () => {
    class Interceptor<T extends DataType = DataType> extends ResponseInterceptor<T> {
      onFulfilled(value: AxiosResponse<T>): AxiosResponse<T> | Promise<AxiosResponse<T>> {
        value.data['INTERCEPTOR'] = interceptedHeaderValue
        return value
      }
    }

    await verifyInterceptor(new Interceptor())
  })

  describe('onRejected', () => {
    test('Override onRejected', async () => {
      let calledRejected = false

      class Interceptor<T extends Record<string, unknown>> extends ResponseInterceptor<T> {
        onRejected(): void {
          calledRejected = true
        }

        onFulfilled(value: AxiosResponse<T>): AxiosResponse<T> | Promise<AxiosResponse<T>> {
          return value
        }
      }

      const interceptor = new Interceptor()
      const spy = jest.spyOn(interceptor, 'onRejected')

      const service = new BeautifulApiClient(testServer.url, {
        responseInterceptors: [interceptor],
        standalone: true,
      }).build(PostsApiService)

      await service.wrongUrl()

      expect(spy).toHaveBeenCalled()
      expect(calledRejected).toBeTruthy()
    })

    test('No override', async () => {
      class Interceptor<T extends Record<string, unknown>> extends ResponseInterceptor<T> {
        onFulfilled(value: AxiosResponse<T>): AxiosResponse<T> | Promise<AxiosResponse<T>> {
          return value
        }
      }

      const interceptor = new Interceptor()

      const service = new BeautifulApiClient(testServer.url, {
        standalone: true,
        responseInterceptors: [interceptor],
      }).build(PostsApiService)

      await validateThrows(service.wrongUrl, (error) => {
        expect(error.message).toContain('404')
      })
    })
  })

  async function verifyInterceptor(interceptor: ResponseInterceptorFunction | ResponseInterceptor) {
    const builder = new BeautifulApiClient(testServer.url, { standalone: true, responseInterceptors: [interceptor] })

    const service = builder.build(PostsApiService)

    const result = await service.get()

    expect(result.data['INTERCEPTOR']).toBe(interceptedHeaderValue)
  }
})
