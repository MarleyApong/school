import Axios from "./caller_service"

const login = (login, password) => {
   return Axios.post('/api/auth/sign-in', {login, password})
}

export const authentification = {
   login
}