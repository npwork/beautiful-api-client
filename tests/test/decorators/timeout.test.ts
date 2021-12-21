import { BeautifulApiClient } from '../../../src'
import { TimeoutService } from '../../fixture/fixtures.timeout'
import { testServer } from '../../testHelpers'

describe('Decorators - timeout', () => {
  test('@Timeout', async () => {
    const service = new BeautifulApiClient(testServer.url).build(TimeoutService)
    await expect(service.timeoutIn300()).rejects.toThrow(/timeout/)
  })

  test('The timeout in `@Timeout` decorator should shield the value from config', async () => {
    const service = new BeautifulApiClient(testServer.url, { timeout: 3000 }).build(TimeoutService)
    const response = await service.timeoutIn600()
    expect(response.config.timeout).toEqual(600)
    expect(response.data).toEqual({})
  })
})
