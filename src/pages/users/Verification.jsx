import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import CodeBar from 'react-barcode'
import dateFormat from 'dateformat'
import SideBar from '../../components/sidebar/SideBar'
import Header from '../../components/header/Header'
import '../../styles/pension.scss'
import { control_service } from '../../services/control_service'
import { etudiant_service } from '../../services/etudiant_service'
import { professeur_service } from '../../services/professeur_service'
import { account_service } from '../../services/account_service'
import success from '../../images/tests/success.png'
import error from '../../images/tests/error.png'

const Verification = () => {
   const [menu, setMenu] = useState(false)
   const Navigate = useNavigate()
   const [listPay, setListPay] = useState([])
   const [listControl, setListControl] = useState([])
   const [barcodeRead, setBarcodeRead] = useState("")
   const [student, setStudent] = useState([])
   const [teacher, setTeacher] = useState([])
   const [scanResult, setScanResult] = useState('')
   const [errorScan, setErrorScan] = useState(0)
   const [errorScanSt, setErrorScanSt] = useState(0)
   const date = new Date()

   const nowDate = dateFormat(date, "yyyy-mm-dd HH:MM:ss")
   const nowDateConvert = new Date(nowDate)
   let dateTakeControl = ""
   let etatTake = ""
   let typeControl = ""
   let percent = 0
   let montP = 0
   let totalP = 0
   let percentMontTotal = 0

   useEffect(() => {
      if (scanResult !== "") {
         if (scanResult.includes("ESG")) {
            professeur_service.getOne(scanResult)
               .then((res) => {
                  setTeacher(res.data)
                  setErrorScan(1)
                  setErrorScanSt(0)
               })
               .catch((err) => {
                  setErrorScan(2)
                  setErrorScanSt(0)
               })
         }
         else if (scanResult.includes("ET")) {
            etudiant_service.getOne(scanResult)
               .then((res) => {
                  setStudent(res.data)
                  setErrorScanSt(1)
                  setErrorScan(0)
               })
               .catch((err) => {
                  setErrorScanSt(2)
                  setErrorScan(0)
               })
         }
         else {
            setErrorScan(3)
         }
      }
   }, [scanResult])


   useEffect(() => {
      control_service.getPension()
         .then((res) => {
            setListPay(res.data)
         })
         .catch((err) => {
            if (err.response.status === 400) {
               toast.error("Champs mal renseigné ou format inattendu !", {
                  style: {
                     textAlign: 'center'
                  }
               })
            }
            else if (err.response.status === 401) {
               toast.error("La session a expiré !")
               Navigate("/auth/login")
               sessionStorage.removeItem("is-already-load", "yes")
               account_service.logout()
            }
            else if (err.response.status === 403) {
               toast.error("Accès interdit !")
            }
            else if (err.response.status === 404) {
               toast.error("Ressource non trouvée !")
            }
            else if (err.response.status === 415) {
               toast.error("Erreur, contactez l'administrateur !")
            }
            else if (err.response.status === 500) {
               toast.error("Erreur interne du serveur !")
            }
            else {
               toast.error("Erreur de données payement !")
               Navigate("/auth/login")
               account_service.logout()
            }
         }
         )

      control_service.getControl()
         .then((res) => {
            setListControl(res.data)
         })
         .catch((err) => {
            if (err.response.status === 400) {
               toast.error("Champs mal renseigné ou format inattendu !", {
                  style: {
                     textAlign: 'center'
                  }
               })
            }
            else if (err.response.status === 401) {
               toast.error("La session a expiré !")
               Navigate("/auth/login")
               account_service.logout()
            }
            else if (err.response.status === 403) {
               toast.error("Accès interdit !")
            }
            else if (err.response.status === 404) {
               toast.error("Ressource non trouvée !")
            }
            else if (err.response.status === 415) {
               toast.error("Erreur, contactez l'administrateur !")
            }
            else if (err.response.status === 500) {
               toast.error("Erreur interne du serveur !")
            }
            else {
               toast.error("Erreur de données payement !")
               Navigate("/auth/login")
               account_service.logout()
            }
         }
         )
   }, [Navigate])

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

   document.addEventListener("keypress", (e) => {
      clearTimeout(barcode.timing)
      barcode.timing = setTimeout(barcodeReaded, 500)
      barcode.data += e.key
      barcode.timing = window.setTimeout(() => {
         barcode.data = ""
      }, 500)
   })

   useEffect(() => {
      setScanResult(barcodeRead.substring(0, barcodeRead.length - 5))
   }, [barcodeRead])

   const verifElement = () => {
      if (listControl.length === 1) {
         dateTakeControl = new Date(listControl.map((item) => item.dateControl).toString().replace("T", " "))
         etatTake = listControl.map((item) => item.etat).toString()
         if (nowDateConvert > dateTakeControl) {
            if (etatTake === 'true') {
               return true
            }
            else {
               return false
            }
         }
         else {
            return false
         }
      }
   }


   const verifPercent = () => {
      typeControl = listControl.map((item) => item.controlPoint.type).toString()
      if (listPay.filter((item) => item.type === typeControl)) {
         percent = listPay.filter((item) => item.type === typeControl).map((item) => item.rangeLevel)
         montP = student.montantPay
         totalP = student.totalPension
         percentMontTotal = totalP * percent / 100

         if (montP >= percentMontTotal) {
            return true
         }
         else {
            return false
         }
      }
      else {
         return false
      }
   }

   return (
      <div className='Pages'>
         <SideBar menu={menu} setMenu={setMenu} />
         <div className={menu ? "Main OverSide" : "Main"}>
            <Header menu={menu} setMenu={setMenu} />

            <div className="Content">
               <div className="OtherPart">
                  <div className="Control">
                     <div className="ControlPoint">
                        <div className="HeaderControl">
                           <span>Liste des Tranches</span>
                        </div>
                        <div className="ControlTable">
                           <table>
                              <thead>
                                 <tr>
                                    <td>No.</td>
                                    <td>Type</td>
                                    <td>Poucentage</td>
                                 </tr>
                              </thead>
                              <tbody>
                                 {
                                    listPay.map((item, index) => {
                                       return (
                                          <tr key={index} className='TR'>
                                             <td>{index + 1}</td>
                                             <td>{item.type}</td>
                                             <td className='TD'>{item.rangeLevel}</td>
                                          </tr>
                                       )
                                    })
                                 }
                              </tbody>
                           </table>
                        </div>
                     </div>
                     <div className="DefineSession">
                        <div className="HeaderControl">
                           <span>Elément de Contrôle</span>
                        </div>
                        <div className="ControlTable">
                           <table>
                              <thead>
                                 <tr>
                                    <td>Date de Contrôle </td>
                                    <td>Etat</td>
                                    <td>Type</td>
                                 </tr>
                              </thead>
                              <tbody>
                                 {
                                    listControl.map((item, index) => {
                                       return (
                                          <tr key={index} className='TR'>
                                             <td>{item.dateControl.toString().replace("T", " à ")}</td>
                                             <td>{item.etat === false ? "Désactivé" : "Activé"}</td>
                                             <td className='TD'>{item.controlPoint.type}</td>
                                          </tr>
                                       )
                                    })
                                 }
                              </tbody>
                           </table>
                        </div>
                     </div>
                  </div>

                  <div className="ResultControl">
                     <div className="HeaderControl">
                        <span>Détails Etudiant / Professeur scanné</span>
                     </div>
                     <div className="viewScanner">
                        <div className="InfoRule">
                           <div className="Left">
                              {
                                 scanResult ? <CodeBar value={scanResult} /> : <span style={{ textAlign: "center" }}>Aucun code scanné</span>
                              }
                           </div>
                           <div className="Right">
                              {
                                 errorScan === 0 ?
                                    "" :
                                    errorScan === 1 && teacher.status.name === "ACTIF" ?
                                       <img src={success} alt="" /> :
                                       errorScan === 2 ?
                                          <img src={error} alt="" /> :
                                          errorScan === 3 ?
                                             <img src={error} alt="" /> :
                                             <img src={error} alt="" />

                              }
                              {
                                 errorScanSt === 0 ?
                                    "" :
                                    errorScanSt === 1 && verifElement() === true && verifPercent() === false ?
                                       <img src={error} alt="" /> :
                                       errorScanSt === 1 && verifElement() === false && verifPercent() === true ?
                                          <img src={success} alt="" /> :
                                          errorScanSt === 1 && verifElement() === false && verifPercent() === false ?
                                             <img src={success} alt="" /> :
                                             errorScanSt === 1 && verifElement() === true && verifPercent() === true ?
                                                <img src={success} alt="" /> :
                                                errorScanSt === 2 ?
                                                   <img src={error} alt="" /> :
                                                   <img src={error} alt="" />
                              }
                           </div>
                        </div>
                        <div className="InfoForAll">
                           {
                              scanResult.includes("ESG") && errorScan === 1 ?
                                 <>
                                    <div className="Left">
                                       <span>Matricule: </span>
                                       <span>Noms:</span>
                                       <span>Prénoms:</span>
                                       {/* <span>Statut:</span> */}
                                    </div>
                                    <div className="Right">
                                       <span>{scanResult ? teacher.schoolMatricule : "---"}</span>
                                       <span>{scanResult ? teacher.firstName : "---"}</span>
                                       <span>{scanResult ? teacher.lastName : "---"}</span>
                                       {/* <span>{scanResult ? teacher.status.name : "---"}</span> */}
                                    </div>
                                 </>
                                 :
                                 <>
                                 </>
                           }
                           {
                              scanResult.includes("ET") && errorScanSt === 1 ?
                                 <>
                                    <div className="Left">
                                       <span>Matricule: </span>
                                       <span>Noms:</span>
                                       <span>Prénoms:</span>
                                       <span>Classe:</span>
                                       <span>Montant:</span>
                                       <span>Total Pension:</span>
                                    </div>
                                    <div className="Right">
                                       <span>{scanResult ? student.schoolMatricule : "---"}</span>
                                       <span>{scanResult ? student.firstName : "---"}</span>
                                       <span>{scanResult ? student.lastName : "---"}</span>
                                       <span>{scanResult ? student.classe : "---"}</span>
                                       <span>{scanResult ? student.montantPay : "---"}</span>
                                       <span>{scanResult ? student.totalPension : "---"}</span>
                                    </div>
                                 </>
                                 :
                                 <>
                                 </>
                           }

                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default Verification