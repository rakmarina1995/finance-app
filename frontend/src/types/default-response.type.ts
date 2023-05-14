export type DefaultResponseType = {
    error: boolean,
    message: string,
    validation?:ValidationResponseType[]
}
export type ValidationResponseType={
    key:string,
    message:string
}