import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {DefaultResponseType} from "../types/default-response.type";
import {CategoryResponseType} from "../types/category-response.type";

export class CategoryCreate {
    readonly category: string;
    readonly newCategory: HTMLElement | null;
    readonly createCategoryBtn: HTMLElement | null;
    readonly cancelBtn: HTMLElement | null;


    constructor() {
        this.category = window.location.hash.split('/')[1];
        this.newCategory = document.getElementById('new-category');
        this.createCategoryBtn = document.getElementById('create-category');
        this.cancelBtn = document.getElementById('cancel');
        this.init();
    }

    private init(): void {
        if (this.cancelBtn) {
            this.cancelBtn.onclick = () => {
                window.location.href = '#/' + this.category;
            }
        }
        if (this.createCategoryBtn) {
            this.createCategoryBtn.onclick = () => {
                if (this.newCategory) {
                    if ((this.newCategory as HTMLInputElement).value) {
                        this.createCategory((this.newCategory as HTMLInputElement).value);
                    } else {
                        this.newCategory.style.borderColor = 'red';
                    }
                }

            }
        }

    }

   private async createCategory(category:string):Promise<void> {
        try {
            const result:DefaultResponseType | CategoryResponseType = await CustomHttp.request(config.host + '/categories/' + this.category, 'POST', {
                title: category
            });
            if (result) {
                if ((result as DefaultResponseType).error!==undefined) {
                    throw new Error((result as DefaultResponseType).message);
                }
                window.location.href = '#/' + this.category;
            }
        } catch (error) {
            if (this.newCategory){
                this.newCategory.style.borderColor = 'red';
            }
            console.log(error);
        }
    }

}