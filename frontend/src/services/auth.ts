import config from "../../config/config";
import {RefreshResponseType, TokenType} from "../types/refresh-response.type";
import {DefaultResponseType} from "../types/default-response.type";
import {UserInfoType} from "../types/user-info.type";

export class Auth {
    public static accessTokenKey: string = 'accessToken';
    public static refreshTokenKey: string = 'refreshToken';
    public static userInfoKey: string = 'userInfo';

    public static async processUnauthorizedResponse(): Promise<boolean> {
        const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
        if (refreshToken) {
            const response: Response = await fetch(config.host + '/refresh', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({refreshToken: refreshToken})
            });
            if (response && response.status === 200) {
                const result: RefreshResponseType | DefaultResponseType = await response.json();
                if (result) {
                    if ((result as DefaultResponseType).error!==undefined){
                        throw new Error((result as DefaultResponseType).message)
                        }
                    if ((result as RefreshResponseType).tokens && (result as RefreshResponseType).tokens.accessToken && (result as RefreshResponseType).tokens.refreshToken) {
                        this.setTokens((result as RefreshResponseType).tokens.accessToken, (result as RefreshResponseType).tokens.refreshToken);
                        return true;
                    }
                }

            }
        }
        this.removeTokens();
        location.href = '#/login';
        return false;
    }

    public static async logout(): Promise<boolean> {
        const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
        if (refreshToken) {
            const response: Response = await fetch(config.host + '/logout', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({refreshToken: refreshToken})
            });
            if (response && response.status === 200) {
                const result: DefaultResponseType = await response.json();
                if (result && !result.error) {
                    this.removeTokens();
                    localStorage.removeItem(Auth.userInfoKey);
                    return true;
                }

            }
        }
        return false;
    }

    public static setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }

    public static removeTokens(): void {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
    }

    public static setUserInfo(info: UserInfoType): void {
        localStorage.setItem(this.userInfoKey, JSON.stringify(info));
    }

    public static getUserInfo(): UserInfoType | null {
        const userInfo = localStorage.getItem(this.userInfoKey);
        if (userInfo) {
            return JSON.parse(userInfo);
        }
        return null;
    }
}