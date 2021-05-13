import { GeneralTrace } from '@voiceflow/general-types';
import { AxiosRequestConfig } from 'axios';

import HttpClient from './http-client';
import DialogManagerBody from './types';

export default class DialogManagerApi extends HttpClient {
  private static classInstance?: DialogManagerApi;

  private authorization: string;

  private versionID: string;

  private userID: string;

  public constructor(endpoint: string, auhtorization: string, versionID: string, userID: string) {
    super(endpoint);
    this.authorization = auhtorization;
    this.versionID = versionID;
    this.userID = userID;

    this._initializeRequestInterceptor();
  }

  public static getInstance(endpoint: string, auhtorization: string, versionID: string, userID: string) {
    if (!this.classInstance) {
      this.classInstance = new DialogManagerApi(endpoint, auhtorization, versionID, userID);
    }

    return this.classInstance;
  }

  private _initializeRequestInterceptor = () => {
    this.instance!.interceptors.request.use(this._handleRequest, this._handleError);
  };

  private _handleRequest = (config: AxiosRequestConfig) => {
    config.headers.Authorization = this.authorization;

    return config;
  };

  protected _handleError = (error: any) => Promise.reject(error);

  public doInteraction = (body: DialogManagerBody) =>
    this.instance.post<GeneralTrace[]>(`/state/${this.versionID}/user/${this.userID}/interact`, body);

  public doDeleteStatus = () => this.instance.delete<GeneralTrace[]>(`/state/${this.versionID}/user/${this.userID}`);
}
