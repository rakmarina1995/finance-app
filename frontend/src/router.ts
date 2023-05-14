import {Sidebar} from "./components/sidebar";
import {Main} from "./components/main";
import {Form} from "./components/form";
import {Auth} from "./services/auth";
import {Operations} from "./components/operations";
import {OperationEdit} from "./components/operation-edit";
import {OperationCreate} from "./components/operation-create";
import {CategoryCreate} from "./components/category-create";
import {CategoryEdit} from "./components/category-edit";
import {Category} from "./components/category";
import {RouteType} from "./types/route.type";

export class Router {
    readonly contentElement: HTMLElement | null;
    readonly stylesElement: HTMLElement | null;
    readonly titleElement: HTMLElement | null;
    private routes: RouteType[];

    constructor() {
        this.contentElement = document.getElementById('content');
        this.stylesElement = document.getElementById('styles');
        this.titleElement = document.getElementById('page-title');

        this.routes = [
            {
                route: '#/login',
                title: 'Войти в систему',
                template: 'templates/login.html',
                styles: 'styles/login.css',
                load: () => {
                    new Form('login');
                }
            },
            {
                route: '#/signup',
                title: 'Регистрация',
                template: 'templates/signup.html',
                styles: 'styles/login.css',
                load: () => {
                    new Form('signup');
                }
            },
            {
                route: '#/main',
                title: 'Главная',
                template: 'templates/main.html',
                styles: 'styles/main.css',
                load: () => {
                    new Sidebar();
                    new Main();
                }
            },
            {
                route: '#/income',
                title: 'Доходы',
                template: 'templates/income.html',
                styles: 'styles/income.css',
                load: () => {
                    new Sidebar();
                    new Category();
                }
            },
            {
                route: '#/income/edit',
                title: 'Редактирование категории доходов',
                template: 'templates/income-edit.html',
                styles: 'styles/income.css',
                load: () => {
                    new Sidebar();
                    new CategoryEdit();
                }
            },
            {
                route: '#/income/create',
                title: 'Создание категории доходов',
                template: 'templates/income-create.html',
                styles: 'styles/income.css',
                load: () => {
                    new Sidebar();
                    new CategoryCreate();
                }
            },
            {
                route: '#/expense',
                title: 'Расходы',
                template: 'templates/expense.html',
                styles: 'styles/expense.css',
                load: () => {
                    new Sidebar();
                    new Category();
                }
            },
            {
                route: '#/expense/edit',
                title: 'Редактирование категории расходов',
                template: 'templates/expense-edit.html',
                styles: 'styles/expense.css',
                load: () => {
                    new Sidebar();
                    new CategoryEdit();
                }
            },
            {
                route: '#/expense/create',
                title: 'Cоздание категории расходов',
                template: 'templates/expense-create.html',
                styles: 'styles/expense.css',
                load: () => {
                    new Sidebar();
                    new CategoryCreate();
                }
            },
            {
                route: '#/operations',
                title: 'Доходы и расходы',
                template: 'templates/operations.html',
                styles: 'styles/operations.css',
                load: () => {
                    new Sidebar();
                    new Operations();
                }
            },
            {
                route: '#/operations/edit',
                title: 'Редактирование дохода/расхода',
                template: 'templates/operations-edit.html',
                styles: 'styles/operations.css',
                load: () => {
                    new Sidebar();
                    new OperationEdit();
                }
            },
            {
                route: '#/operations/create',
                title: 'Создание дохода/расхода',
                template: 'templates/operations-create.html',
                styles: 'styles/operations.css',
                load: () => {
                    new Sidebar();
                    new OperationCreate();
                }
            }

        ]
    }

    public async openRoute(): Promise<void> {
        const urlRoute: string = window.location.hash.split('?')[0];
        if (urlRoute === '#/logout') {
            const result: boolean = await Auth.logout();
            if (result) {
                window.location.href = '#/login';
                return;
            }

        }
        const newRoute: RouteType | undefined = this.routes.find(item => item.route === urlRoute);
        if (!newRoute) {
            window.location.href = '#/login';
            return;
        }
        if (!this.contentElement || !this.stylesElement || !this.titleElement) {
            if (urlRoute === '#/') {
                return;
            } else {
                window.location.href = '#/';
                return;
            }
        }
        this.contentElement.innerHTML = await fetch(newRoute.template).then(response => response.text());
        this.stylesElement.setAttribute('href', newRoute.styles);
        this.titleElement.innerText = newRoute.title;

        newRoute.load();
    }
}