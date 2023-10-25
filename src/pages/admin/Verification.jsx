import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate, useLocation } from 'react-router-dom'
import * as RemixIcons from "react-icons/ri"
import CodeBar from 'react-barcode'
import dateFormat from 'dateformat'
import '../../styles/pension.scss'
import { control_service } from '../../services/control_service'
import { etudiant_service } from '../../services/etudiant_service'
import { professeur_service } from '../../services/professeur_service'
import { account_service } from '../../services/account_service'
import success from '../../images/tests/success.png'
import error from '../../images/tests/error.png'

const Verification = () => {
   const Navigate = useNavigate()
   const Location = useLocation()
   const [Up, setUp] = useState('')
   const [payement, setPayement] = useState({
      type: "",
      range: "",
   })
   const [control, setControl] = useState({
      dateControl: "",
      etat: 0,
      controlPoint: "",
   })
   const [UControl, setUControl] = useState({
      dateControl: "",
      etat: 0,
      controlPoint: "",
   })
   const [listPay, setListPay] = useState([])
   const [listControl, setListControl] = useState([])
   const [count, setCount] = useState(0)
   const [errorScan, setErrorScan] = useState(0)
   const [errorScanSt, setErrorScanSt] = useState(0)
   const [addTranche, setAddTranche] = useState(false)
   const [updateTranche, setUpdateTranche] = useState(false)
   const [updateControl, setUpdateControl] = useState(false)
   const [addControl, setAddControl] = useState(false)
   const [barcodeRead, setBarcodeRead] = useState("")
   const [student, setStudent] = useState([])
   const [teacher, setTeacher] = useState([])
   const [scanResult, setScanResult] = useState('')
   const [id, setId] = useState('')
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
   let idType = listPay.filter((item) => item.id === id).map((item) => item.type).toString()

   const patch = (itemId) => {
      Navigate(`/admin/verification/control/update/${itemId}`)
      setId(itemId)
   }

   const patch2 = (itemId) => {
      Navigate(`/admin/verification/tranche/update/${itemId}`)
      setId(itemId)
   }

   const callAddTranche = (e) => {
      if (listPay.length >= 4) {
         e.preventDefault()
         toast.error("La liste des tranches est fixée à 4 ")
      }
      else {
         Navigate('/admin/verification/tranche/new')
      }
   }

   const callAddControl = (e) => {
      if (listControl.length >= 1) {
         e.preventDefault()
         toast.error("Un élément de contrôl exite déjà !")
      } else {
         Navigate('/admin/verification/control/new')
      }
   }

   const CancelModal = () => {
      Navigate('/admin/verification/')
   }

   const addPayement = (e) => {
      setPayement({
         ...payement, [e.target.name]: e.target.value
      })
   }

   const adControl = (e) => {
      setControl({
         ...control, [e.target.name]: e.target.value
      })
   }

   const updControl = (e) => {
      setUControl({
         ...UControl, [e.target.name]: e.target.value
      })
   }

   useEffect(() => {
      const modalTranche = () => {
         if (Location.pathname === "/admin/verification/tranche/new") { setAddTranche(true) }
         else { setAddTranche(false) }
      }

      const modalTrancheUpdate = () => {
         if (Location.pathname === `/admin/verification/tranche/update/${id}`) { setUpdateTranche(true) }
         else { setUpdateTranche(false) }
      }

      const modalControl = () => {
         if (Location.pathname === "/admin/verification/control/new") { setAddControl(true) }
         else { setAddControl(false) }
      }

      const modalControlUpdate = () => {
         if (Location.pathname === `/admin/verification/control/update/${id}`) { setUpdateControl(true) }
         else { setUpdateControl(false) }
      }

      modalTranche()
      modalTrancheUpdate()
      modalControl()
      modalControlUpdate()
   }, [addTranche, addControl, Location.pathname, id])

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
               account_service.logoutAdmin()
               Navigate("/auth/login")
            }
            else if (err.response.status === 403) {
               toast.error("Accès interdit !")
            }
            else if (err.response.status === 404) {
               toast.error("Ressource non trouvée !")
            }
            else if (err.response.status === 415) {
               toast.error("Erreur, contactez l'administrateur !",
                  {
                     style: {
                        textAlign: 'center'
                     }
                  }
               )
            }
            else if (err.response.status === 500) {
               toast.error("Erreur interne du serveur !")
            }
            else {
               toast.error("Erreur de données payement !")
               account_service.logoutAdmin()
               Navigate("/auth/login")
            }
         }
         )

      control_service.getControl()
         .then((res) => {
            setListControl(res.data)
         })
         .catch((err) => {
            if (err.response.status === 400) {
               toast.error("Champs mal renseigné ou format inattendu !")
            }
            else if (err.response.status === 401) {
               toast.error("La session a expiré !")
               account_service.logoutAdmin()
               Navigate("/auth/login")
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
               account_service.logoutAdmin()
               Navigate("/auth/login")
            }
         }
         )
   }, [count, Navigate])

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

   const handlePension = (e) => {
      e.preventDefault()
      if (payement.type === "" || payement.range === "") {
         toast.error("Remplir tous les champs !")
      }
      else {
         control_service.addPension(payement)
            .then((res) => {
               setCount((current) => current + e)
               toast.success(`${payement.type} ajoutée avec succès !`)
               setPayement({
                  type: "",
                  range: ""
               })
               Navigate('/admin/verification/')
            })
            .catch((err) => {
               if (err.response.status === 400) {
                  toast.error("Champs mal renseigné !")
               }
               else if (err.response.status === 401) {
                  toast.error("La session a expiré !")
                  account_service.logoutAdmin()
                  Navigate("/auth/login")
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
                  toast.error("Erreur de données !")
                  account_service.logoutAdmin()
                  Navigate("/auth/login")
               }
            }
            )
      }
   }

   const handleUpdatePension = (e) => {
      e.preventDefault()
      if (Up === "") {
         toast.error("Remplir le pourcentage !")
      }
      else {
         control_service.updatePension(idType, Up, id)
            .then((res) => {
               setCount((current) => current + e)
               toast.success(`${listPay.filter((item) => item.id === id).map((item) => item.type)} modifiée avec succès !`)
               setUp('')
               Navigate('/admin/verification/')
            })
            .catch((err) => {
               if (err.response.status === 400) {
                  toast.error("Champs mal renseigné ou format inattendu !")
               }
               else if (err.response.status === 401) {
                  toast.error("La session a expiré !")
                  account_service.logoutAdmin()
                  Navigate("/auth/login")
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
                  toast.error("Erreur de données !")
                  account_service.logoutAdmin()
                  Navigate("/auth/login")
               }
            }
            )
      }
   }

   const handleAddControl = (e) => {
      e.preventDefault()
      if (control.controlPoint === "" || control.controlPoint === "") {
         toast.error("Remplir tous les champs !")
      }
      else {
         control_service.addControl(control)
            .then((res) => {
               setCount((current) => current + e)
               toast.success("Contrôl ajouté avec succès !")
               setControl({
                  dateControl: "",
                  controlPoint: "",
                  etat: "false"
               })
               Navigate('/admin/verification/')
            })
            .catch((err) => {
               if (err.response.status === 400) {
                  toast.error("Champs mal renseigné ou format inattendu !")
               }
               else if (err.response.status === 401) {
                  toast.error("La session a expiré !")
                  account_service.logoutAdmin()
                  Navigate("/auth/login")
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
                  toast.error("Erreur de données !")
                  account_service.logoutAdmin()
                  Navigate("/auth/login")
               }
            }
            )
      }
   }

   const handleUpdateControl = (e) => {
      e.preventDefault()
      if (UControl.type === "" || UControl.range === "") {
         toast.error("Remplir tous les champs !")
      }
      else {
         control_service.updateControl(UControl, id)
            .then((res) => {
               setCount((current) => current + e)
               toast.success(`${listControl.filter((item) => item.id === id).map((item) => item.controlPoint.type)} modifiée avec succès !`)
               setControl({
                  dateControl: "",
                  controlPoint: "",
                  etat: "false"
               })
               Navigate('/admin/verification/')
            })
            .catch((err) => {
               if (err.response.status === 400) {
                  toast.error("Champs mal renseigné ou format inattendu !")
               }
               else if (err.response.status === 401) {
                  toast.error("La session a expiré !")
                  account_service.logoutAdmin()
                  Navigate("/auth/login")
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
                  toast.error("Erreur de données !")
                  account_service.logoutAdmin()
                  Navigate("/auth/login")
               }
            }
            )
      }
   }

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
      <>
         <div className={addTranche ? "ModalForm" : "ModalForm None"}>
            <div className='ModalFormHeader'>
               <h3>Définir une tranche</h3>
               <span onClick={CancelModal} className='BtnClose'>
                  <RemixIcons.RiCloseLine />
               </span>
            </div>
            <form onSubmit={handlePension} className='form'>
               <div className="InputBox">
                  <label htmlFor="type">Type tranche :</label>
                  <select name="type" id="type" onChange={addPayement}>
                     <option value="">---</option>
                     <option value="INSCRIPTION">INSCRIPTION</option>
                     <option value="TRANCHE1">TRANCHE1</option>
                     <option value="TRANCHE2">TRANCHE2</option>
                     <option value="TRANCHE3">TRANCHE3</option>
                  </select>
               </div>
               <div className="InputBox">
                  <label htmlFor="type">Pourcentage :</label>
                  <select name="range" id="type" onChange={addPayement}>
                     <option value="">---</option>
                     <option value="10">10</option>
                     <option value="20">20</option>
                     <option value="30">30</option>
                     <option value="40">40</option>
                     <option value="50">50</option>
                     <option value="60">60</option>
                     <option value="70">70</option>
                     <option value="80">80</option>
                     <option value="90">90</option>
                     <option value="100">100</option>
                  </select>
               </div>
               <input type="submit" className='Btn Btn1' value='Ajouter' />
            </form>
         </div>

         <div className={updateTranche ? "ModalForm" : "ModalForm None"}>
            <div className='ModalFormHeader'>
               <h3>Modifier {listPay.filter((item) => item.id === id).map((item) => item.type) === "inscription" ? "l'inscription" : listPay.filter((item) => item.id === id).map((item) => item.type)}</h3>
               <span onClick={CancelModal} className='BtnClose'>
                  <RemixIcons.RiCloseLine />
               </span>
            </div>
            <form onSubmit={handleUpdatePension} className='form'>
               <input type="text" disabled value={listPay.filter((item) => item.id === id).map((item) => item.type)} autoComplete='off' />
               <input type="number" placeholder='Pourcentage' value={Up} onChange={(e) => setUp(e.target.value)} autoComplete='off' />
               <input type="submit" className='Btn Btn1' value='Modifier' />
            </form>
         </div>

         <div className={addControl ? "ModalForm" : "ModalForm None"}>
            <div className='ModalFormHeader'>
               <h3>Définir un contrôle</h3>
               <span onClick={CancelModal} className='BtnClose'>
                  <RemixIcons.RiCloseLine />
               </span>
            </div>
            <form onSubmit={handleAddControl} className='form'>
               <label htmlFor="dateContr">Date du contrôl : </label>
               <input type="datetime-local" name='dateControl' value={control.dateControl} onChange={adControl} id='dateContr' autoComplete='off' />
               <div className="InputBox">
                  <label htmlFor="Etat">Etat: </label>
                  <select name="etat" id="Etat" onChange={adControl}>
                     <option value="false">Désactiver</option>
                     <option value="true">Activer</option>
                  </select>
               </div>
               <div className="InputBox">
                  <label htmlFor="Cpoint">Type: </label>
                  <select name="controlPoint" id="Cpoint" onChange={adControl}>
                     <option value="">...</option>
                     {
                        listPay.map((item, index) => {
                           return (
                              <option value={item.id} key={index}>{item.type}</option>
                           )
                        })
                     }
                  </select>
               </div>
               <input type="submit" className='Btn Btn1' value='Ajouter' />
            </form>
         </div>

         <div className={updateControl ? "ModalForm" : "ModalForm None"}>
            <div className='ModalFormHeader'>
               <h3>Modifier {listControl.filter((item) => item.id === id).map((item) => item.controlPoint.type)} du {listControl.filter((item) => item.id === id).map((item) => item.dateControl).toString().replace("T", " ")}</h3>
               <span onClick={CancelModal} className='BtnClose'>
                  <RemixIcons.RiCloseLine />
               </span>
            </div>
            <form onSubmit={handleUpdateControl} className='form'>
               <label htmlFor="dateContr">Date du contrôle : </label>
               <input type="datetime-local" name='dateControl' value={UControl.dateControl} onChange={updControl} id='dateContr' autoComplete='off' />
               <div className="InputBox">
                  <label htmlFor="Etat">Etat: </label>
                  <select name="etat" id="Etat" onChange={updControl}>
                     <option value="false">False</option>
                     <option value="true">True</option>
                  </select>
               </div>
               <div className="InputBox">
                  <label htmlFor="Cpoint">Type: </label>
                  <select name="controlPoint" id="Cpoint" onChange={updControl}>
                     <option value="">...</option>
                     {
                        listPay.map((item, index) => {
                           return (
                              <option value={item.id} key={index}>{item.type}</option>
                           )
                        })
                     }
                  </select>
               </div>
               <input type="submit" className='Btn Btn1' value='Modifier' />
            </form>
         </div>

         <div className="Link">
            {
               listPay.length >= 4 ? <button className='Btn error' onClick={callAddTranche}>Définir une tranche</button> :
                  <button className='Btn Btn1' onClick={callAddTranche}>Définir une tranche</button>
            }
            {
               listControl.length >= 0 ? <button className='Btn Btn1' onClick={callAddControl}>Définir le contrôle</button> :
                  <button className='Btn error' onClick={callAddControl}>Définir le contrôle</button>
            }
         </div>

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
                              <td>Pourcentage</td>
                              <td>Modifié</td>
                           </tr>
                        </thead>
                        <tbody>
                           {
                              listPay.map((item, index) => {
                                 return (
                                    <tr key={index}>
                                       <td>{index + 1}</td>
                                       <td>{item.type}</td>
                                       <td>{item.rangeLevel}</td>
                                       <td className='TdLink' onClick={() => patch2(item.id)}><RemixIcons.RiPencilFill /></td>
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
                              <td>Modifié</td>
                           </tr>
                        </thead>
                        <tbody>
                           {
                              listControl.map((item, index) => {
                                 return (
                                    <tr key={index}>
                                       <td>{item.dateControl.toString().replace("T", " à ")}</td>
                                       <td>{item.etat === false ? "Désactivé" : "Activé"}</td>
                                       <td>{item.controlPoint.type}</td>
                                       {/* eslint-disable-next-line */}
                                       <td className='TdLink' onClick={() => patch(item.id)}><RemixIcons.RiPencilFill /></td>
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
      </>
   )
}

export default Verification