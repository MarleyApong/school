import Axios from "./caller_service";

const getAll = (currentPage, size, order) => {
   return Axios.get(`/api/enseignants?page=${currentPage}&size=${size}&order=${order}`)
}

const getAllshow = (currentPage, size, order) => {
   return Axios.get(`/api/enseignants?page=${currentPage}&size=${size}&order=${order}`)
}

const getOne = (scanResult) => {
   return Axios.get(`/api/enseignants/${scanResult}`)
}


const add = (professeur) => {
   return Axios.post('/api/enseignants', professeur)
}

const upload = (formData) => {
   return Axios.post('/api/enseignants/upload', formData)
}

const uploadProfil = (matricule, formData) => {
   return Axios.patch(`/api/enseignants/photo/${matricule}`,formData)
}

const getProfil = (matricule) => {
   const httpsOption = {
      responseType: 'blob'
   }
   return Axios.get(`/api/enseignants/file/${matricule}/downloadFile`, httpsOption)
}

const statusChange = (matricule) => {
   return Axios.patch(`/api/enseignants/statusChange/${matricule}`)
}

export const professeur_service = {
   getAll,
   getAllshow,
   getOne,
   add,
   upload,
   uploadProfil,
   getProfil,
   statusChange
}