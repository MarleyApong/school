import { useEffect, useState } from 'react'
import { pointage_service } from '../../services/pointage_service'
import toast from 'react-hot-toast'
import alertError from '../../audio/error.wav'
import alertSucsess from '../../audio/success.wav'
import alertUnknown from '../../audio/unknown.wav'


const CodeBar = () => {
   const [barcodeRead, setBarcodeRead] = useState("")
   let scanResult = ''

   const barcode = {
      timing: 0,
      data: "",
   }

   const barcodeReaded = () => {
      if (barcode.data.length > 1) {
         setBarcodeRead(barcode.data)
      } else {
         barcode.data = ""
      }
   }

   document.addEventListener("keypress", function (e) {
      clearTimeout(barcode.timing)
      barcode.timing = setTimeout(barcodeReaded, 500)
      barcode.data += e.key
      barcode.timing = window.setTimeout(function () {
         barcode.data = ""
      }, 500)
   })
   const playSuccess = () => {
      new Audio(alertSucsess).play()
   }
   const playError = () => {
      new Audio(alertError).play()
   }
   const playUnknow = () => {
      new Audio(alertUnknown).play()
   }
   scanResult = barcodeRead.substring(0, barcodeRead.length - 5)
   useEffect(() => {
      if (scanResult !== "") {
         if ((scanResult.includes("ET"))) {
            pointage_service.putPoinageEtud(scanResult)
               .then((res) => {
                  playSuccess()
                  toast.success("nouveau pointage étudiant !")
               })
               .catch((err) => {
                  if (err.response.request.status === 400) {
                     toast.error("Etudiant non en règle !")
                     playError()
                  }
                  else if (err.response.data.error[0] === "No value present") {
                     toast.error("Etudiant(e) non existant(e) !")
                     playError()
                  }
               })
         }
         else if ((scanResult.includes("ESG"))) {
            pointage_service.putPoinageProf(scanResult)
               .then((res) => {
                  playSuccess()
                  toast.success("nouveau pointage professeur !")
               }
               )
               .catch((err) => {
                  if (err) {
                     if (err.response.request.status === 400) {
                        toast.error("Professeur bloqué !")
                        playError()
                     }
                     else if (err.response.request.status === 500) {
                        toast.error("Professeur non existant !")
                        playError()
                     }
                     else {

                     }
                  }
               })
         }
         else {
            toast.error("Pointage non reconnu !")
            playUnknow()
         }
      }
   }, [scanResult, barcodeRead])
   return scanResult
}

export default CodeBar