import Axios from "./caller_service"

const getPension = () => {
   return Axios.get('/controlPoint')
}

const getControl = () => {
   return Axios.get('/control')
}

const addPension = (payement) => {
   return Axios.post('/controlPoint',payement)
}

const addControl = (controlPension) => {
   return Axios.post('/control',controlPension)
}

const updatePension = (type, range,id) => {
   return Axios.put(`/controlPoint/${id}`,{type, range})
}

const updateControl = (UControl,id) => {
   return Axios.put(`/control/${id}`,UControl)
}

export const control_service = {
   getPension,
   getControl,
   addPension,
   addControl,
   updatePension,
   updateControl
}