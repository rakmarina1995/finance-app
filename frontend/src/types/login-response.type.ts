import {TokenType} from "./refresh-response.type";

export type LoginResponseType={
    tokens: TokenType,
    user: {
        name: string
        lastName: string,
        id: number,
    },
}