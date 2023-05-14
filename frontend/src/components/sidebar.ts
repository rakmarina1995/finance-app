import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Auth} from "../services/auth";
import {UserInfoType} from "../types/user-info.type";
import {BalanceResponseType} from "../types/balance-response.type";

export class Sidebar {
    readonly category: HTMLElement | null;
    readonly arrow: HTMLElement | null;
    readonly navItemOptions: HTMLElement | null;
    readonly balance: HTMLElement | null;
    readonly user: HTMLElement | null;
    readonly userInfo: UserInfoType | null;


    constructor() {
        this.category = document.getElementById('category');
        this.arrow = document.getElementById('arrow');
        this.navItemOptions = document.getElementById('nav-item-options');
        this.balance = document.getElementById('balance');
        this.user = document.getElementById('user');
        this.userInfo = Auth.getUserInfo();
        this.init();
    }

    private async init(): Promise<void> {
        await this.getBalance();
        if (this.user && this.userInfo && this.userInfo.fullName) {
            this.user.innerText = this.userInfo.fullName;
        }
        if (this.category) {
            this.category.onclick = (e) => {
                if (this.arrow && this.navItemOptions) {
                    this.arrow.classList.toggle('arrow-rotate');
                    this.navItemOptions.classList.toggle('show');
                }


            }
        }

    }

    private async getBalance(): Promise<void> {
        try {
            const result: BalanceResponseType = await CustomHttp.request(config.host + '/balance');
            if (result) {
                if (this.balance) {
                    this.balance.innerText = result.balance + '$';
                }

            }
        } catch (error) {
            return console.log(error);
        }
    }

   public async updateBalance(newBalance:number):Promise<void> {
        try {
            const result:BalanceResponseType = await CustomHttp.request(config.host + '/balance', 'PUT', {
                newBalance: newBalance,
            });
            if (result) {
                if (this.balance){
                    this.balance.innerText = result.balance + '$';
                }

            }
        } catch (error) {
             console.log(error);
            return;
        }
    }

}