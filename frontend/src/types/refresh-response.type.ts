export type RefreshResponseType = {
    tokens: TokenType
}
export type TokenType = {
    accessToken: string,
    refreshToken: string
}