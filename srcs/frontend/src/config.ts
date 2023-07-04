export const API_END_POINT = "http://localhost:3000"
export const REDIRECT_URI = "http://localhost:8080/login"

export const CLIENT_ID = "u-s4t2ud-bcbd5f2bd7917dd3c51484264704d1fe2c12babdb7ae552b16f69b3492e8d4a5"


export const LOGIN_42_URL =
    "https://api.intra.42.fr/oauth/authorize?client_id=" + CLIENT_ID +
    "&redirect_uri=" + REDIRECT_URI +
    "&response_type=code"
export const QR_ENDPOINT = "/auth/2fa/qr"
export const ENABLE_2FA_ENDPOINT = "/auth/2fa/turn-on"
export const AUTHENTICATE_2FA_ENDPOINT = "/auth/2fa/authenticate"
