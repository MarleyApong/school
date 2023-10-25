import axios from "axios";
import { account_service } from "./account_service";

const Axios  = axios.create ({
    baseURL: 'http://localhost:8081/produit-service-0.0.1-SNAPSHOT/',
    withCredentials: false,
})

// Intercepteur du token
Axios.interceptors.request.use(request => {
    if (account_service.isLogged()) {
        const token = JSON.parse(localStorage.getItem('lkiy-'))
        request.headers.Authorization = 'Bearer ' + token[0].kenkihhgczasxmnv
    }
    else if (account_service.isLoggedAdmin()) {
        const token = JSON.parse(localStorage.getItem('kfx|+rf'))
        request.headers.Authorization = 'Bearer ' + token[0].kenkihhgczasxmnv
    }
    return request
})

export default Axios