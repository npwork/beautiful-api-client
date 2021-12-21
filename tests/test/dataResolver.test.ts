import { DataResolverFactory, FormUrlencodedResolver, JsonResolver, MultiPartResolver, TextXmlResolver } from '../../src/dataResolver'
import * as fs from 'fs'
import { CONTENT_TYPE, CONTENT_TYPE_HEADER } from '../../src/constants'

describe('Data resolver.', () => {
  test('FormUrlencodedResolver with flat object.', async () => {
    const formUrlencodedResolver = new FormUrlencodedResolver()
    const headers = {
      [CONTENT_TYPE_HEADER]: CONTENT_TYPE.FORM_URL_ENCODED,
    }
    const obj = {
      foo: 'bar',
    }
    const data = Object.create(obj)
    data.a = 1
    data.b = 'hello'
    data.c = true
    data.d = null
    const resolvedData = formUrlencodedResolver.resolve(headers, data)
    expect(resolvedData).toEqual('a=1&b=hello&c=true&d=null')
  })

  test('FormUrlencodedResolver with nested object.', async () => {
    const formUrlencodedResolver = new FormUrlencodedResolver()
    const headers = {
      [CONTENT_TYPE_HEADER]: CONTENT_TYPE.FORM_URL_ENCODED,
    }
    const data = {
      a: 1,
      b: 'hello',
      c: true,
      d: null,
      e: ['foo', 'bar'],
    }
    const resolvedData = formUrlencodedResolver.resolve(headers, data)
    expect(resolvedData).toEqual('a=1&b=hello&c=true&d=null&e=%5B%22foo%22%2C%22bar%22%5D')
  })

  test('MultiPartResolver.', async () => {
    const multiPartResolver = new MultiPartResolver()
    const headers = {
      [CONTENT_TYPE_HEADER]: CONTENT_TYPE.MULTIPART_FORM_DATA,
    }
    const bucket = {
      value: 'test-bucket',
    }
    const file = {
      value: fs.readFileSync('tests/fixture/pic.png'),
      filename: 'pic.png',
    }
    const data = {
      bucket,
      file,
    }
    const resolvedData = multiPartResolver.resolve(headers, data)
    expect(resolvedData['_streams']).toContain('test-bucket')
  })

  test('JsonResolver.', async () => {
    const jsonResolver = new JsonResolver()
    const headers = {
      [CONTENT_TYPE_HEADER]: CONTENT_TYPE.APPLICATION_JSON,
    }
    const data = {
      a: 1,
      b: 'b',
      c: true,
      d: null,
      e: [1, 2, 3],
      f: {
        f1: 1,
        f2: ['a', 'b', 'c'],
      },
    }
    const resolvedData = jsonResolver.resolve(headers, data)
    expect(resolvedData).toStrictEqual(resolvedData)
  })

  test('TextXmlResolver.', async () => {
    const textXmlResolver = new TextXmlResolver()
    const headers = {
      [CONTENT_TYPE_HEADER]: CONTENT_TYPE.XML,
    }
    const xmlString = `
      <?xml version="1.0" encoding="UTF-8"?>
      <message>
        <receiver>foo@foo.com</receiver>
        <sender>bar@bar.com</sender>
        <title>Hello</title>
        <content>Hello world!</content>
      </message>`
    const resolvedData = textXmlResolver.resolve(headers, xmlString)
    expect(resolvedData).toStrictEqual(xmlString)
  })

  test('DataResolverFactory.', async () => {
    const dataResolver = DataResolverFactory.createDataResolver('application/user-defined-content-type')
    expect(dataResolver instanceof JsonResolver).toBeTruthy()
  })
})
