import { BaseApi } from '../base'
import { extendsProfile } from "../profile"
import { ModuleProfile, Api, API } from '../../types'
import { Network, CustomNetwork, networkProvider } from './type'

export interface INetworkApi extends Api {
  events: {
    providerChanged: (provider: networkProvider) => void
  }
  methods: {
    getNetworkProvider(): networkProvider
    detectNetwork(): Network | Partial<CustomNetwork>
    getEndpoint(): string
    addNetwork(network: CustomNetwork): void
    removeNetwork(name: string): void
  }
}

export const networkProfile: ModuleProfile<INetworkApi> = {
  name: 'networkTemplate', // Will be removed when extended
  kind: 'network',
  events: ['providerChanged'],
  methods: ['getNetworkProvider', 'getEndpoint', 'detectNetwork', 'addNetwork', 'removeNetwork'],
}

export abstract class NetworkApi<T extends Api>
  extends BaseApi<T & INetworkApi>
  implements API<INetworkApi> {

  constructor(profile: ModuleProfile) {
    const localProfile = extendsProfile(profile, networkProfile)
    super(localProfile)
  }

  /** Return the current network provider */
  abstract getNetworkProvider(): networkProvider
  abstract detectNetwork(): Network | Partial<CustomNetwork>
  /** Return the url only if network provider is 'web3' */
  abstract getEndpoint(): string
  abstract addNetwork(network: CustomNetwork): any
  abstract removeNetwork(): any
}
