import { ProfilesApiProvider } from '../providers';
import { Profile } from './domain/Profile';

export class ProfilesClient {
  /**
   * @constructor
   * @param profileApiProvider The provider for the POAP profile API.
   */
  constructor(private profileApiProvider: ProfilesApiProvider) {}

  /**
   * @param query The ETH address or ENS.
   * @param options Options to pass to the fetch call.
   * @returns The profile, or null if not found.
   */
  async fetch(query: string, options?: RequestInit): Promise<Profile | null> {
    const response = await this.profileApiProvider.getProfile(query, options);
    if (!response) {
      return null;
    }
    return Profile.fromResponse(response, this.profileApiProvider.apiUrl);
  }

  /**
   * Fetch profiles in bulk.
   *
   * @example
   * ```typescript
   * const address1 = '0x1234...';
   * const address2 = '0x5678...';
   * const profiles = await profilesClient.fetchBulk([address1, address2]);
   * console.log(profiles.get(address1)?.ens); // 'test.eth'
   * console.log(profiles.get('test.eth')?.address); // '0x1234...'
   * console.log(profiles.get(address2)?.ens); // undefined
   * ```
   *
   * @param queries The ETH addresses or ENS.
   * @param options Options to pass to the fetch call.
   * @returns A map of input addresses (ETH address or ENS) to profiles. All
   * map keys are lowercased.
   */
  async fetchBulk(
    queries: string[],
    options?: RequestInit,
  ): Promise<Map<string, Profile>> {
    const profiles = await this.profileApiProvider.getBulkProfiles(
      queries,
      options,
    );

    const map = new Map<string, Profile>();
    for (const response of profiles) {
      if (map.has(response.address.toLowerCase())) {
        continue;
      }

      const profile = Profile.fromResponse(
        response,
        this.profileApiProvider.apiUrl,
      );
      map.set(profile.address.toLowerCase(), profile);
      map.set(profile.ens.toLowerCase(), profile);
    }
    return map;
  }
}
