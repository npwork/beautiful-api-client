import { BeautifulApiClient } from '../../src'
import { testServer } from '../testHelpers'
import { PostsApiService } from '../fixture/fixtures'
import axios, { AxiosRequestConfig } from 'axios'

describe('Standalone', () => {
  test('With instance', async () => {
    const serviceWithoutStandalone = new BeautifulApiClient(testServer.url).build(PostsApiService)
    const axiosInstance = axios.create()

    axiosInstance.interceptors.response.use((value) => {
      value.config['standaloneId'] = 101
      return value
    })

    const serviceWithStandalone = new BeautifulApiClient(testServer.url, { standalone: axiosInstance }).build(PostsApiService)

    expect((await serviceWithoutStandalone.get()).config['standaloneId']).toBeUndefined()
    expect((await serviceWithStandalone.get()).config['standaloneId']).toBe(101)
  })

  test('With boolean', async () => {
    const serviceWithoutStandalone = new BeautifulApiClient(testServer.url).build(PostsApiService)

    const interceptor = (config: AxiosRequestConfig) => {
      config['standaloneId'] = 101
      return config
    }

    const serviceWithStandalone = new BeautifulApiClient(testServer.url, {
      standalone: true,
      requestInterceptors: [interceptor],
    }).build(PostsApiService)

    expect((await serviceWithoutStandalone.get()).config['standaloneId']).toBeUndefined()
    expect((await serviceWithStandalone.get()).config['standaloneId']).toBe(101)
  })
})
