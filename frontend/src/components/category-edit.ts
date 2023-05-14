import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {CategoryResponseType} from "../types/category-response.type";
import {DefaultResponseType} from "../types/default-response.type";

export class CategoryEdit {
    readonly category: string = window.location.hash.split('/')[1];
    private idCategory: string = window.location.hash.split('=')[1];
    readonly categoryName: HTMLElement | null;
    readonly saveBtn: HTMLElement | null;
    readonly cancelBtn: HTMLElement | null;


    constructor() {
        this.categoryName = document.getElementById('category-name');
        this.saveBtn = document.getElementById('save');
        this.cancelBtn = document.getElementById('cancel');
        this.init();
    }

    private async init(): Promise<void> {
        if (this.idCategory) {
            try {
                const result: CategoryResponseType | DefaultResponseType = await CustomHttp.request(config.host + '/categories/' + this.category + '/' + this.idCategory);
                if (result) {
                    if ((result as DefaultResponseType).error !== undefined) {
                        throw new Error((result as DefaultResponseType).message);
                    }
                    if ((result as CategoryResponseType).title && (result as CategoryResponseType).id) {
                        if (this.categoryName) {
                            (this.categoryName as HTMLInputElement).value = (result as CategoryResponseType).title;
                        }

                    }

                }
            } catch (error) {
                console.log(error);
            }
            if (this.saveBtn) {
                this.saveBtn.onclick = () => {
                    if ((this.categoryName as HTMLInputElement).value) {
                        this.editCategory();
                    } else {
                        (this.categoryName as HTMLInputElement).style.borderColor = 'red';
                    }

                }
            }

        } else {
            window.location.href = '#/' + this.category;
        }
        if (this.cancelBtn) {
            this.cancelBtn.onclick = () => {
                window.location.href = '#/' + this.category;
            }
        }

    }

    private async editCategory(): Promise<void> {
        try {
            const result: CategoryResponseType | DefaultResponseType = await CustomHttp.request(config.host + '/categories/' + this.category + '/' + this.idCategory, 'PUT', {
                title: (this.categoryName as HTMLInputElement).value
            });
            if (result) {
                if ((result as DefaultResponseType).error !== undefined) {
                    throw new Error((result as DefaultResponseType).message);
                }
                window.location.href = '#/' + this.category;
            }
        } catch (error) {
            console.log(error);
        }
    }

}