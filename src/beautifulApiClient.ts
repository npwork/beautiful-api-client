import { AxiosInstance, AxiosRequestConfig } from 'axios'
import { RequestInterceptor, RequestInterceptorFunction, ResponseInterceptor, ResponseInterceptorFunction } from './baseService'
import { ValidationMethod } from './constants'

type Args = {
  standalone?: boolean | AxiosInstance
  validateResponse?: ValidationMethod
  requestInterceptors?: Array<RequestInterceptorFunction | RequestInterceptor>
  responseInterceptors?: Array<ResponseInterceptorFunction | ResponseInterceptor>
  timeout?: number
  auth?: {
    oauth?: string
  }
  headers?: Record<string, string>
  inlinedResponseBody?: boolean
  saveHistory?: boolean
  log?: { level?: 'LOG' | 'DEBUG' } | boolean
}

export class BeautifulApiClient {
  public readonly endpoint
  public readonly standalone: boolean | AxiosInstance
  public readonly requestInterceptors: Array<RequestInterceptorFunction | RequestInterceptor>
  public readonly responseInterceptors: Array<ResponseInterceptorFunction | ResponseInterceptor>
  public readonly withInlineResponseBody
  public readonly responseValidator?: ValidationMethod
  public readonly shouldSaveRequestHistory
  public readonly timeout: number
  public readonly loggerOptions: { showLogs?: boolean; logLevel?: 'LOG' | 'DEBUG' }

  constructor(url: string, args: Args = {}) {
    this.endpoint = url
    this.timeout = args.timeout ?? 60000
    this.standalone = args.standalone ?? false
    this.responseValidator = args.validateResponse ?? ValidationMethod.CLASS_VALIDATOR
    this.withInlineResponseBody = args.inlinedResponseBody ?? false
    this.shouldSaveRequestHistory = args.saveHistory ?? false
    this.requestInterceptors = args.requestInterceptors ?? []
    this.responseInterceptors = args.responseInterceptors ?? []
    this.standalone = args.standalone ?? false

    if (args.log === undefined) {
      this.loggerOptions = { showLogs: false }
    } else {
      if (typeof args.log === 'boolean') {
        this.loggerOptions = { showLogs: true, logLevel: 'LOG' }
      } else {
        this.loggerOptions = { showLogs: true, logLevel: args.log?.level ?? 'LOG' }
      }
    }

    const headers = args.headers ?? {}
    if (args.auth?.oauth) headers['Authorization'] = `Bearer ${args.auth?.oauth}`

    // headers
    this.requestInterceptors.push((config: AxiosRequestConfig) => {
      return {
        ...config,
        headers: {
          ...config.headers,
          ...headers,
        },
      }
    })
  }

  public build<T>(service: new (builder: BeautifulApiClient) => T): T {
    return new service(this)
  }
}
