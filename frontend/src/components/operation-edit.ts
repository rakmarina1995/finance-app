import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Sidebar} from "./sidebar";
import {CategoryResponseType} from "../types/category-response.type";
import {DefaultResponseType} from "../types/default-response.type";
import {OperationResponseType} from "../types/operation-response.type";

export class OperationEdit {
    private balanceElement: HTMLElement | null;
    private idOperation: string = window.location.hash.split('=')[1];
    private typeOperation: HTMLElement | null;
    readonly categoryOperation: HTMLElement | null;
    private amountOperation: HTMLElement | null;
    private dateOperation: HTMLElement | null;
    private commentOperation: HTMLElement | null;
    readonly saveBtn: HTMLElement | null;
    readonly cancelBtn: HTMLElement | null;
    private idCategory: null;
    private sidebar: Sidebar;
    private categories: CategoryResponseType[] | null = null;
    private balance: number = 0;


    constructor() {
        this.sidebar = new Sidebar();
        this.typeOperation = document.getElementById('select-type');
        this.categoryOperation = document.getElementById('select-category');
        this.amountOperation = document.getElementById('operation-amount');
        this.dateOperation = document.getElementById('operation-date');
        this.commentOperation = document.getElementById('operation-comment');
        this.saveBtn = document.getElementById('save');
        this.cancelBtn = document.getElementById('cancel');
        this.idCategory = null;
        this.balanceElement = document.getElementById('balance');
        this.init();
    }

    private async init(): Promise<void> {
        try {
            const result: DefaultResponseType | OperationResponseType = await CustomHttp.request(config.host + '/operations/' + this.idOperation);
            if (result) {
                if ((result as DefaultResponseType).error !== undefined) {
                    throw new Error((result as DefaultResponseType).message);
                }
                if ((result as OperationResponseType).type && (result as OperationResponseType).category &&
                    (result as OperationResponseType).date && (result as OperationResponseType).amount && (result as OperationResponseType).comment) {
                    await this.getCategories((result as OperationResponseType).type, (result as OperationResponseType).category);
                    (this.typeOperation as HTMLOptionElement).value = (result as OperationResponseType).type;
                    (this.amountOperation as HTMLInputElement).value = ((result as OperationResponseType).amount).toString();
                    (this.dateOperation as HTMLInputElement).value = (result as OperationResponseType).date.toString();
                    (this.commentOperation as HTMLInputElement).value = (result as OperationResponseType).comment;
                    if ((result as OperationResponseType).type === 'income' && this.balanceElement) {
                        this.balance = parseInt(this.balanceElement.innerText);
                        this.balance -= Number((result as OperationResponseType).amount);
                    } else if ((result as OperationResponseType).type === 'expense' && this.balanceElement) {
                        this.balance = parseInt(this.balanceElement.innerText);
                        this.balance += Number((result as OperationResponseType).amount);
                    }

                }

            }
        } catch (error) {
            console.log(error);
        }
        if (this.saveBtn) {
            this.saveBtn.onclick = () => {
                this.getIdCategory((this.typeOperation as HTMLOptionElement).value, (this.categoryOperation as HTMLOptionElement).value);
            }
        }
        if (this.cancelBtn) {
            this.cancelBtn.onclick = () => {
                window.location.href = '#/operations';
            }
        }

    }

    private async getCategories(type: string, category: string): Promise<void> {
        try {
            const result: CategoryResponseType[] = await CustomHttp.request(config.host + '/categories/' + type);
            if (result) {
                this.categories = result;
                this.showCategories(category);
            }
        } catch (error) {
            console.log(error);
        }
    }

    private showCategories(category: string): void {
        const categoryOptions: HTMLOptionsCollection = (this.categoryOperation as HTMLSelectElement).options;
        categoryOptions.length = 1;
        if (!this.categories) {
            return;
        }
        this.categories.forEach((item: CategoryResponseType) => {
            const optionElement: HTMLOptionElement | null = document.createElement('option');
            optionElement.className = 'category-option';
            optionElement.setAttribute('name', 'category');
            optionElement.setAttribute('value', item.title);
            if (optionElement.value === category) {
                optionElement.selected = true;
            }
            optionElement.innerText = item.title;
            if (this.categoryOperation) {
                this.categoryOperation.appendChild(optionElement);
            }

        })
    }

    private async getIdCategory(type: string, categoryValue: string): Promise<void> {
        try {
            const result: CategoryResponseType[] = await CustomHttp.request(config.host + '/categories/' + type);
            if (result) {
                const allCategories: CategoryResponseType[] = result;
                const category: CategoryResponseType | undefined = allCategories.find((item: CategoryResponseType) => {
                    return item.title === categoryValue;
                });
                if (category && category.id) {
                    await this.editOperation(category.id);
                }

            }
        } catch (error) {
            console.log(error);
            return;
        }
    }

    private async editOperation(categoryId: number): Promise<void> {

        try {
            const result: DefaultResponseType | OperationResponseType = await CustomHttp.request(config.host + '/operations/' + this.idOperation, 'PUT', {
                type: (this.typeOperation as HTMLSelectElement).value,
                amount: (this.amountOperation as HTMLInputElement).value,
                date: (this.dateOperation as HTMLInputElement).value,
                comment: (this.commentOperation as HTMLInputElement).value,
                category_id: categoryId,
            });
            if (result) {
                if ((result as DefaultResponseType).error !== undefined) {
                    throw new Error((result as DefaultResponseType).message);
                }
                if ((result as OperationResponseType).amount && (result as OperationResponseType).type &&
                    (result as OperationResponseType).category && (result as OperationResponseType).amount && (result as OperationResponseType).date
                    && (result as OperationResponseType).comment) {
                    if ((result as OperationResponseType).type === 'income') {
                        await this.sidebar.updateBalance(this.balance+Number((result as OperationResponseType).amount));
                    }
                    if ((result as OperationResponseType).type === 'expense') {
                        await this.sidebar.updateBalance(this.balance-Number((result as OperationResponseType).amount));
                    }
                }

                window.location.href = '#/operations';
            }
        } catch (error) {
            console.log(error);
        }
    }


}