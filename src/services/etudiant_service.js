import Axios from "./caller_service"

const getOne = (scanResult) => {
   return Axios.get(`/api/etudiant/${scanResult}`)
}

const getAll = (currentPage, size, sort, order, status) => {
   return Axios.get(`/api/etudiant?page=${currentPage}&size=${size}&sort=${sort}&order=${order}&status=${status}`)
}

const getAllShow = (currentPage, size, sort, search, order, status, sex, classe) => {
   return Axios.get(`/api/etudiant?page=${currentPage}&size=${size}&${sort}=${search}&order=${order}&status=${status}&sex=${sex}&classe=${classe}`)
}

const getQrCode = (matricule) => {
   const httpsOption = {
      responseType: 'blob'
   }
return Axios.get(`/api/etudiant/QrCode/${matricule}`, httpsOption, {headers: {'Content-Type': 'application/png'}})
}

const add = (etudiant) => {
   return Axios.post('/api/etudiant', etudiant)
}

const uploadStudent = (formData) => {
   return Axios.post('/api/etudiant/upload', formData)
}

const uploadProfil = (matricule, formData) => {
   return Axios.patch(`/api/etudiant/photo/${matricule}`,formData)
}

const getProfil = (matricule) => {
   const httpsOption = {
      responseType: 'blob'
   }
   return Axios.get(`/api/etudiant/file/${matricule}/downloadFile`, httpsOption)
}

const statusChange = (matricule) => {
   return Axios.patch(`/api/etudiant/statusChange/${matricule}`)
}

export const etudiant_service = {
   getOne,
   getAll,
   getAllShow,
   add,
   uploadStudent,
   uploadProfil,
   getProfil,
   statusChange,
   getQrCode
}