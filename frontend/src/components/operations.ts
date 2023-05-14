import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Sidebar} from "./sidebar";
import {OperationResponseType} from "../types/operation-response.type";
import {DefaultResponseType} from "../types/default-response.type";

export class Operations {
    private sidebar: Sidebar;
    readonly table: HTMLElement | null;
    readonly interval: HTMLElement | null;
    readonly dateFrom: HTMLElement | null;
    private dateTo: HTMLElement | null;
    readonly popup: HTMLElement | null;
    private readonly popupBtnYes: HTMLElement | null;
    private readonly popupBtnNo: HTMLElement | null;
    private readonly btn: HTMLCollection | null;
    private operations: OperationResponseType[] | null;

    constructor() {
        this.sidebar = new Sidebar();
        this.table = document.getElementById('table');
        this.btn = document.getElementsByClassName('filter-btn');
        this.interval = document.getElementById('interval');
        this.dateFrom = document.getElementById('date-from');
        this.dateTo = document.getElementById('date-to');
        this.popup = document.getElementById('wrapper-popup');
        this.popupBtnYes = document.getElementById('popup-btn-yes');
        this.popupBtnNo = document.getElementById('popup-btn-no');
        this.operations = null;
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
                                this.getOperations(id);
                            }

                        }

                    }
                }


            }
        }


    }

    private async getOperations(filter: string | null = null): Promise<void> {
        if (this.interval && filter === this.interval.getAttribute('id')) {
            filter = "interval&dateFrom=" + (this.dateFrom as HTMLInputElement).value + "&dateTo=" + (this.dateTo as HTMLInputElement).value;
        }

        try {
            const result: OperationResponseType[] = await CustomHttp.request(config.host + '/operations' + (filter ? '?period=' + filter : ''));
            if (result) {
                this.operations = result;
                this.showOperations();
            }
        } catch (error) {
            console.log(error);
            return;
        }
    }


    private showOperations(): void {
        const table: HTMLCollection | null = document.getElementsByClassName('row');
        for (let i = table.length - 1; i > 0; i--) {
            table[i].remove();
        }

        if (this.operations) {
            this.operations.sort((a:OperationResponseType, b:OperationResponseType) => {
                return a.id - b.id
            });
            this.operations.forEach((item: OperationResponseType) => {
                const rowElement: HTMLElement | null = document.createElement('div');
                rowElement.className = 'row';
                rowElement.classList.add('text-center');
                rowElement.classList.add('row-border');
                const numberElement: HTMLElement | null = document.createElement('div');
                numberElement.className = 'col';
                numberElement.classList.add('fw-bold');
                numberElement.innerText = (item.id).toString();
                const typeElement: HTMLElement | null = document.createElement('div');
                typeElement.className = 'col';
                if (item.type === 'income') {
                    typeElement.classList.add('text-success');
                    typeElement.innerText = 'доход';
                } else {
                    typeElement.classList.add('text-danger');
                    typeElement.innerText = 'расход';
                }
                ;
                const categoryElement: HTMLElement | null = document.createElement('div');
                categoryElement.className = 'col';
                if (item.category) {
                    categoryElement.innerText = item.category;
                } else {
                    categoryElement.innerText = "—";
                }
                const amountElement: HTMLElement | null = document.createElement('div');
                amountElement.className = 'col';
                amountElement.innerText = (item.amount).toString();
                const dateElement: HTMLElement | null = document.createElement('div');
                dateElement.className = 'col';
                dateElement.innerText = (new Date(item.date)).toLocaleDateString();
                const commentElement: HTMLElement | null = document.createElement('div');
                commentElement.className = 'col';
                commentElement.innerText = item.comment;
                const optionsElement: HTMLElement | null = document.createElement('div');
                optionsElement.className = 'col';
                const deleteBtnElement: HTMLElement | null = document.createElement('button');
                deleteBtnElement.className = 'border-0';
                deleteBtnElement.classList.add('bg-transparent');
                deleteBtnElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none" class="me-2">\n' +
                    '                <path d="M4.5 5.5C4.77614 5.5 5 5.72386 5 6V12C5 12.2761 4.77614 12.5 4.5 12.5C4.22386 12.5 4 12.2761 4 12V6C4 5.72386 4.22386 5.5 4.5 5.5Z" fill="black"/>\n' +
                    '                <path d="M7 5.5C7.27614 5.5 7.5 5.72386 7.5 6V12C7.5 12.2761 7.27614 12.5 7 12.5C6.72386 12.5 6.5 12.2761 6.5 12V6C6.5 5.72386 6.72386 5.5 7 5.5Z" fill="black"/>\n' +
                    '                <path d="M10 6C10 5.72386 9.77614 5.5 9.5 5.5C9.22386 5.5 9 5.72386 9 6V12C9 12.2761 9.22386 12.5 9.5 12.5C9.77614 12.5 10 12.2761 10 12V6Z" fill="black"/>\n' +
                    '                <path fill-rule="evenodd" clip-rule="evenodd" d="M13.5 3C13.5 3.55228 13.0523 4 12.5 4H12V13C12 14.1046 11.1046 15 10 15H4C2.89543 15 2 14.1046 2 13V4H1.5C0.947715 4 0.5 3.55228 0.5 3V2C0.5 1.44772 0.947715 1 1.5 1H5C5 0.447715 5.44772 0 6 0H8C8.55229 0 9 0.447715 9 1H12.5C13.0523 1 13.5 1.44772 13.5 2V3ZM3.11803 4L3 4.05902V13C3 13.5523 3.44772 14 4 14H10C10.5523 14 11 13.5523 11 13V4.05902L10.882 4H3.11803ZM1.5 3V2H12.5V3H1.5Z" fill="black"/>\n' +
                    '            </svg>';
                deleteBtnElement.onclick = () => {
                    if (this.popup && this.popupBtnNo && this.popupBtnYes) {
                        this.popup.style.display = 'block';
                        this.popupBtnNo.onclick = () => {
                            window.location.href = '#/operations';
                        }
                        this.popupBtnYes.onclick = () => {
                            this.deleteOperation(item.type, item.id, item.amount);
                        }
                    }

                };
                const editBtnElement: HTMLElement | null = document.createElement('a');
                editBtnElement.className = 'border-0';
                editBtnElement.classList.add('bg-transparent');
                editBtnElement.classList.add('text-decoration-none');
                editBtnElement.setAttribute('href', '#/operations/edit?id=' + item.id);
                editBtnElement.innerHTML = ' <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">\n' +
                    '                <path d="M12.1465 0.146447C12.3417 -0.0488155 12.6583 -0.0488155 12.8536 0.146447L15.8536 3.14645C16.0488 3.34171 16.0488 3.65829 15.8536 3.85355L5.85357 13.8536C5.80569 13.9014 5.74858 13.9391 5.68571 13.9642L0.68571 15.9642C0.500001 16.0385 0.287892 15.995 0.146461 15.8536C0.00502989 15.7121 -0.0385071 15.5 0.0357762 15.3143L2.03578 10.3143C2.06092 10.2514 2.09858 10.1943 2.14646 10.1464L12.1465 0.146447ZM11.2071 2.5L13.5 4.79289L14.7929 3.5L12.5 1.20711L11.2071 2.5ZM12.7929 5.5L10.5 3.20711L4.00001 9.70711V10H4.50001C4.77616 10 5.00001 10.2239 5.00001 10.5V11H5.50001C5.77616 11 6.00001 11.2239 6.00001 11.5V12H6.29291L12.7929 5.5ZM3.03167 10.6755L2.92614 10.781L1.39754 14.6025L5.21903 13.0739L5.32456 12.9683C5.13496 12.8973 5.00001 12.7144 5.00001 12.5V12H4.50001C4.22387 12 4.00001 11.7761 4.00001 11.5V11H3.50001C3.28561 11 3.10272 10.865 3.03167 10.6755Z" fill="black"/>\n' +
                    '            </svg>';
                editBtnElement.onclick = () => {

                };
                optionsElement.appendChild(deleteBtnElement);
                optionsElement.appendChild(editBtnElement);
                rowElement.appendChild(numberElement);
                rowElement.appendChild(typeElement);
                rowElement.appendChild(categoryElement);
                rowElement.appendChild(amountElement);
                rowElement.appendChild(dateElement);
                rowElement.appendChild(commentElement);
                rowElement.appendChild(optionsElement);
                if (this.table) {
                    this.table.appendChild(rowElement);
                }


            })
        }


    }

    private async deleteOperation(type: string, id: number, amount: number): Promise<void> {
        let balance = 0;
        let balanceElement: HTMLElement | null = document.getElementById('balance');
        if (balanceElement) {
            balance = parseInt(balanceElement.innerText);
        }

        try {
            const result: DefaultResponseType = await CustomHttp.request(config.host + '/operations/' + id, 'DELETE');
            if (result) {
                if (result.error) {
                    throw new Error(result.message);
                }
                if (type === 'income') {
                    await this.sidebar.updateBalance(balance - amount);
                }
                if (type === 'expense') {
                    await this.sidebar.updateBalance(balance + amount);
                }

                window.location.href = '#/operations';
            }
        } catch (error) {
            console.log(error);
        }
    }

}