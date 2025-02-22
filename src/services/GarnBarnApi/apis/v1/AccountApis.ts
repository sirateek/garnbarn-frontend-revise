import {
  AccountDetail,
  AnyJson,
  SupportThirdPartyPlatform,
} from "@/types/GarnBarnApi/AccountApi";
import { AxiosResponse } from "axios";
import { api, ApiSpecError } from "./api";

export default class AccountApis extends api {
  API_BASE_URL = "/api/v1/account";
  SESSION_STORAGE_KEY = "accounts";
  /**
   * Call Get Account Detail Api
   * TODO: Specify the API document url
   *
   * @param forceRefresh This caller has a cache feature. If this set to true, It will force refresh data from API. If false, It will try to get the data from session storage first.
   * @param uid The uid of the user you want to get their profile.
   * @returns The Promise of AxiosResponse of AccountDetail in fulled state.
   */
  async getAccountDetail(
    forceRefresh?: boolean,
    uid?: string
  ): Promise<AxiosResponse<AccountDetail>> {
    if (!forceRefresh) {
      const cachedAccountDetail = this.getAccountFromSessionStorage(
        uid ?? this.getFirebaseUser().uid
      );
      if (cachedAccountDetail) {
        return new Promise((resolve, reject) => {
          resolve({
            data: cachedAccountDetail,
          } as AxiosResponse<AccountDetail>);
        });
      }
    }
    let url = `${this.API_BASE_URL}/`;
    if (uid) {
      url += `?uid=${uid}`;
    }
    const apiResponse = (await this.sendRequest(
      "GET",
      url
    )) as AxiosResponse<AccountDetail>;

    this.addAccountToSessionStorage(
      uid ?? this.getFirebaseUser().uid,
      apiResponse.data
    );
    return apiResponse;
  }

  private getAccountFromSessionStorage(uid: string): AccountDetail | null {
    const accounts = window.sessionStorage.getItem(this.SESSION_STORAGE_KEY);
    if (!accounts) {
      window.sessionStorage.setItem(
        this.SESSION_STORAGE_KEY,
        JSON.stringify({})
      );
      return null;
    }
    const accountJson = JSON.parse(accounts);
    if (!accountJson[uid]) {
      return null;
    }
    return accountJson[uid];
  }

  private addAccountToSessionStorage(
    uid: string,
    accountDetial: AccountDetail
  ): void {
    const accounts = window.sessionStorage.getItem(this.SESSION_STORAGE_KEY);
    const accountJson = accounts ? JSON.parse(accounts) : {};
    accountJson[uid] = accountDetial;
    window.sessionStorage.setItem(
      this.SESSION_STORAGE_KEY,
      JSON.stringify(accountJson)
    );
  }

  /**
   * Call Link Third Party Platform API
   * TODO: Specify the API document url
   *
   * @param platform The Platform that you want to link GarnBarn Account
   * @param credential Each platform required diffrient credential, Please follow the API document strictly.
   * @returns The Promise of AxiosResponse in fulled state.
   */
  linkAccount(
    platform: SupportThirdPartyPlatform,
    credential: AnyJson
  ): Promise<AxiosResponse> {
    const body = {
      platform: platform,
      credential: credential,
    };
    return this.sendRequest("POST", `${this.API_BASE_URL}/link/`, body);
  }

  /**
   * Call Unlink Third Party Platform API
   * TODO: Specify the API document url
   *
   * @param platform The Platform that you want to unlink GarnBarn Account
   * @returns The Promise of AxiosResponse in fulled state.
   */
  unlinkAccount(platform: SupportThirdPartyPlatform): Promise<AxiosResponse> {
    const body = {
      platform: platform,
    };
    return this.sendRequest("POST", `${this.API_BASE_URL}/unlink/`, body);
  }

  compromsiedpassword(hasdedPassword: string) {
    const body = {
      hashedPassword: hasdedPassword,
    };
    return this.sendRequest("POST", `${this.API_BASE_URL}/compromised/`, body);
  }

  updateConsent(selected: boolean) {
    const body = {
      consent: selected,
    };
    return this.sendRequest("POST", `${this.API_BASE_URL}/consent`, body);
  }

}
