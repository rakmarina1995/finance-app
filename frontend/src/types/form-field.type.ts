export type FormFieldType ={
    name: string,
    element: HTMLInputElement | null,
    id: string,
    regex: RegExp,
    valid: boolean
}