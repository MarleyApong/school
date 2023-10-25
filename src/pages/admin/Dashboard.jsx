import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import * as RemixIcons from "react-icons/ri"
import * as PhosphorIcons from "react-icons/pi"
import { IconContext } from 'react-icons/lib'
import dateFormat from 'dateformat'
import '../../styles/dashboard.scss'
import { pointage_service } from '../../services/pointage_service'
import { etudiant_service } from '../../services/etudiant_service'
import { professeur_service } from '../../services/professeur_service'
import { useNavigate } from 'react-router-dom'
import { account_service } from '../../services/account_service'

const Dashbord = () => {
   const Navigate = useNavigate()
   const [arr, setArr] = useState([])
   const [arrEtud, setArrEtud] = useState([])
   const [sizeProf, setSizeProf] = useState(0)
   const [disableStudent, setDisableStudent] = useState([])
   const [unableStudent, setUnableStudent] = useState([])
   const date = new Date()
   const nowDate = dateFormat(date, "yyyy-mm-dd")

   let cache = {}
   useEffect(() => {
      etudiant_service.getAll(0, 100000, '', '', '')
         .then((res) => {
            setArrEtud(res.data.content)
         })
         .catch((err) => {
            if (err.response) {
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
                  toast.error("Erreur de données étudiant(e)s !")
                  account_service.logoutAdmin()
                  Navigate("/auth/login")
               }
            }
         })

      etudiant_service.getAll(0, 100000, '', 'desc', 'ACTIF')
         .then((res) => setUnableStudent(res.data.content))

      etudiant_service.getAll(0, 100000, '', 'desc', 'INACTIF')
         .then((res) => setDisableStudent(res.data.content))
         

      professeur_service.getAll(0, 20, '', '')
         .then((res) => {
            setSizeProf(res.data)
         })
         .catch((err) => {
            if (err.response) {
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
                  toast.error("Erreur de données professeurs !")
                  account_service.logoutAdmin()
                  Navigate("/auth/login")
               }
            }
         })
   }, [nowDate, Navigate])

   useEffect(() => {
      const loadPointage = () => {
         pointage_service.getPoinageProf(0, 500, "id", '', nowDate, nowDate, 'desc')
            .then((res) => {
               setArr(res.data.content)
            })
            .catch((err) => {
               if (err) {
                  if (err.message === "Network Error" || err.code === "ERR_NETWORK") {
                     toast.error("La connexion au serveur à échoué !")
                     toast.error("Déconnexion en cours !")
                     setTimeout(() => {
                        account_service.logoutAdmin()
                        Navigate("/auth/login")
                     }, 10000)
                  }
               }
            })
      }
      const timer = window.setInterval(() => {
         loadPointage()
      }, 2000)

      return () => { clearInterval(timer) }
   }, [Navigate, nowDate])

   const allClasse = arrEtud.filter((elem) => {
      return cache[elem.classe] ? 0 : cache[elem.classe] = 1
   })

   return (
      <>
         <IconContext.Provider value={{ size: '3.5rem' }}>
            <div className="FirstGroup">
               <div className="TBox">
                  <div className="Element">
                     <span>Total professeur</span>
                     <div className='IconM'><PhosphorIcons.PiChalkboardTeacherDuotone /></div>
                  </div>
                  <div className="Length">
                     {sizeProf.totalElements}
                  </div>
               </div>
               <div className="TBox">
                  <div className="Element">
                     <span>Total classe</span>
                     <div className='IconM'><RemixIcons.RiTableLine /></div>
                  </div>
                  <div className="Length">
                     {allClasse.length}
                  </div>
               </div>
               <div className="TBox">
                  <div className="Element">
                     <span>Total étudiant</span>
                     <div className='IconM'><RemixIcons.RiUser6Line /></div>
                  </div>
                  <div className="Length">
                     {arrEtud.length}
                  </div>
               </div>
               <div className="TBox">
                  <div className="Element">
                     <span>Etudiant(e)s actif/ve(s)</span>
                     <div className='IconM'><RemixIcons.RiUserFollowLine /></div>
                  </div>
                  <div className="Length">
                     {
                        unableStudent.length
                     }
                  </div>
               </div>
            </div>
            <div className="SecondGroup">
               <div className="Left">
                  <div className="HeaderLeft">
                     <h4>Pointage professeurs</h4>
                     <h4>Aujourd'hui, {date.toDateString()}</h4>
                  </div>
                  <div className="Details">
                     <table>
                        <thead>
                           <tr>
                              <td>No.</td>
                              <td>Noms</td>
                              <td>Prenoms</td>
                              <td>Entrée</td>
                              <td>Sortie</td>
                           </tr>
                        </thead>
                        <tbody>
                           {
                              arr.map((item, index) => {
                                 return (
                                    <tr key={index}>
                                       <td>{index + 1}</td>
                                       <td>{item.enseignant.firstName}</td>
                                       <td>{item.enseignant.lastName}</td>
                                       <td>
                                          {
                                             (item.type === "ENTREE" || item.getTimeIn1 !== null) || (item.getTimeIn2 !== null) || (item.getTimeIn3 !== null) || (item.getTimeIn4 !== null) || (item.getTimeIn5 !== null) ? "Oui" : "non"
                                          }
                                       </td>
                                       <td>
                                          {
                                             (item.type === "SORTIE" || item.getTimeOut1 !== null) || (item.getTimeOut2 !== null) || (item.getTimeOut3 !== null) || (item.getTimeOut4 !== null) || (item.getTimeOut5 !== null) ? "Oui" : "non"
                                          }
                                       </td>
                                    </tr>
                                 )
                              })
                           }
                        </tbody>
                     </table>
                  </div>
               </div>
               <div className="Right">
                  <div className="TBox2">
                     <div className="Element">
                        <span>Etudiant(e)s bloqué(e)s</span>
                        <div className='IconM'><RemixIcons.RiUserUnfollowLine /></div>
                     </div>
                     <div className="Length">
                        {
                           disableStudent.length
                        }
                     </div>
                  </div>
                  <div className="TBox2">
                     <div className="Element">
                        <div className="It">
                           <span>Pointage du jour Prof.</span>
                           <span>{nowDate}</span>
                        </div>
                        <div className='IconM'><PhosphorIcons.PiChalkboardTeacherDuotone className='icon' /></div>

                     </div>
                     <div className="Length">
                        {
                           arr.length
                        }
                     </div>
                  </div>
                  <div className="TBox2">
                     <div className="HeaderLeft">
                        <h4>Etudiant(e)s bloqué(e)s</h4>
                        <h4>
                           {
                              disableStudent.length
                           }
                        </h4>
                     </div>
                     <div className="Details">
                        <table>
                           <thead>
                              <tr>
                                 <td>No.</td>
                                 <td>Noms</td>
                                 <td>Prenoms</td>
                                 <td>Filière</td>
                              </tr>
                           </thead>
                           <tbody>
                              {
                                 arrEtud.sort((a, b) => a.id < b.id ? 1 : -1).filter((item) => item.status.name !== "ACTIF").map((item, index) => {
                                    return (
                                       <tr key={index}>
                                          <td>{index + 1}</td>
                                          <td>{item.firstName}</td>
                                          <td>{item.lastName}</td>
                                          <td>{item.classe}</td>
                                       </tr>
                                    )
                                 })
                              }
                           </tbody>
                        </table>
                     </div>
                  </div>

               </div>
            </div>
         </IconContext.Provider>
      </>
   )
}

export default Dashbord