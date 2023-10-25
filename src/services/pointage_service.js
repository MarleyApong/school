import Axios from "./caller_service"

const getPoinageProf = (currentPage, size, sort, schoolMatricule, date, dateRange, order) => {
   return Axios.get(`api/pointageProf?page=${currentPage}&size=${size}&sort=${sort}&schoolMatricule=${schoolMatricule}&date=${date}&dateRange=${dateRange}&order=${order}`)
}

const getPoinageEtud = (currentPage, size, sort, schoolMatricule, date, dateRange, order) => {
   return Axios.get(`api/pointageEtudiants?page=${currentPage}&size=${size}&sort=${sort}&schoolMatricule=${schoolMatricule}&date=${date}&dateRange=${dateRange}&order=${order}`)
}

const putPoinageEtud = (matricule) => {
   return Axios.put('api/pointageEtudiants', {matricule: matricule})
}

const putPoinageProf= (matricule) => {
   return Axios.put('api/pointageProf', {matricule: matricule})
}

export const pointage_service = {
   getPoinageProf,
   getPoinageEtud,
   putPoinageEtud,
   putPoinageProf
}