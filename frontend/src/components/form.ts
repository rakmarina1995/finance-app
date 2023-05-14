import {CustomHttp} from "../services/custom-http";
import {Auth} from "../services/auth";
import config from "../../config/config";
import {FormFieldType} from "../types/form-field.type";
import {DefaultResponseType} from "../types/default-response.type";
import {SignupResponseType} from "../types/signup-response.type";
import {LoginResponseType} from "../types/login-response.type";

export class Form {
    readonly page: 'login' | 'signup';
    readonly processElement: HTMLElement | null = null;
    private rememberMe: boolean = false;
    readonly fields: FormFieldType[] = [];


    constructor(page: 'login' | 'signup') {
        this.page = page;
        const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey);
        if (accessToken) {
            location.href = '#/main';
            return;
        }
        this.fields = [
            {
                name: 'email',
                element: null,
                id: 'email',
                regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                valid: false
            },
            {
                name: 'password',
                element: null,
                id: 'password',
                regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                valid: false
            }
        ];
        if (this.page === 'signup') {
            this.fields.unshift({
                    name: 'fullName',
                    element: null,
                    id: 'fullName',
                    regex: /^[А-Я][А-Яа-я]+\s*[А-Я][А-Яа-я]+\s*[А-Я][А-Яа-я]+\s*$/,
                    valid: false
                },
                {
                    name: 'passwordRepeat',
                    element: null,
                    id: 'passwordRepeat',
                    regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                    valid: false
                });
        }
        const that: Form = this;
        this.fields.forEach((item: FormFieldType) => {
            item.element = document.getElementById(item.id) as HTMLInputElement;
            if (item.element) {
                item.element.onchange = function () {
                    that.validateField.call(that, item, <HTMLInputElement>this)
                }
            }

        })

        this.processElement = document.getElementById('process');
        if (this.processElement) {
            this.processElement.onclick = function () {
                that.processForm();
            }
        }

    }

    private validateField(field: FormFieldType, element: HTMLInputElement): void {
        if (!element.value || !element.value.match(field.regex)) {
            if (this.page === 'signup') {
                if (element.name === 'repeatPassword') {
                    const password: FormFieldType | undefined = this.fields.find((item: FormFieldType) => item.name === 'password');
                    if (password && password.element) {
                        if (element.value !== password.element.value) {
                            element.style.borderColor = 'red';
                            field.valid = false;
                        }
                    }

                }
            }
            element.style.borderColor = 'red';
            field.valid = false;
        } else {
            element.removeAttribute('style');
            field.valid = true;
        }
        this.validateForm();
    }

    private validateForm(): boolean {
        const validForm: boolean = this.fields.every(item => item.valid);
        if (this.page === 'login') {
            const rememberMeElement: HTMLElement | null = document.getElementById('rememberMe');
            if (rememberMeElement) {
                this.rememberMe = (rememberMeElement as HTMLInputElement).checked;
            }
        }
        if (this.processElement) {
            if (validForm) {
                this.processElement.removeAttribute('disabled');
            } else {
                this.processElement.setAttribute('disabled', 'disabled');
            }
        }
        return validForm;
    }

    private async processForm(): Promise<void> {
        if (this.validateForm()) {
            const email = this.fields.find(item => item.name === 'email')?.element?.value;
            const password = this.fields.find(item => item.name === 'password')?.element?.value;

            if (this.page === 'signup') {
                try {
                    const result: DefaultResponseType | SignupResponseType = await CustomHttp.request(config.host + '/signup', 'POST', {
                        name: this.fields.find(item => item.name === 'fullName')?.element?.value.split(' ')[0],
                        lastName: this.fields.find(item => item.name === 'fullName')?.element?.value.split(' ')[1],
                        email: email,
                        password: password,
                        passwordRepeat: this.fields.find(item => item.name === 'passwordRepeat')?.element?.value
                    });
                    if (result) {
                        if ((result as DefaultResponseType).error !== undefined) {
                            throw new Error((result as DefaultResponseType).message);
                        }

                    }
                } catch (error) {
                    console.log(error);
                    return;
                }

            }
            try {
                const result: DefaultResponseType | LoginResponseType = await CustomHttp.request(config.host + '/login', 'POST', {
                    email: email,
                    password: password,
                    rememberMe: this.rememberMe
                });
                if (result) {
                    if ((result as DefaultResponseType).error !== undefined) {
                        throw new Error((result as DefaultResponseType).message);
                    }

                    if ((result as LoginResponseType).tokens && (result as LoginResponseType).tokens.accessToken &&
                        (result as LoginResponseType).tokens.refreshToken && (result as LoginResponseType).user &&
                        (result as LoginResponseType).user.id && (result as LoginResponseType).user.lastName && (result as LoginResponseType).user.name) {
                        Auth.setTokens((result as LoginResponseType).tokens.accessToken, (result as LoginResponseType).tokens.refreshToken);
                        if (email){
                            Auth.setUserInfo({
                                fullName: (result as LoginResponseType).user.name + " " + (result as LoginResponseType).user.lastName,
                                userId: (result as LoginResponseType).user.id,
                                email: email
                            });
                        }
                        location.href = '#/main';
                    }

                }
            } catch (error) {
                console.log(error);
            }

        }
    }
}