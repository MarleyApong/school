import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import * as RemixIcons from "react-icons/ri"
import { useNavigate, useLocation } from 'react-router-dom'
import { useBarcode } from '@createnextapp/react-barcode'
import CodeBar from 'react-barcode'
import ReactPaginate from 'react-paginate'
import dateFormat from 'dateformat'
import { useReactToPrint } from 'react-to-print'
import { PulseLoader } from 'react-spinners'
import { etudiant_service } from '../../services/etudiant_service'
import { account_service } from '../../services/account_service'
import '../../styles/cardschool.scss'
import placeholderImage from '../../images/profil/placeholder.jpg'
import tampon from '../../images/tampon/tampon.png'
import logoEntreprise from '../../images/logo/logoEntreprise.png'

const Etudiant = () => {
   const Navigate = useNavigate()
   const Location = useLocation()
   const [etudiant, setEtudiant] = useState({
      firstName: "",
      lastName: "",
      classe: "",
      montantPay: "",
      totalPension: "",
      dateOfBirth: "",
      placeOfBirth: "",
      sex: "",
      fatherName: "",
      motherName: "",
      schoolMatricule: ""
   })

   const [order, setOrder] = useState('asc')
   const [filter, setFilter] = useState('firstName')
   const [classe, setClasse] = useState('')
   const [arrayClasse, setArrayClasse] = useState([])
   const [arr, setArr] = useState([])
   const [arrayStudent, setArrayStudent] = useState([])
   const [statut, setStatut] = useState('ACTIF')
   const [sex, setSex] = useState('')
   const [search, setSearch] = useState('')
   const [form, setForm] = useState(false)
   const [formDetails, setFormDetails] = useState(false)
   const [cardSchool, setCardSchool] = useState(false)
   const [exportWait, setExportWait] = useState(false)
   const [exportWaitByFilter, setExportWaitByFilter] = useState(false)
   const [id, setId] = useState(null)
   const [file, setFile] = useState(null)
   const [pageable, setPageable] = useState({})
   const [currentPage, setCurrentPage] = useState(0)
   const [refresh, setRefresh] = useState(0)
   const [image, setImage] = useState('')
   const [getImage, setGetImage] = useState('')
   const imageRef = useRef(null)
   const importRef = useRef(null)
   const clickReset = useRef(null)
   const imageTypes = ['image/png', 'image/jpg', 'image/jpeg']
   const date = new Date()
   const nowDate = dateFormat(date, "yyyy-mm-dd")
   const year = dateFormat(date, "yyyy")
   // const [mapImage, setMapImage] = useState('')
   // const allImage = []

   const componentPdf = useRef()
   const filterCardPdf = useRef()
   const oneCardPdf = useRef()
   const matriculeSchool = arr.filter((item) => item.id === id).map((item) => item.schoolMatricule).toString()
   const matricule = arr.filter((item) => item.id === id).map((item) => item.matricule).toString()

   const handleAddStudent = (e) => {
      setEtudiant({
         ...etudiant, [e.target.name]: e.target.value
      })
   }

   const patch = (itemId) => {
      Navigate(`/admin/etudiants/details/${itemId}`)
      setId(itemId)
      setGetImage('')
      setImage('')
      setRefresh((current) => current + 1)
   }

   const callAddForm = () => {
      Navigate('/admin/etudiants/new')
   }

   const CancelModal = () => {
      setRefresh((current) => current + 1)
      Navigate('/admin/etudiants')
      setTimeout(() => {
         setId(null)
      }, 1000)
   }

   const reset = (e) => {
      e.preventDefault()
   }

   const uploadFile = () => {
      let fileTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv']
      if (file) {
         if (file && fileTypes.includes(file.type)) {
            const formData = new FormData()
            formData.append('file', file)
            toast.promise(
               etudiant_service.uploadStudent(formData)
                  .then((res) => {
                     setRefresh((current) => current + 1)
                     Navigate('/admin/etudiants')
                     clickReset.current.click()
                     setFile(null)
                  }),
               {
                  loading: 'Importation en cours...',
                  success: <p>Importation réussie !</p>,
                  error: <p>Importation échouée.</p>,
               }
            )
         }
         else {
            setFile(null)
            toast.error("selectionnez uniquement les fichiers excels !", {
               style: {
                  textAlign: 'center'
               }
            })
         }
      }
   }

   const uploadPicture = () => {
      if (getImage) {
         const formData = new FormData()
         formData.append('file', getImage)
         toast.promise(
            etudiant_service.uploadProfil(matricule, formData)
               .then((res) => {
                  setRefresh((current) => current + 1)
                  Navigate(`/admin/etudiants/details/${id}`)
                  setGetImage('')
                  setRefresh((current) => current + refresh)
               }),
            {
               loading: 'Importation en cours...',
               success: <p>Profil importé !</p>,
               error: <p>Importation échouée !</p>,
            }
         )
      }
      else {
         toast.error("Selectionner une photo pour continuer !")
      }
   }
   useEffect(() => {
      if (id !== null) {
         etudiant_service.getProfil(matriculeSchool)
            .then((res) => {
               const imageBuffer = res.data
               const imageData = new Blob([imageBuffer])
               const imageUrl = URL.createObjectURL(imageData)
               setImage(imageUrl)
            })
            .catch((err) => {
               if (err.response) {
                  if (err.response.status === 404 && getImage === '') {
                     if (cardSchool === true) {
                        toast.error("Aucun profil ajouté !")
                     }
                  }
               }
            })
      }
      //  eslint-disable-next-line
   }, [refresh, cardSchool])

   useEffect(() => {
      const modal = () => {
         if (Location.pathname === "/admin/etudiants/new") { setForm(true) }
         else { setForm(false) }
      }
      modal()
   }, [form, Location.pathname])

   useEffect(() => {
      const loadData = () => {
         etudiant_service.getAllShow(currentPage, 20, filter, search, order, statut, sex, classe)
            .then((res) => {
               setArr(res.data.content)
               setPageable(res.data)
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
                     toast.error("Erreur interne du serveur !")
                  }
                  else {
                     toast.error("Erreur de données etudiant(e)s !")
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
   }, [Navigate, currentPage, refresh, order, filter, search, statut, sex, classe])

   useEffect(() => {
      etudiant_service.getAll(0, 1000000, filter, order, '')
         .then((res) => {
            setArrayStudent(res.data.content)
            setArrayClasse(res.data.content)
         })
   }, [filter, order])

   const newArrayClasse = arrayClasse.filter((elem) => {
      let cache = {}
      return cache[elem.classe] ? 0 : cache[elem.classe] = 1
   })

   useEffect(() => {
      const modalDetails = () => {
         if (Location.pathname === `/admin/etudiants/details/${id}`) {
            setFormDetails(true)
         }
         else { setFormDetails(false) }
      }
      modalDetails()
   }, [formDetails, Location.pathname, id, matriculeSchool])

   const { inputRef } = useBarcode({
      value: matricule ? matricule : 'vide',
      options: {
         displayValue: false,
         margin: 1,
         height: 18,
         width: 1
      }
   })

   const addEtudiant = (e) => {
      e.preventDefault()
      if (etudiant.firstName === "" || etudiant.lastName === "" || etudiant.classe === "" || etudiant.montantPay === "" || etudiant.totalPension === "" || etudiant.dateOfBirth === "" || etudiant.placeOfBirth === "" || etudiant.sex === "" || etudiant.fatherName === "" || etudiant.motherName === "") {
         toast.error("Remplir tous les champs !")
      }
      else {
         etudiant_service.add(etudiant)
            .then((res) => {
               setEtudiant({
                  firstName: "",
                  lastName: "",
                  classe: "",
                  montantPay: "",
                  totalPension: "",
                  dateOfBirth: "",
                  placeOfBirth: "",
                  sex: "",
                  fatherName: "",
                  motherName: "",
                  schoolMatricule: ""
               })
               toast.success("Etudiant(e) ajouté(e) avec succès !")
               setRefresh((current) => current + 1)
               setId(null)
               Navigate('/admin/etudiants/')
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
                  toast.error("Erreur, contactez l'administrateur !")
               }
               else if (err.response.status === 500) {
                  toast.error("Erreur interne du serveur !")
               }
               else {
                  toast.error("Erreur de données etudiant(e)s !")
                  account_service.logoutAdmin()
                  Navigate("/auth/login")
               }
            })
      }
   }

   const handlePageClick = (data) => {
      setRefresh((current) => current + 1)
      setCurrentPage(data.selected)
   }

   const desactivated = () => {
      etudiant_service.statusChange(matricule)
         .then((res) => {
            setRefresh((current) => current + 1)
            toast.success("Etudiant désactivé !")
            Navigate('/admin/etudiants')
            setTimeout(() => {
               setId(null)
            }, 1000)
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
                  toast.error("Erreur interne du serveur !")
               }
               else {
                  toast.error("Erreur de données professeurs !")
                  account_service.logoutAdmin()
                  Navigate("/auth/login")
               }
            }
            else {

            }
         })
   }

   const activated = () => {
      etudiant_service.statusChange(matricule)
         .then((res) => {
            setRefresh((current) => current + 1)
            toast.success("Etudiant activé !")
            Navigate('/admin/etudiants')
            setTimeout(() => {
               setId(null)
            }, 1000)
         })
         .catch((err) => {
            if (err) {
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
                  toast.error("Erreur interne du serveur !")
               }
               else {
                  toast.error("Erreur de données professeurs !")
                  account_service.logoutAdmin()
                  Navigate("/auth/login")
               }
            }
         })
   }

   const exportAllCard = useReactToPrint({
      content: () => componentPdf.current,
      documentTitle: `Toutes les Cartes etudiantes ${nowDate}`,
      onBeforeGetContent: () => {
         setExportWait(true)
         setExportWaitByFilter(false)
      },
      onAfterPrint: () => {
         setExportWait(false)
         setExportWaitByFilter(false)
      }
   })

   const exportFilter = useReactToPrint({
      content: () => filterCardPdf.current,
      documentTitle: `Toutes les Cartes etudiantes par ${filter} ${nowDate}`,
      onBeforeGetContent: () => {
         setExportWaitByFilter(true)
         setExportWait(false)
      },
      onAfterPrint: () => {
         setExportWaitByFilter(false)
         setExportWait(false)
      }
   })

   const oneExport = useReactToPrint({
      content: () => oneCardPdf.current,
      documentTitle: `Carte ${matriculeSchool}`
   })

   return (
      <>
         <div className="NoName AllCard">
            <div className="FormatA4" ref={componentPdf}>
               {
                  arrayStudent.filter((item) => item.photoLink !== null).map((item, index) => {
                     return (
                        <div className="CardSchool" key={index}>
                           <div className="Motto">
                              <small>republique du cameroun --paix-travail-patrie</small>
                              <small>republic of cameroon --peace-work-fatherland</small>
                           </div>
                           <span className='NameSchool'>college bilingue de la reunification (tankou)</span>
                           <span className='LabelCard'>carte d'identité / id card</span>
                           <div className="MainContent">
                              <div className="AllPicture">
                                 <div className="PictureStudent" id='Profil'>
                                    <img src={item.photoLink} alt="" />
                                 </div>
                              </div>
                              <div className="Signature">
                                 <img src={tampon} alt="" />
                              </div>
                              <div className="DetailsStudent">
                                 <div className="left">
                                    <span className='LabelLine'>
                                       <span>Nom</span>
                                       <span>Firstname</span>
                                    </span>
                                    <span className='LabelLine'>
                                       <span>Prénoms</span>
                                       <span>Lastname</span>
                                    </span>
                                    <span className='LabelLine'>
                                       <span>Né(e) le</span>
                                       <span>Born on</span>
                                    </span>
                                    <span className='LabelLine'>
                                       <span>Sexe</span>
                                       <span>Sex</span>
                                    </span>
                                    <span className='LabelLine'>
                                       <span>Classe</span>
                                       <span>Class</span>
                                    </span>
                                    <span className='LabelLine'>
                                       <span>Père</span>
                                       <span>Father</span>
                                    </span>
                                    <span className='LabelLine'>
                                       <span>Mère</span>
                                       <span>Mother</span>
                                    </span>
                                 </div>
                                 <div className="right rightAll">
                                    <span className='ValueLine'>{item.firstName ? item.firstName : '-'}</span>
                                    <span className='ValueLine'>{item.lastName ? item.lastName : '-'}</span>
                                    <span className='ValueLine'>{item.dateOfBirth ? item.dateOfBirth : '-'}</span>
                                    <span className='ValueLine'>{item.sex ? item.sex : '-'}</span>
                                    <span className='ValueLine'>{item.classe ? item.classe : '-'}</span>
                                    <span className='ValueLine'>{item.fatherName ? item.fatherName : '-'}</span>
                                    <span className='ValueLine'>{item.motherName ? item.motherName : '-'}</span>
                                 </div>
                                 <div className="LogoEta">
                                    <img src={logoEntreprise} alt="" />
                                 </div>
                              </div>
                           </div>
                           <div className="Footer">
                              <div className="Mama">
                                 <div className="Year">
                                    <span className='LabelLine'>
                                       <span>Matricule</span>
                                       <span>Registration N°</span>
                                    </span>
                                    <span className='ValueLine'>{item.schoolMatricule}</span>
                                 </div>
                                 <div className="Codebar">
                                    <CodeBar
                                       value={item.matricule}
                                       displayValue={false}
                                       margin={2}
                                       height={18}
                                       width={1}
                                    />
                                    {/* <canvas id="mybarcode" ref={inputRef} /> */}
                                 </div>
                              </div>

                              <div className="Year Year-Place">
                                 <span className='LabelLine'>
                                    <span>Année</span>
                                    <span>School year</span>
                                 </span>
                                 <span className='ValueLine'>{year - 1}/{year}</span>
                              </div>
                           </div>
                        </div>
                     )
                  })
               }
            </div>
         </div>
         <div className="NoName ByFilter">
            <div className="FormatA4" ref={filterCardPdf}>
               {
                  arr.filter((item) => item.photoLink !== null).map((item, index) => {
                     return (
                        <div className="CardSchool" key={index}>
                           <div className="Motto">
                              <small>republique du cameroun --paix-travail-patrie</small>
                              <small>republic of cameroon --peace-work-fatherland</small>
                           </div>
                           <span className='NameSchool'>college bilingue de la reunification (tankou)</span>
                           <span className='LabelCard'>carte d'identité / id card</span>
                           <div className="MainContent">
                              <div className="AllPicture">
                                 <div className="PictureStudent" id='Profil'>
                                    <img src={item.photoLink} alt="" />
                                 </div>
                              </div>
                              <div className="Signature">
                                 <img src={tampon} alt="" />
                              </div>
                              <div className="DetailsStudent">
                                 <div className="left">
                                    <span className='LabelLine'>
                                       <span>Nom</span>
                                       <span>Firstname</span>
                                    </span>
                                    <span className='LabelLine'>
                                       <span>Prénoms</span>
                                       <span>Lastname</span>
                                    </span>
                                    <span className='LabelLine'>
                                       <span>Né(e) le</span>
                                       <span>Born on</span>
                                    </span>
                                    <span className='LabelLine'>
                                       <span>Sexe</span>
                                       <span>Sex</span>
                                    </span>
                                    <span className='LabelLine'>
                                       <span>Classe</span>
                                       <span>Class</span>
                                    </span>
                                    <span className='LabelLine'>
                                       <span>Père</span>
                                       <span>Father</span>
                                    </span>
                                    <span className='LabelLine'>
                                       <span>Mère</span>
                                       <span>Mother</span>
                                    </span>
                                 </div>
                                 <div className="right rightAll">
                                    <span className='ValueLine'>{item.firstName ? item.firstName : '-'}</span>
                                    <span className='ValueLine'>{item.lastName ? item.lastName : '-'}</span>
                                    <span className='ValueLine'>{item.dateOfBirth ? item.dateOfBirth : '-'}</span>
                                    <span className='ValueLine'>{item.sex ? item.sex : '-'}</span>
                                    <span className='ValueLine'>{item.classe ? item.classe : '-'}</span>
                                    <span className='ValueLine'>{item.fatherName ? item.fatherName : '-'}</span>
                                    <span className='ValueLine'>{item.motherName ? item.motherName : '-'}</span>
                                 </div>
                                 <div className="LogoEta">
                                    <img src={logoEntreprise} alt="" />
                                 </div>
                              </div>
                           </div>
                           <div className="Footer">
                              <div className="Mama">
                                 <div className="Year">
                                    <span className='LabelLine'>
                                       <span>Matricule</span>
                                       <span>Registration N°</span>
                                    </span>
                                    <span className='ValueLine'>{item.schoolMatricule}</span>
                                 </div>
                                 <div className="Codebar">
                                    <CodeBar
                                       value={item.matricule}
                                       displayValue={false}
                                       margin={2}
                                       height={18}
                                       width={1}
                                    />
                                    {/* <canvas id="mybarcode" ref={inputRef} /> */}
                                 </div>
                              </div>

                              <div className="Year Year-Place">
                                 <span className='LabelLine'>
                                    <span>Année</span>
                                    <span>School year</span>
                                 </span>
                                 <span className='ValueLine'>{year - 1}/{year}</span>
                              </div>
                           </div>
                        </div>
                     )
                  })
               }
            </div>
         </div>

         <div className="NoName">
            <div className="FormatA4" ref={oneCardPdf}>

               <div className="CardSchool">
                  <div className="Motto">
                     <small>republique du cameroun --paix-travail-patrie</small>
                     <small>republic of cameroon --peace-work-fatherland</small>
                  </div>
                  <span className='NameSchool'>college bilingue de la reunification (tankou)</span>
                  <span className='LabelCard'>carte d'identité / id card</span>
                  <div className="MainContent">
                     <div className="AllPicture">
                        <div className="PictureStudent" id='Profil'>
                           <img src={image} alt="" />
                        </div>
                     </div>
                     <div className="Signature">
                        <img src={tampon} alt="" />
                     </div>
                     <div className="DetailsStudent">
                        <div className="left">
                           <span className='LabelLine'>
                              <span>Nom</span>
                              <span>Firstname</span>
                           </span>
                           <span className='LabelLine'>
                              <span>Prénoms</span>
                              <span>Lastname</span>
                           </span>
                           <span className='LabelLine'>
                              <span>Né(e) le</span>
                              <span>Born on</span>
                           </span>
                           <span className='LabelLine'>
                              <span>Sexe</span>
                              <span>Sex</span>
                           </span>
                           <span className='LabelLine'>
                              <span>Classe</span>
                              <span>Class</span>
                           </span>
                           <span className='LabelLine'>
                              <span>Père</span>
                              <span>Father</span>
                           </span>
                           <span className='LabelLine'>
                              <span>Mère</span>
                              <span>Mother</span>
                           </span>
                        </div>
                        <div className="right">
                           <span className='ValueLine'>{arr.filter((item) => item.id === id).map((item) => item.firstName)}</span>
                           <span className='ValueLine'>{arr.filter((item) => item.id === id).map((item) => item.lastName)}</span>
                           <span className='ValueLine'>{arr.filter((item) => item.id === id).map((item) => item.dateOfBirth)}</span>
                           <span className='ValueLine'>{arr.filter((item) => item.id === id).map((item) => item.sex)}</span>
                           <span className='ValueLine'>{arr.filter((item) => item.id === id).map((item) => item.classe)}</span>
                           <span className='ValueLine'>{arr.filter((item) => item.id === id).map((item) => item.fatherName)}</span>
                           <span className='ValueLine'>{arr.filter((item) => item.id === id).map((item) => item.motherName)}</span>
                        </div>
                        <div className="LogoEta">
                           <img src={logoEntreprise} alt="" />
                        </div>
                     </div>
                  </div>
                  <div className="Footer">
                     <div className="Mama">
                        <div className="Year">
                           <span className='LabelLine'>
                              <span>Matricule</span>
                              <span>Registration N°</span>
                           </span>
                           <span className='ValueLine'>{arr.filter((item) => item.id === id).map((item) => item.schoolMatricule)}</span>
                        </div>
                        <div className="Codebar">
                           <canvas id="mybarcode" ref={inputRef} />
                        </div>
                     </div>

                     <div className="Year Year-Place">
                        <span className='LabelLine'>
                           <span>Année</span>
                           <span>School year</span>
                        </span>
                        <span className='ValueLine'>{year - 1}/{year}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className={form ? "ModalForm" : "ModalForm None"}>
            <div className='ModalFormHeader'>
               <h3>Ajouter un Etudiant :</h3>
               <span onClick={CancelModal} className='BtnClose'>
                  <RemixIcons.RiCloseLine />
               </span>
            </div>
            <form onSubmit={addEtudiant} className='form' id='addForm'>
               <div className="InputBox2">
                  <label htmlFor="firstName">Nom :</label>
                  <input type="text" id='firstName' name='firstName' value={etudiant.firstName} onChange={handleAddStudent} autoComplete='off' />
               </div>
               <div className="InputBox2">
                  <label htmlFor="lastName">Prenom :</label>
                  <input type="text" id='lastName' name='lastName' value={etudiant.lastName} onChange={handleAddStudent} autoComplete='off' />
               </div>
               <div className="InputBox2">
                  <label htmlFor="dateOfBirth">Date de naissance :</label>
                  <input type="date" id='dateOfBirth' name='dateOfBirth' value={etudiant.dateOfBirth} onChange={handleAddStudent} autoComplete='off' />
               </div>
               <div className="InputBox2">
                  <label htmlFor="placeOfBirth">Lieu de naissance :</label>
                  <input type="text" id='placeOfBirth' name='placeOfBirth' value={etudiant.placeOfBirth} onChange={handleAddStudent} autoComplete='off' />
               </div>
               <div className="InputBox2">
                  <label htmlFor="sex">Sexe :</label>
                  <select name="sex" id="sex" onChange={handleAddStudent}>
                     <option value=""></option>
                     <option value="M">Masculin</option>
                     <option value="F">Féminin</option>
                  </select>
               </div>
               <div className="InputBox2">
                  <label htmlFor="fatherName">Nom du père: </label>
                  <input type="text" id='fatherName' name='fatherName' value={etudiant.fatherName} onChange={handleAddStudent} autoComplete='off' />
               </div>
               <div className="InputBox2">
                  <label htmlFor="motherName">Nom de la mère :</label>
                  <input type="text" id='motherName' name='motherName' value={etudiant.motherName} onChange={handleAddStudent} autoComplete='off' />
               </div>
               <div className="InputBox2">
                  <label htmlFor="classe">Classe</label>
                  <input type="text" id='classe' name='classe' value={etudiant.classe} onChange={handleAddStudent} autoComplete='off' />
               </div>
               <div className="InputBox2">
                  <label htmlFor="schoolMatricule">Matricule</label>
                  <input type="text" id='schoolMatricule' name='schoolMatricule' value={etudiant.schoolMatricule} onChange={handleAddStudent} autoComplete='off' />
               </div>
               <div className="InputBox2">
                  <label htmlFor="montantPay">Montant payé</label>
                  <input type="text" id='montantPay' name='montantPay' value={etudiant.montantPay} onChange={handleAddStudent} autoComplete='off' />
               </div>
               <div className="InputBox2">
                  <label htmlFor="totalPension">Total pension</label>
                  <input type="text" id='totalPension' name='totalPension' value={etudiant.totalPension} onChange={handleAddStudent} autoComplete='off' />
               </div>
               <input type="submit" className='Btn Btn1' value='Ajouter' />
            </form>
         </div>

         <div className={formDetails ? "ModalForm" : "ModalForm None"}>
            <div className='ModalFormHeader'>
               <h3>Détails étudiant(e) : {arr.filter((item) => item.id === id).map((item) => item.firstName + " " + item.lastName)}</h3>
               <span onClick={CancelModal} className='BtnClose'>
                  <RemixIcons.RiCloseLine />
               </span>
            </div>
            <div className='ModalDetails'>
               <div className="Left">
                  <div className='Info'>
                     <span>Matricule :</span>
                     <span>Noms :</span>
                     <span>Prenoms :</span>
                     <span>Classe :</span>
                     <span>Montant payé :</span>
                     <span>Total pension :</span>
                  </div>
                  <div className='Result'>
                     <span>{arr.filter((item) => item.id === id).map((item) => item.schoolMatricule ? item.schoolMatricule : '---')}</span>
                     <span>{arr.filter((item) => item.id === id).map((item) => item.firstName ? item.firstName : '---')}</span>
                     <span>{arr.filter((item) => item.id === id).map((item) => item.lastName ? item.lastName : '---')}</span>
                     <span>{arr.filter((item) => item.id === id).map((item) => item.classe ? item.classe : '---')}</span>
                     <span>{arr.filter((item) => item.id === id).map((item) => item.montantPay ? item.montantPay : '---')}</span>
                     <span>{arr.filter((item) => item.id === id).map((item) => item.totalPension ? item.totalPension : '---')}</span>
                  </div>
               </div>
               <div className="Right">
                  <CodeBar value={matricule} />
               </div>
            </div>
            <div className={cardSchool ? "AfterDetails" : "AfterDetailsHidden"}>
               <div className="PictureStudent" onClick={() => imageRef.current.click()}>
                  {
                     getImage === '' && arr.filter((item) => item.id === id).map((item) => item.photoLink !== null ?
                        <img src={image} alt="" /> :
                        <img src={placeholderImage} alt="" />)
                  }
                  {
                     getImage !== '' && imageTypes.includes(getImage.type) ?
                        <img src={URL.createObjectURL(getImage)} alt="" /> :
                        ""
                  }
                  <input type="file" id="Profil" hidden ref={imageRef} accept=".jpg, .jpeg, .png" onChange={(e) => setGetImage(e.target.files[0])} />
               </div>
               <div className="Parent">
                  <div className='Info'>
                     <span>Nom du père :</span>
                     <span>Nom de la mère :</span>
                     {
                        getImage === '' && imageTypes.includes(getImage.type) ?
                           <button className='Btn Btn1' onClick={() => imageRef.current.click()}>Choisir</button> :
                           getImage && imageTypes.includes(getImage.type) ?
                              <button className='Btn Btn1' onClick={uploadPicture}>Importer</button> :
                              <button className='Btn Btn1' onClick={() => imageRef.current.click()}>Choisir</button>
                     }
                  </div>
                  <div className='Result'>
                     <span>{arr.filter((item) => item.id === id).map((item) => item.fatherName ? item.fatherName : "---")}</span>
                     <span>{arr.filter((item) => item.id === id).map((item) => item.motherName ? item.motherName : "---")}</span>
                  </div>
               </div>
            </div>
            <div className="Link">
               <button className='Btn Btn1' onClick={() => setCardSchool(!cardSchool)}>{cardSchool ? "Photo profil" : "Photo profil"} {cardSchool ? <RemixIcons.RiArrowDropUpFill /> : <RemixIcons.RiArrowDropDownFill />}</button>
               <button className='Btn Btn1' onClick={oneExport}>Exporter</button>
               {
                  arr.filter((item) => item.matricule === matricule).map((item) => item.status.name === "ACTIF" ?
                     <button className='Btn Btn3' onClick={desactivated}>Désactiver ?</button> :
                     <button className='Btn Btn3' onClick={activated}>Activer ?</button>)
               }
               <button className='Btn Btn2' onClick={CancelModal}>Fermer</button>
            </div>
         </div>

         <form onSubmit={reset} className="Link">
            <button className='Btn Btn1' onClick={exportAllCard}>Exporter tout {exportWait && exportWaitByFilter === false ? <PulseLoader color="#fff" size={5} /> : ""}</button>
            <button className='Btn Btn1' onClick={exportFilter}>Exporter par fltre {exportWaitByFilter && exportWait === false ? <PulseLoader color="#fff" size={5} /> : ""}</button>
            <button className='Btn Btn1' onClick={callAddForm}>Ajouter un Etud.</button>
            {
               file ? <button className='Btn Btn3' onClick={uploadFile}>Valider</button> : <button className='Btn Btn3' onClick={() => importRef.current.click()}>importer Etud.</button>
            }
            <input type="file" ref={importRef} accept='.xls, .xlsx' hidden onChange={(e) => setFile(e.target.files[0])} />
            <input type="reset" hidden ref={clickReset} value="reset" />
         </form>
         <div className="TemplateForm">
            <div className="TableForm">
               <div className="OptionFilter Hc">
                  <h4 className="HeaderTitle">Option de filtre</h4>
                  <div className="AllOptions">
                     <div className="AllOptionBox">
                        <label htmlFor="OptionBoxTrier">Trier par: </label>
                        <select name={order} onChange={(e) => setOrder(e.target.value)} id="OptionBoxTrier">
                           <option value="asc">Ordre croissant</option>
                           <option value="desc">Ordre décroissant</option>
                        </select>
                     </div>
                     <div className="AllOptionBox">
                        <label htmlFor="OptionBoxFilter">Filtrer par: </label>
                        <select name={filter} onChange={(e) => setFilter(e.target.value)} id="OptionBoxFilter">
                           <option value="firstName">Nom</option>
                           <option value="lastName">Prenom</option>
                           <option value="schoolMatricule">Matricule</option>
                        </select>
                     </div>
                     <div className="AllOptionBox">
                        <label htmlFor="OptionBoxStatut">Sexe: </label>
                        <select name={sex} onChange={(e) => setSex(e.target.value)} id="OptionBoxStatut">
                           <option value="">---</option>
                           <option value="M">Masculin</option>
                           <option value="F">Féminin</option>
                        </select>
                     </div>
                     <div className="AllOptionBox">
                        <label htmlFor="OptionBoxStatut">Statut: </label>
                        <select name={statut} onChange={(e) => setStatut(e.target.value)} id="OptionBoxStatut">
                           <option value="ACTIF">Actif</option>
                           <option value="INACTIF">Inactif</option>
                        </select>
                     </div>
                     <div className="AllOptionBox">
                        <label htmlFor="OptionBoxSearch">Rechercher par: </label>
                        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} id="OptionBoxSearch" placeholder='Tapez ici...' />
                     </div>
                  </div>
               </div>
               <div className="TableFormContent">
                  <div className="TableFormHeader">
                     <div className="Vh">
                        <span>Liste des étudiant(e)s</span>
                        <div className="AllOptionBox">
                           <label htmlFor="OptionBoxClass">Classe : </label>
                           <select name={classe} onChange={(e) => setClasse(e.target.value)} id="OptionBoxClass">
                              <option value="">Toutes les classes</option>
                              {
                                 newArrayClasse.map((item, index) => {
                                    return (
                                       <option value={item.classe} key={index}>{item.classe}</option>
                                    )
                                 })
                              }
                           </select>
                        </div>
                     </div>
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
                        <span>Resultat: {arr.length} / {arrayStudent.length}</span>
                     </div>
                  </div>
                  <div className="TableDetails">
                     <table>
                        <thead>
                           <tr>
                              <td>No.</td>
                              <td>Matricule</td>
                              <td>Noms</td>
                              <td>Prenoms</td>
                              <td>Classe</td>
                              <td>Montant payé</td>
                              <td>Total Pension</td>
                              <td>Statut</td>
                              <td>Détails</td>
                           </tr>
                        </thead>
                        <tbody>
                           {
                              arr.map((item, index) => {
                                 return (
                                    <tr key={index}>
                                       <td>{index + 1}</td>
                                       <td>{item.schoolMatricule}</td>
                                       <td>{item.firstName}</td>
                                       <td>{item.lastName}</td>
                                       <td>{item.classe}</td>
                                       <td>{item.montantPay}</td>
                                       <td>{item.totalPension}</td>
                                       <td>{item.status.name}</td>
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
         </div >
      </>
   )
}

export default Etudiant