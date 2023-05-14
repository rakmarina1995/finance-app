import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Chart} from "chart.js/auto";
import {PieController} from "chart.js/auto";
import {ArcElement} from "chart.js/auto";
import {Colors} from 'chart.js';
import {OperationResponseType} from "../types/operation-response.type";
import {CategoryResponseType} from "../types/category-response.type";

export class Main {

    private readonly pieExpense: HTMLElement | null;
    private readonly pieIncome: HTMLElement | null;
    private readonly btn: HTMLCollection;
    private readonly interval: HTMLElement | null;
    private readonly dateFrom: HTMLElement | null;
    private dateTo: HTMLElement | null;
    private popup: HTMLElement | null;
    private popupBtnYes: HTMLElement | null;
    private popupBtnNo: HTMLElement | null;
    private incomeOperations: OperationResponseType[] = [];
    private expenseCategories: CategoryResponseType[] | null = null;
    private incomeCategories: CategoryResponseType[] | null = null;
    private chartIncome: Chart | null = null;
    private chartExpense: Chart | null = null;
    private operations: OperationResponseType[] = [];
    private expenseOperations: OperationResponseType[] = [];

    constructor() {
        //.getContext('2d')
        this.pieIncome = document.getElementById('income-pie');
        this.pieExpense = document.getElementById('expense-pie');
        this.btn = document.getElementsByClassName('filter-btn');
        this.interval = document.getElementById('interval');
        this.dateFrom = document.getElementById('date-from');
        this.dateTo = document.getElementById('date-to');
        this.popup = document.getElementById('wrapper-popup');
        this.popupBtnYes = document.getElementById('popup-btn-yes');
        this.popupBtnNo = document.getElementById('popup-btn-no');
        this.init();
    }

    init() {
        $('.filter-btn').click((e) => {
            $('.filter-btn').removeClass('chosen-filter');
            e.target.classList.toggle('chosen-filter');
        });

        this.getOperations();
        if (this.btn) {
            for (let i = 0; i < this.btn.length - 1; i++) {
                (this.btn[i] as HTMLInputElement).onclick = (e) => {
                    if (this.btn) {
                        let id: string | null = this.btn[i].getAttribute('id');
                        if (id) {
                            this.clearPie();
                            this.getOperations(id);
                        }
                    }

                }
            }
        }
        if (this.interval) {
            this.interval.onclick = () => {
                if (!(this.dateFrom as HTMLInputElement).value) {
                    (this.dateFrom as HTMLInputElement).style.borderBottom = "1px solid red";
                }
                if (!(this.dateTo as HTMLInputElement).value) {
                    (this.dateTo as HTMLInputElement).style.borderBottom = "1px solid red";
                }
                if (this.dateFrom) {
                    this.dateFrom.onchange = () => {
                        (this.dateFrom as HTMLInputElement).style.borderBottom = "1px solid transparent";
                        if ((this.dateFrom as HTMLInputElement).value && (this.dateTo as HTMLInputElement).value) {
                            if (this.interval) {
                                let id: string | null = this.interval.getAttribute('id');
                                if (id) {
                                    this.clearPie();
                                    this.getOperations(id);
                                }

                            }

                        }

                    }
                }

                (this.dateTo as HTMLInputElement).onchange = () => {
                    (this.dateTo as HTMLInputElement).style.borderBottom = "1px solid transparent";
                    if ((this.dateFrom as HTMLInputElement).value && (this.dateTo as HTMLInputElement).value) {
                        if (this.interval) {
                            let id: string | null = this.interval.getAttribute('id');
                            if (id) {
                                this.clearPie();
                                this.getOperations(id);
                            }

                        }

                    }
                }


            }
        }

    }

    private async getOperations(filter: string | null = null): Promise<void> {
        const dateFrom: HTMLElement | null = document.getElementById('date-from');
        const dateTo: HTMLElement | null = document.getElementById('date-to');
        if (filter === 'interval') {
            filter = "interval&dateFrom=" + (dateFrom as HTMLInputElement).value + "&dateTo=" + (dateTo as HTMLInputElement).value;
        }

        try {
            const result: OperationResponseType[] = await CustomHttp.request(config.host + '/operations' + (filter ? '?period=' + filter : ''));
            if (result) {
                this.operations = result;
                this.incomeOperations = this.operations.filter(item => item.type === 'income');
                this.expenseOperations = this.operations.filter(item => item.type === 'expense');
                await this.getCategories('income');
                await this.getCategories('expense');

            }
        } catch (error) {
            console.log(error);
            return;
        }
    }

    private async getCategories(type: string): Promise<void> {
        try {
            const result: CategoryResponseType [] = await CustomHttp.request(config.host + '/categories/' + type);
            if (result) {
                if (type === 'income') {
                    this.incomeCategories = result;
                    this.getData(type, this.incomeCategories, this.incomeOperations);
                }
                if (type === 'expense') {
                    this.expenseCategories = result;
                    this.getData(type, this.expenseCategories, this.expenseOperations);
                }


            }
        } catch (error) {
            console.log(error);
            return;
        }
    }

    private getData(type: string, categories: CategoryResponseType[], operations: OperationResponseType[]): void {
        let valueArray: Array<number> = [], labelArray: Array<string> = [];
        categories.forEach(item => {
            let allOperationsOfCategory = operations.filter(operation => operation.category === item.title);
            let value = allOperationsOfCategory.reduce((total: number, element: OperationResponseType) => {
                return total + element.amount;
            }, 0);

            if (value) {
                valueArray.push(value);
                labelArray.push(item.title);
            }
        });
        this.showPie(type, valueArray, labelArray);
    }


    private showPie(type: string, values: Array<number>, labels: Array<string>): void {
        const data = {
            labels: labels,
            datasets: [{
                label: 'Сумма',
                data: values,
                backgroundColor: [
                    '#DC3545',
                    '#FD7E14',
                    '#FFC107',
                    '#20C997',
                    '#0D6EFD'
                ],
                hoverOffset: 4
            }]
        };
        const config: any = {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    colors: {
                        forceOverride: true,
                    }
                }
            },
        };
        Chart.register(PieController);
        Chart.register(ArcElement);
        // @ts-ignore
        Chart.register(Colors);
        if (type === 'income') {
            this.chartIncome = new Chart((this.pieIncome as HTMLCanvasElement), config);
        }
        if (type === 'expense') {
            this.chartExpense = new Chart((this.pieExpense as HTMLCanvasElement), config);
        }

    }


    private clearPie(): void {
        if (this.chartIncome) {
            this.chartIncome.destroy();
        }
        if (this.chartExpense) {
            this.chartExpense.destroy();
        }


    }


}
