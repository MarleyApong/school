import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import * as RemixIcons from "react-icons/ri"
import { toast } from 'react-hot-toast'
import ReactPaginate from 'react-paginate'
import dateFormat from 'dateformat'
import { useReactToPrint } from 'react-to-print'
import '../../styles/pointage.scss'
import { pointage_service } from '../../services/pointage_service'
import { account_service } from '../../services/account_service'

const PointageProfesseur = () => {
   const date = new Date()
   const nowDate = dateFormat(date, "yyyy-mm-dd")
   const nowDatePdf = dateFormat(date, "yyyy-mm-dd HH:MM:ss")
   const [form, setForm] = useState(false)
   const Navigate = useNavigate()
   const Location = useLocation()
   const [order, setOrder] = useState('asc')
   // const [filter, setFilter] = useState('')
   const [dateRange, setDateRange] = useState('')
   const [filterDate, setFilterDate] = useState(nowDate)
   const [filterMatricule, setFilterMatricule] = useState('')
   // const [search, setSearch] = useState('')
   const [arr, setArr] = useState([])
   const [pageable, setPageable] = useState({})
   const [currentPage, setCurrentPage] = useState(0)
   const [refresh, setRefresh] = useState(0)
   const [total, setTotal] = useState(0)
   const [id, setId] = useState(null)
   const componentPdf = useRef()

   const patch = (itemId) => {
      Navigate(`/admin/pointage/professeurs/${itemId}`)
      setId(itemId)
   }

   const callNavigateForm = () => {
      Navigate('/admin/pointage/etudiants')
   }

   const CancelModal = () => {
      Navigate('/admin/pointage')
   }

   useEffect(() => {
      const modal = () => {
         if (Location.pathname === `/admin/pointage/professeurs/${id}`) {
            setForm(true)
         }
         else {
            setForm(false)
         }
      }
      modal()
   }, [id, form, Location.pathname])

   useEffect(() => {
      const loadData = () => {
         pointage_service.getPoinageProf(currentPage, 20, "id", filterMatricule, filterDate, dateRange, order)
            .then((res) => {
               setArr(res.data.content)
               setPageable(res.data)
               setTotal(res.data.totalElements)
            })
            .catch((err) => {
               if (err.response) {
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
                     toast.error("Erreur, contactez l'administrateur !")
                  }
                  else if (err.response.status === 500) {
                     // toast.error("Erreur interne du serveur !")
                  }
                  else {
                     toast.error("Erreur de données pointages professeurs !", {
                        style: {
                           textAlign: 'center'
                        }
                     })
                     toast.error("La session a expiré !")
                     account_service.logoutAdmin()
                     Navigate("/auth/login")
                  }
               }
               else {
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
      loadData()
      const timer = window.setInterval(() => {
         loadData()
      }, 1000)

      return () => {
         clearInterval(timer)
      }
   }, [order, dateRange, filterMatricule, filterDate, nowDate, Navigate, currentPage, refresh])

   const handlePageClick = (data) => {
      setRefresh((current) => current + 1)
      setCurrentPage(data.selected)
   }

   const exportDataTable = useReactToPrint({
      content: () => componentPdf.current,
      documentTitle: `Pointage professeur || ${nowDatePdf}`,
      // onAfterPrint: () => toast.success("Exportation terminée !"),
      // onPrintError: () => toast.error("Exportation echouée !")
   })

   return (
      <>
         <div className={form ? "ModalForm Pt" : "ModalForm None"}>
            <div className='ModalFormHeader'>
               <h3>Détails Activités de : {arr.filter((item) => item.id === id).map((item, index) => item.enseignant.firstName + " " + item.enseignant.lastName)} </h3>
               <h3>Date: {arr.filter((item) => item.id === id).map((item, index) => item.date)}</h3>
               <span onClick={CancelModal}>
                  <RemixIcons.RiCloseLine />
               </span>
            </div>
            <div className='ModalDetails'>
               <table>
                  <thead>
                     <tr>
                        <td colSpan='2'>ENTREE</td>
                        <td colSpan='2'>SORTIE</td>
                     </tr>
                  </thead>
                  <tbody>
                     <tr>
                        <td>Horaire 1</td>
                        <td>{arr.filter((item) => item.id === id).map((item, index) => item.getTimeIn1 ? item.getTimeIn1 : "---")}</td>
                        <td>Horaire 1</td>
                        <td>{arr.filter((item) => item.id === id).map((item, index) => item.getTimeOut1 ? item.getTimeOut1 : "---")}</td>
                     </tr>
                     <tr>
                        <td>Horaire 2</td>
                        <td>{arr.filter((item) => item.id === id).map((item, index) => item.getTimeIn2 ? item.getTimeIn2 : "---")}</td>
                        <td>Horaire 2</td>
                        <td>{arr.filter((item) => item.id === id).map((item, index) => item.getTimeOut2 ? item.getTimeOut2 : "---")}</td>
                     </tr>
                     <tr>
                        <td>Horaire 3</td>
                        <td>{arr.filter((item) => item.id === id).map((item, index) => item.getTimeIn3 ? item.getTimeIn3 : "---")}</td>
                        <td>Horaire 3</td>
                        <td>{arr.filter((item) => item.id === id).map((item, index) => item.getTimeOut3 ? item.getTimeOut3 : "---")}</td>
                     </tr>
                     <tr>
                        <td>Horaire 4</td>
                        <td>{arr.filter((item) => item.id === id).map((item, index) => item.getTimeIn4 ? item.getTimeIn4 : "---")}</td>
                        <td>Horaire 4</td>
                        <td>{arr.filter((item) => item.id === id).map((item, index) => item.getTimeOut4 ? item.getTimeOut4 : "---")}</td>
                     </tr>
                     <tr>
                        <td>Horaire 5</td>
                        <td>{arr.filter((item) => item.id === id).map((item, index) => item.getTimeIn5 ? item.getTimeIn5 : "---")}</td>
                        <td>Horaire 5</td>
                        <td>{arr.filter((item) => item.id === id).map((item, index) => item.getTimeOut5 ? item.getTimeOut5 : "---")}</td>
                     </tr>
                  </tbody>
               </table>
            </div>
            <div className="Link">
               <button className='Btn Btn2' onClick={CancelModal}>Fermer</button>
            </div>
         </div>
         <div className="Link">
            <button className='Btn Btn3' onClick={exportDataTable}>Exporter</button>
            <button className='Btn Btn1' onClick={callNavigateForm}>Pointage Etud.</button>
         </div>
         <div className="TemplateForm">
            <div className="TableForm">
               <div className="OptionFilter">
                  <h4 className="HeaderTitle">Option de filtre</h4>
                  <div className="AllOptions">
                     <div className="AllOptionBox">
                        <label htmlFor="OptionBoxTrier">Trier par: </label>
                        <select name={order} onChange={(e) => setOrder(e.target.value)} id="OptionBoxTrier">
                           <option value="asc">Ordre croissant</option>
                           <option value="desc">Ordre décroissant</option>
                        </select>
                     </div>
                     {/* <div className="AllOptionBox">
                        <label htmlFor="OptionBoxFilter">Date Option: </label>
                        <select name={filter} onChange={(e) => setFilter(e.target.value)} id="OptionBoxFilter">
                           <option value="schoolMatricule">date</option>
                           <option value="dateRange">Plage</option>
                        </select>
                     </div> */}

                     <div className="AllOptionBox">
                        <label htmlFor="OptionBoxMatricule">Matricule: </label>
                        <input type="text" id='OptionBoxMatricule' value={filterMatricule} onChange={(e) => setFilterMatricule(e.target.value)} />
                     </div>

                     <div className="AllOptionBox">
                        <label htmlFor="OptionBoxDate">Date: </label>
                        <input type="date" id='OptionBoxDate' value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                     </div>

                     <div className="AllOptionBox">
                        <label htmlFor="OptionBoxDateRange">Date max: </label>
                        <input type="date" id='OptionBoxDateRange' value={dateRange} onChange={(e) => setDateRange(e.target.value)} />
                     </div>

                     {/* <div className="AllOptionBox">
                        <label htmlFor="OptionBoxSearch">Rechercher par: </label>
                        <input type={filter === "date" ? "date" : "search"} value={search} onChange={(e) => setSearch(e.target.value)} id="OptionBoxSearch" placeholder='Tapez ici...' />
                     </div> */}
                  </div>
               </div>
               <div className="TableFormContent">
                  {/* <span>Pointage des professeurs</span> */}
                  <div className="TableFormHeader">
                     <span>{filterDate !== nowDate ? 'Date du :' : `Aujourd'hui,`} {filterDate !== nowDate ? filterDate : nowDate}</span>
                     <div className="Vh">
                        <span>Page {pageable.number ? pageable.number + 1 : 1} / {pageable.totalPages ? pageable.totalPages : 1}</span>
                        <ReactPaginate
                           previousLabel={<RemixIcons.RiArrowDropLeftFill size={44} />}
                           nextLabel={<RemixIcons.RiArrowDropRightFill size={44} />}
                           breakLabel={"..."}
                           pageCount={pageable.totalPages}
                           marginPagesDisplayed={2}
                           pageRangeDisplayed={3}
                           onPageChange={handlePageClick}
                           containerClassName={"pagination"}
                           pageClassName={"page-item"}
                           pageLinkClassName={"page-link"}
                           previousClassName={"page-item"}
                           previousLinkClassName={"page-link"}
                           nextClassName={"page-item"}
                           nextLinkClassName={"page-link"}
                           breakClassName={"page-item"}
                           breakLinkClassName={"page-link"}
                           activeClassName={"active"}
                        />
                        <span>Resultat: {arr.length} / {total}</span>
                     </div>
                  </div>
                  <div className="TableDetails TR" ref={componentPdf}>
                     <table>
                        <thead>
                           <tr>
                              <td>No.</td>
                              <td>Matricule</td>
                              <td>Noms</td>
                              <td>Prenoms</td>
                              <td>Entrée 1</td>
                              <td>Sortie 1</td>
                              <td>Entrée 2</td>
                              <td>Sortie 2</td>
                              <td>Entrée 3</td>
                              <td>Sortie 3</td>
                              <td>Entrée 4</td>
                              <td>Sortie 4</td>
                              <td>Date</td>
                           </tr>
                        </thead>
                        <tbody>
                           {
                              arr.map((item, index) => {
                                 return (
                                    <tr key={index}>
                                       <td>{index + 1}</td>
                                       <td>{item.enseignant.matricule}</td>
                                       <td>{item.enseignant.firstName}</td>
                                       <td>{item.enseignant.lastName}</td>
                                       <td>{item.getTimeIn1 ? item.getTimeIn1 : "---"}</td>
                                       <td>{item.getTimeOut1 ? item.getTimeOut1 : "---"}</td>
                                       <td>{item.getTimeIn2 ? item.getTimeIn2 : "---"}</td>
                                       <td>{item.getTimeOut2 ? item.getTimeOut2 : "---"}</td>
                                       <td>{item.getTimeIn3 ? item.getTimeIn3 : "---"}</td>
                                       <td>{item.getTimeOut3 ? item.getTimeOut3 : "---"}</td>
                                       <td>{item.getTimeIn4 ? item.getTimeIn4 : "---"}</td>
                                       <td>{item.getTimeOut4 ? item.getTimeOut4 : "---"}</td>
                                       <td>{item.date}</td>
                                    </tr>
                                 )
                              })
                           }
                        </tbody>
                     </table>
                  </div>
                  <div className="TableDetails">
                     <table>
                        <thead>
                           <tr>
                              <td>No.</td>
                              <td>Matricule</td>
                              <td>Noms</td>
                              <td>Prenoms</td>
                              <td>Entrée</td>
                              <td>Sortie</td>
                              <td>Date</td>
                              <td>Détails</td>
                           </tr>
                        </thead>
                        <tbody>
                           {
                              arr.map((item, index) => {
                                 return (
                                    <tr key={index}>
                                       <td>{index + 1}</td>
                                       <td>{item.enseignant.matricule}</td>
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
                                       <td>{item.date}</td>
                                       <td className='TdLink' onClick={() => patch(item.id)}>
                                          <RemixIcons.RiArrowRightUpLine />
                                       </td>
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
      </>
   )
}

export default PointageProfesseur