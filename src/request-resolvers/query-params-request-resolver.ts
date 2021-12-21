import { MethodMetadata, QueriesParamType } from '../constants'
import { ErrorMessages } from '../baseService'

export const requestQueryParamsResolver = (metadata: MethodMetadata, methodName: string, args: unknown[]): QueriesParamType => {
  const query = metadata.query

  Object.entries(metadata.queryParams).map((e) => {
    const [idx, queryKey] = e
    if (queryKey === '') throw new Error(ErrorMessages.EMPTY_QUERY_KEY)

    const queryValue = args[idx]

    if (typeof queryValue === 'number' || typeof queryValue === 'string' || typeof queryValue === 'boolean') {
      query[queryKey] = queryValue
    } else {
      throw new Error(ErrorMessages.WRONG_QUERY_TYPE)
    }
  })
  const queryMapIndex = metadata.queryMapIndex
  if (queryMapIndex === undefined) return query

  const queryMap = args[queryMapIndex] as Record<string, unknown>
  Object.entries(queryMap).map((e) => {
    const [queryKey, queryValue] = e
    if (queryKey === '') throw new Error(ErrorMessages.EMPTY_QUERY_KEY)

    if (typeof queryValue === 'number' || typeof queryValue === 'string' || typeof queryValue === 'boolean') {
      query[queryKey] = queryValue
    } else {
      throw new Error(ErrorMessages.WRONG_QUERY_MAP_PROPERTY_TYPE)
    }
  })
  return query
}
