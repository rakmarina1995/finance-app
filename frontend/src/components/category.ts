import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {CategoryResponseType} from "../types/category-response.type";
import {DefaultResponseType} from "../types/default-response.type";

export class Category {
    readonly typeCategory: string;
    readonly categoryItems: HTMLElement | null;
    readonly popup: HTMLElement | null;
    readonly popupBtnYes: HTMLElement | null;
    readonly popupBtnNo: HTMLElement | null;
    private categories: CategoryResponseType[] =[];


    constructor() {
        this.typeCategory = window.location.hash.split('/')[1];
        this.categoryItems = document.getElementById('categories-items');
        this.popup = document.getElementById('wrapper-popup');
        this.popupBtnYes = document.getElementById('popup-btn-yes');
        this.popupBtnNo = document.getElementById('popup-btn-no');
        this.init();
    }

    private async init(): Promise<void> {
        try {
            const result: CategoryResponseType[] = await CustomHttp.request(config.host + '/categories/' + this.typeCategory);
            if (result) {
                this.categories = result;
                this.showCategories();
            }
        } catch (error) {
            console.log(error);
            return;
        }

    }

    private showCategories(): void {
        this.categories.forEach((item: CategoryResponseType) => {
            const wrapperElement: HTMLElement | null = document.createElement('div');
            wrapperElement.className = 'col-sm-4';
            const cardElement: HTMLElement | null = document.createElement('div');
            cardElement.className = 'card';
            const cardBodyElement: HTMLElement | null = document.createElement('div');
            cardBodyElement.className = 'card-body';
            const cardTitleElement: HTMLElement | null = document.createElement('h5');
            cardTitleElement.className = 'card-title';
            cardTitleElement.innerText = item.title;
            const editBtnElement: HTMLElement | null = document.createElement('a');
            editBtnElement.setAttribute('href', '#/' + this.typeCategory + '/edit?id=' + item.id);
            editBtnElement.className = 'btn';
            editBtnElement.classList.add('btn-edit');
            editBtnElement.classList.add('btn-primary');
            editBtnElement.innerText = 'Редактировать';
            const deleteBtnElement: HTMLElement | null = document.createElement('button');
            deleteBtnElement.setAttribute('id', 'delete-category');
            deleteBtnElement.className = 'btn';
            deleteBtnElement.classList.add('btn-delete');
            deleteBtnElement.innerText = 'Удалить';
            cardBodyElement.appendChild(cardTitleElement);
            cardBodyElement.appendChild(editBtnElement);
            cardBodyElement.appendChild(deleteBtnElement);
            cardElement.appendChild(cardBodyElement);
            wrapperElement.appendChild(cardElement);
            if (this.categoryItems) {
                this.categoryItems.appendChild(wrapperElement);
            }

            deleteBtnElement.onclick = () => {
                if (this.popup) {
                    this.popup.style.display = 'block';
                }
                if (this.popupBtnNo) {
                    this.popupBtnNo.onclick = () => {
                        window.location.href = '#/' + this.typeCategory;
                    }
                }
                if (this.popupBtnYes) {
                    this.popupBtnYes.onclick = () => {
                        this.deleteCategory(item.id);
                    }
                }

            }


        })
        const wrapperElement :HTMLElement | null= document.createElement('div');
        wrapperElement.className = 'col-sm-4';
        const cardElement :HTMLElement | null= document.createElement('div');
        cardElement.className = 'card';
        const cardBodyElement:HTMLElement | null = document.createElement('div');
        cardBodyElement.className = 'card-body';
        const addCategoryElement :HTMLElement | null= document.createElement('a');
        addCategoryElement.setAttribute('href', '#/' + this.typeCategory + '/create');
        addCategoryElement.setAttribute('id', 'create-category');
        addCategoryElement.className = 'add-card';
        addCategoryElement.innerText = '+';
        cardBodyElement.appendChild(addCategoryElement);
        cardElement.appendChild(cardBodyElement);
        wrapperElement.appendChild(cardElement);
        if (this.categoryItems){
            this.categoryItems.appendChild(wrapperElement);
        }

    }

   private async deleteCategory(id:number):Promise<void> {
        try {
            const result :DefaultResponseType= await CustomHttp.request(config.host + '/categories/' + this.typeCategory + '/' + id, 'DELETE');
            if (result) {
                if (result.error) {
                    throw new Error(result.message);
                }
                window.location.href = '#/' + this.typeCategory;
            }
        } catch (error) {
            console.log(error);
        }
    }

}