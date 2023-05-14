import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Sidebar} from "./sidebar";
import {CategoryResponseType} from "../types/category-response.type";
import {OperationResponseType} from "../types/operation-response.type";
import {DefaultResponseType} from "../types/default-response.type";

export class OperationCreate {
    private type: string = window.location.hash.split('=')[1];
    private values: HTMLCollectionOf<Element>;
    readonly typeOperation: HTMLElement | null;
    private categoryOperation: HTMLElement | null;
    private amountOperation: HTMLElement | null;
    private dateOperation: HTMLElement | null;
    private commentOperation: HTMLElement | null;
    readonly saveBtn: HTMLElement | null;
    readonly cancelBtn: HTMLElement | null;
    private sidebar: Sidebar;
    private categories: CategoryResponseType[] = [];

    constructor() {
        this.values = document.getElementsByClassName('input');
        this.typeOperation = document.getElementById('select-type');
        this.categoryOperation = document.getElementById('select-category');
        this.amountOperation = document.getElementById('operation-amount');
        this.dateOperation = document.getElementById('operation-date');
        this.commentOperation = document.getElementById('operation-comment');
        this.saveBtn = document.getElementById('save');
        this.cancelBtn = document.getElementById('cancel');
        this.sidebar = new Sidebar();
        this.init();
    }

    private init(): void {
        if (this.type) {
            (this.typeOperation as HTMLInputElement).value = this.type;

        }
        if ((this.typeOperation as HTMLSelectElement).options[(this.typeOperation as HTMLSelectElement).selectedIndex].value) {
            this.type = (this.typeOperation as HTMLSelectElement).options[(this.typeOperation as HTMLSelectElement).selectedIndex].value;
            this.getCategories();
        }
        (this.typeOperation as HTMLSelectElement).onchange = (e) => {
            if ((this.typeOperation as HTMLSelectElement).options[(this.typeOperation as HTMLSelectElement).selectedIndex].value) {
                this.type = (this.typeOperation as HTMLSelectElement).options[(this.typeOperation as HTMLSelectElement).selectedIndex].value;
                this.getCategories();
            }

        }
        if (this.saveBtn) {
            this.saveBtn.onclick = () => {
                for (let i = 0; i < this.values.length; i++) {
                    if (!((this.values[i] as HTMLInputElement).value)) {
                        (this.values[i] as HTMLInputElement).style.borderColor = "red";
                    } else {
                        (this.values[i] as HTMLInputElement).style.borderColor = "#CED4DA";
                    }
                }
                if (this.type && (this.categoryOperation as HTMLInputElement).value && (this.amountOperation as HTMLInputElement).value && (this.dateOperation as HTMLInputElement).value && (this.commentOperation as HTMLInputElement).value) {
                    this.createOperation(this.type);
                }

            }
        }
        if (this.cancelBtn) {
            this.cancelBtn.onclick = () => {
                window.location.href = '#/operations';

            }
        }

    }

    private async getCategories(): Promise<void> {
        try {
            const result: CategoryResponseType[] = await CustomHttp.request(config.host + '/categories/' + this.type);
            if (result) {
                this.categories = result;
                this.showCategories();
            }
        } catch (error) {
            console.log(error);
        }
    }

    private showCategories(): void {
        const categoryOptions = (this.categoryOperation as HTMLSelectElement).options;
        categoryOptions.length = 1;

        this.categories.forEach(item => {
            const optionElement: HTMLOptionElement | null = document.createElement('option');
            optionElement.className = 'category-option';
            optionElement.setAttribute('name', 'category');
            optionElement.setAttribute('value', item.title);
            optionElement.innerText = item.title;
            (this.categoryOperation as HTMLSelectElement).appendChild(optionElement);
        })
    }

    private async createOperation(type: string): Promise<void> {
        const balanceElement: HTMLElement | null = document.getElementById('balance');
        let balance: number = 0;
        if (balanceElement) {
            balance = parseInt(balanceElement.innerText);
        }
        const category_id: CategoryResponseType | undefined = this.categories.find(item => item.title === (this.categoryOperation as HTMLSelectElement).value);
        if (type && category_id && category_id.id && (this.amountOperation as HTMLInputElement).value && (this.dateOperation as HTMLInputElement).value && (this.commentOperation as HTMLInputElement).value) {
            try {
                const result: OperationResponseType | DefaultResponseType = await CustomHttp.request(config.host + '/operations', 'POST', {
                    type: type,
                    amount: Number((this.amountOperation as HTMLInputElement).value),
                    date: (this.dateOperation as HTMLInputElement).value,
                    comment: (this.commentOperation as HTMLInputElement).value,
                    category_id: category_id.id
                });

                if (result) {
                    if ((result as DefaultResponseType).error !== undefined) {
                        throw new Error((result as DefaultResponseType).message);
                    }

                    if (type === 'income') {
                       await this.sidebar.updateBalance(balance + (result as OperationResponseType).amount);
                    }
                    if (type === 'expense') {
                       await this.sidebar.updateBalance(balance - (result as OperationResponseType).amount);
                    }
                    window.location.href = '#/operations';
                }
            } catch (error) {
                for (let i = 0; i < this.values.length; i++) {
                    (this.values[i] as HTMLInputElement).style.borderColor = "red";
                }
                console.log(error);
            }
        } else {

            console.log('Необходимо заполнить все поля!');
        }

    }


}