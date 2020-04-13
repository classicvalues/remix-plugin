import { ClientConnector, isHandshake, connectClient, applyApi, Client } from '@remixproject/plugin/connector'
import { PluginClient } from '@remixproject/plugin/client'
import { Message } from '../../utils/src/types/message'
import { RemixApi } from '../../utils/src/api/remix-profile'
import { Api, ApiMap } from '../../utils/src/types/api'
import { checkOrigin } from './origin'
import { listenOnThemeChanged } from './theme'


export class IframeConnector implements ClientConnector {
  source: Window
  origin: string

  constructor(private client: PluginClient) {}

  /** Send a message to the engine */
  send(message: Partial<Message>) {
    if (this.source) {
      this.source.postMessage(message, this.origin)
    } else if (isHandshake(message)) {
      window.parent.postMessage(message, '*')
    }
  }

  /** Get messae from the engine */
  on(cb: (message: Partial<Message>) => void) {
    window.addEventListener('message', async (event: MessageEvent) => {
      if (!event.source) throw new Error('No source')
      // Check that the origin is the right one
      const devMode = this.client.options.devMode
      const isGoodOrigin = await checkOrigin(event.origin, devMode)
      if (!isGoodOrigin) return
      if (!event.data) throw new Error('No data')
      if (isHandshake(event.data)) {
        this.source = event.source as Window
        this.origin = event.origin
      }
      cb(event.data)

    }, false)
  }
}

/**
 * Connect an Iframe client to a web engine
 * @param client An optional iframe client to connect to the engine
 * @example Let the function create a client
 * ```typescript
 * const client = createIframeClient()
 * ```
 * @example With a custom client
 * ```typescript
 * class MyPlugin extends PluginClient {
 *  methods = ['hello']
 *  hello() {
 *   console.log('Hello World')
 *  }
 * }
 * const client = createIframeClient(new MyPlugin())
 * ```
 */
export const createIframeClient = <
  P extends Api,
  App extends ApiMap = RemixApi
>(client: PluginClient<P, App> = new PluginClient()): Client<P, App> => {
  const c = client as any
  connectClient(new IframeConnector(c), c)
  applyApi(c)
  listenOnThemeChanged(c)
  return c
}