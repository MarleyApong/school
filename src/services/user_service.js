import Axios from "./caller_service";

const getAll = () => {
   return Axios.get('/api/v1.0/users')
}

const signUp = (user) => {
   return Axios.post('/api/auth/sign-up', user)
}

const changeStatus = (id, status) => {
   return Axios.get(`/api/v1.0/users/lockAndUnlockAccount/${id}/${status}`)
}

const deleteUser = (id) => {
   return Axios.delete(`/api/v1.0/users/${id}`)
}

export const user_service = {
   getAll,
   signUp,
   changeStatus,
   deleteUser
}