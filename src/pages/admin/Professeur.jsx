import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import * as RemixIcons from "react-icons/ri"
import { toast } from 'react-hot-toast'
import { useBarcode } from '@createnextapp/react-barcode'
import CodeBar from 'react-barcode'
import ReactPaginate from 'react-paginate'
import { useReactToPrint } from 'react-to-print'
import dateFormat from 'dateformat'
import { PulseLoader } from 'react-spinners'
import { professeur_service } from '../../services/professeur_service'
import { account_service } from '../../services/account_service'
import '../../styles/cardschoolteacher.scss'
import placeholderImage from '../../images/profil/placeholder.jpg'
import tampon from '../../images/tampon/tampon.png'
import logoEntreprise from '../../images/logo/logoEntreprise.png'

const Professeur = () => {
   const Navigate = useNavigate()
   const Location = useLocation()

   const [professeur, setProfesseur] = useState({
      firstName: "",
      lastName: "",
      schoolMatricule: ""
   })
   const date = new Date()
   const nowDate = dateFormat(date, "yyyy-mm-dd")
   const [order, setOrder] = useState('asc')
   // const [filter, setFilter] = useState('firstName')
   const [statut, setStatut] = useState('ACTIF')
   // const [search, setSearch] = useState('')
   const [form, setForm] = useState(false)
   const [arr, setArr] = useState([])
   const [arrayTeacher, setArrayTeacher] = useState([])
   const [formDetails, setFormDetails] = useState(false)
   const [cardSchool, setCardSchool] = useState(false)
   const [exportWait, setExportWait] = useState(false)
   const [exportWaitByFilter, setExportWaitByFilter] = useState(false)
   const [id, setId] = useState(null)
   const [file, setFile] = useState(null)
   const [pageable, setPageable] = useState({})
   const [currentPage, setCurrentPage] = useState(0)
   const [image, setImage] = useState('')
   const [getImage, setGetImage] = useState('')
   const imageRef = useRef(null)
   const importRef = useRef(null)
   const clickReset = useRef(null)
   const imageTypes = ['image/png', 'image/jpg', 'image/jpeg']
   const [refresh, setRefresh] = useState(0)

   const componentPdf = useRef()
   const filterCardPdf = useRef()
   const oneCardPdf = useRef()
   const matriculeSchool = arr.filter((item) => item.id === id).map((item) => item.schoolMatricule).toString()
   const matricule = arr.filter((item) => item.id === id).map((item) => item.matricule).toString()

   const handleAddTeacher = (e) => {
      setProfesseur({
         ...professeur, [e.target.name]: e.target.value
      })
   }

   const patch = (itemId) => {
      Navigate(`/admin/professeurs/details/${itemId}`)
      setId(itemId)
      setGetImage('')
      setRefresh((current) => current + 1)
   }

   const callAddForm = () => {
      Navigate('/admin/professeurs/new')
   }

   const CancelModal = () => {
      Navigate('/admin/professeurs')
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
               professeur_service.upload(formData)
                  .then((res) => {
                     setRefresh((current) => current + 1)
                     Navigate('/admin/professeurs')
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
            professeur_service.uploadProfil(matricule, formData)
               .then((res) => {
                  setRefresh((current) => current + 1)
                  Navigate(`/admin/professeurs/details/${id}`)
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
         professeur_service.getProfil(matriculeSchool)
            .then((res) => {
               const imageBuffer = res.data
               const imageData = new Blob([imageBuffer])
               const imageUrl = URL.createObjectURL(imageData)
               setImage(imageUrl)
            })
            .catch((err) => {
               if (err.response.status === 404 && getImage === '') {
                  if (cardSchool === true) {
                     toast.error("Aucun profil ajouté !")
                  }
               }
            })
      }
      //  eslint-disable-next-line
   }, [refresh, cardSchool])

   useEffect(() => {
      const modal = () => {
         if (Location.pathname === "/admin/professeurs/new") { setForm(true) }
         else { setForm(false) }
      }
      modal()
   }, [form, Location.pathname])

   useEffect(() => {
      professeur_service.getAllshow(currentPage, 20, order)
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
                  toast.error("Erreur, contactez l'administrateur !", {
                     style: {
                        textAlign: 'center'
                     }
                  })
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
   }, [order, Navigate, currentPage, refresh])

   useEffect(() => {
      professeur_service.getAll(0, 1000000, order)
         .then((res) => {
            setArrayTeacher(res.data.content)
         })
   }, [order])

   const arrayResult = arr.filter((item) => {
      return item.status.name === statut
   })


   const addProfesseur = (e) => {
      e.preventDefault()
      if (professeur.firstName === "" || professeur.lastName === "" || professeur.schoolMatricule === "") {
         toast.error("Remplir tous les champs !")
      }
      else {
         professeur_service.add(professeur)
            .then((res) => {
               setRefresh((current) => current + 1)
               toast.success("Professeur ajoutée avec succès !")
               setProfesseur({
                  firstName: "",
                  lastName: "",
                  schoolMatricule: ""
               })
               Navigate('/admin/professeurs')
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
                  toast.error("Erreur, contactez l'administrateur !", {
                     style: {
                        textAlign: 'center'
                     }
                  })
               }
               else if (err.response.status === 500) {
                  toast.error("Erreur interne du serveur !")
               }
               else {
                  toast.error("Erreur de données professeurs !")
                  account_service.logoutAdmin()
                  Navigate("/auth/login")
               }
            })
      }
   }

   useEffect(() => {
      const modalDetails = () => {
         if (Location.pathname === `/admin/professeurs/details/${id}`) {
            setFormDetails(true)
         }
         else { setFormDetails(false) }
      }
      modalDetails()
   }, [formDetails, Location.pathname, id, matriculeSchool])

   const { inputRef } = useBarcode({
      value: id !== null ? matricule : 'vide',
      options: {
         displayValue: false,
         margin: 1,
         height: 18,
         width: 1
      }
   })

   const downloadBarcode = () => {
      const canvas = document.getElementById("mybarcode")
      const pngUrl = canvas
         .toDataURL("image/png")
         .replace("image/png", "image/octet-stream")
      let downloadLink = document.createElement("a")
      downloadLink.href = pngUrl
      downloadLink.download = `${matriculeSchool}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
   }

   const handlePageClick = (data) => {
      setRefresh((current) => current + 1)
      setCurrentPage(data.selected)
   }

   const desactivated = () => {
      professeur_service.statusChange(matricule)
         .then((res) => {
            setRefresh((current) => current + 1)
            toast.success("Professeur désactivé !")
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
               toast.error("Erreur, contactez l'administrateur !", {
                  style: {
                     textAlign: 'center'
                  }
               })
            }
            else if (err.response.status === 500) {
               toast.error("Erreur interne du serveur !")
            }
            else {
               toast.error("Erreur de données professeurs !")
               account_service.logoutAdmin()
               Navigate("/auth/login")
            }
         })
   }

   const activated = () => {
      professeur_service.statusChange(matricule)
         .then((res) => {
            setRefresh((current) => current + 1)
            toast.success("Professeur activé !")
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
               toast.error("Erreur, contactez l'administrateur !", {
                  style: {
                     textAlign: 'center'
                  }
               })
            }
            else if (err.response.status === 500) {
               toast.error("Erreur interne du serveur !")
            }
            else {
               toast.error("Erreur de données professeurs !")
               account_service.logoutAdmin()
               Navigate("/auth/login")
            }
         })
   }

   const exportAllCard = useReactToPrint({
      content: () => componentPdf.current,
      documentTitle: `Toutes les Cartes professeurs ${nowDate}`,
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
      documentTitle: `Toutes les Cartes professeurs par statut: ${statut} ${nowDate}`,
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
         <div className="NoNameTeacher AllCard">
            <div className="FormatA4Teacher" ref={componentPdf}>
               {
                  arrayTeacher.filter((item) => item.photoLink !== null).map((item, index) => {
                     return (
                        <div className="CardSchoolTeacher" key={index}>
                           <div className="MottoTeacher">
                              <small>republique du cameroun --paix-travail-patrie</small>
                              <small>republic of cameroon --peace-work-fatherland</small>
                           </div>
                           <span className='NameSchoolTeacher'>college bilingue de la reunification (tankou)</span>
                           <span className='LabelCardTeacher'>carte d'identité / id card</span>
                           <div className="MainContentTeacher">
                              <div className="AllPictureTeacher">
                                 <div className="PictureStudentTeacher " id='Profil'>
                                    <img src={item.photoLink} alt="" />
                                 </div>
                              </div>
                              <div className="SignatureTeacher">
                                 <img src={tampon} alt="" />
                              </div>
                              <div className="DetailsStudentTeacher">
                                 <div className="leftTeacher">
                                    <span className='LabelLineTeacher'>
                                       <span>Nom</span>
                                       <span>Firstname</span>
                                    </span>
                                    <span className='LabelLineTeacher'>
                                       <span>Prénoms</span>
                                       <span>Lastname</span>
                                    </span>
                                 </div>
                                 <div className="rightTeacher">
                                    <span className='ValueLineTeacher'>{item.firstName ? item.firstName : "---"}</span>
                                    <span className='ValueLineTeacher'>{item.lastName ? item.lastName : "---"}</span>
                                 </div>
                                 <div className="LogoEtaTeacher ">
                                    <img src={logoEntreprise} alt="" />
                                 </div>
                              </div>
                           </div>
                           <div className="FooterTeacher">
                              <div className="YearTeacher">
                                 <span className='LabelLineTeacher'>
                                    <span>Matricule</span>
                                    <span>Registrat.N°</span>
                                 </span>
                                 <span className='ValueLineTeacher'>{item.schoolMatricule ? item.schoolMatricule : "---"}</span>
                              </div>
                              <div className="CodebarTeacher">
                                 <CodeBar
                                    value={item.matricule}
                                    displayValue={false}
                                    margin={2}
                                    height={18}
                                    width={1}
                                 />
                              </div>
                           </div>
                        </div>
                     )
                  })
               }
            </div>
         </div>

         <div className="NoNameTeacher ByFilter">
            <div className="FormatA4Teacher" ref={filterCardPdf}>
               {
                  arrayResult.filter((item) => item.photoLink !== null).map((item, index) => {
                     return (
                        <div className="CardSchoolTeacher" key={index}>
                           <div className="MottoTeacher">
                              <small>republique du cameroun --paix-travail-patrie</small>
                              <small>republic of cameroon --peace-work-fatherland</small>
                           </div>
                           <span className='NameSchoolTeacher'>college bilingue de la reunification (tankou)</span>
                           <span className='LabelCardTeacher'>carte d'identité / id card</span>
                           <div className="MainContentTeacher">
                              <div className="AllPictureTeacher">
                                 <div className="PictureStudentTeacher " id='Profil'>
                                    <img src={item.photoLink} alt="" />
                                 </div>
                              </div>
                              <div className="SignatureTeacher">
                                 <img src={tampon} alt="" />
                              </div>
                              <div className="DetailsStudentTeacher">
                                 <div className="leftTeacher">
                                    <span className='LabelLineTeacher'>
                                       <span>Nom</span>
                                       <span>Firstname</span>
                                    </span>
                                    <span className='LabelLineTeacher'>
                                       <span>Prénoms</span>
                                       <span>Lastname</span>
                                    </span>
                                 </div>
                                 <div className="rightTeacher">
                                    <span className='ValueLineTeacher'>{item.firstName ? item.firstName : "---"}</span>
                                    <span className='ValueLineTeacher'>{item.lastName ? item.lastName : "---"}</span>
                                 </div>
                                 <div className="LogoEtaTeacher ">
                                    <img src={logoEntreprise} alt="" />
                                 </div>
                              </div>
                           </div>
                           <div className="FooterTeacher">
                              <div className="YearTeacher">
                                 <span className='LabelLineTeacher'>
                                    <span>Matricule</span>
                                    <span>Registrat.N°</span>
                                 </span>
                                 <span className='ValueLineTeacher'>{item.schoolMatricule ? item.schoolMatricule : "---"}</span>
                              </div>
                              <div className="CodebarTeacher">
                                 <CodeBar
                                    value={item.matricule}
                                    displayValue={false}
                                    margin={2}
                                    height={18}
                                    width={1}
                                 />
                              </div>
                           </div>
                        </div>
                     )
                  })
               }
            </div>
         </div>

         <div className="NoNameTeacher">
            <div className="FormatA4Teacher" ref={oneCardPdf}>

               <div className="CardSchoolTeacher">
                  <div className="MottoTeacher">
                     <small>republique du cameroun --paix-travail-patrie</small>
                     <small>republic of cameroon --peace-work-fatherland</small>
                  </div>
                  <span className='NameSchoolTeacher'>college bilingue de la reunification (tankou)</span>
                  <span className='LabelCardTeacher'>carte d'identité / id card</span>
                  <div className="MainContentTeacher">
                     <div className="AllPictureTeacher">
                        <div className="PictureStudentTeacher PictureProfTeacher" id='Profil'>
                           <img src={image} alt="" />
                        </div>
                     </div>
                     <div className="SignatureTeacher">
                        <img src={tampon} alt="" />
                     </div>
                     <div className="DetailsStudentTeacher">
                        <div className="leftTeacher">
                           <span className='LabelLineTeacher'>
                              <span>Nom</span>
                              <span>Firstname</span>
                           </span>
                           <span className='LabelLineTeacher'>
                              <span>Prénoms</span>
                              <span>Lastname</span>
                           </span>
                        </div>
                        <div className="rightTeacher">
                           <span className='ValueLineTeacher'>{arr.filter((item) => item.id === id).map((item) => item.firstName)}</span>
                           <span className='ValueLineTeacher'>{arr.filter((item) => item.id === id).map((item) => item.lastName)}</span>
                        </div>
                        <div className="LogoEtaTeacher ">
                           <img src={logoEntreprise} alt="" />
                        </div>
                     </div>
                  </div>
                  <div className="FooterTeacher">
                     <div className="YearTeacher">
                        <span className='LabelLineTeacher'>
                           <span>Matricule</span>
                           <span>Registrat.N°</span>
                        </span>
                        <span className='ValueLineTeacher'>{arr.filter((item) => item.id === id).map((item) => item.schoolMatricule)}</span>
                     </div>
                     <div className="CodebarTeacher">
                        <canvas id="mybarcode" ref={inputRef} onClick={downloadBarcode} />
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className={form ? "ModalForm" : "ModalForm None"}>
            <div className='ModalFormHeader'>
               <h3>Ajouter un Professeur</h3>
               <span onClick={CancelModal} className='BtnClose'>
                  <RemixIcons.RiCloseLine />
               </span>
            </div>
            <form onSubmit={addProfesseur} className='form'>
               <div className="InputBox2">
                  <label htmlFor="firstName">Nom: </label>
                  <input type="text" name='firstName' id='firstName' value={professeur.firstName} onChange={handleAddTeacher} autoComplete='off' />
               </div>
               <div className="InputBox2">
                  <label htmlFor="lastName">Prénom: </label>
                  <input type="text" name='lastName' value={professeur.lastName} onChange={handleAddTeacher} autoComplete='off' />
               </div>
               <div className="InputBox2">
                  <label htmlFor="schoolMatricule">Matricule: </label>
                  <input type="text" name='schoolMatricule' id='schoolMatricule' value={professeur.schoolMatricule} onChange={handleAddTeacher} autoComplete='off' />
               </div>
               <input type="submit" className='Btn Btn1' value='Ajouter' />
            </form>
         </div>
         <div className={formDetails ? "ModalForm" : "ModalForm None"}>
            <div className='ModalFormHeader'>
               <h3>Détails professeur : {arr.filter((item) => item.id === id).map((item) => item.firstName + " " + item.lastName)}</h3>
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
                     <span>Status :</span>
                  </div>
                  <div className='Result'>
                     <span>{arr.filter((item) => item.id === id).map((item) => item.schoolMatricule ? item.schoolMatricule : '---')}</span>
                     <span>{arr.filter((item) => item.id === id).map((item) => item.firstName ? item.firstName : '---')}</span>
                     <span>{arr.filter((item) => item.id === id).map((item) => item.lastName ? item.lastName : '---')}</span>
                     <span>{arr.filter((item) => item.id === id).map((item) => item.status.name ? item.status.name : '---')}</span>
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
                     {
                        getImage === '' && imageTypes.includes(getImage.type) ?
                           <button className='Btn Btn1' onClick={() => imageRef.current.click()}>Choisir</button> :
                           getImage && imageTypes.includes(getImage.type) ?
                              <button className='Btn Btn1' onClick={uploadPicture}>Importer</button> :
                              <button className='Btn Btn1' onClick={() => imageRef.current.click()}>Choisir</button>
                     }
                  </div>
                  <div className='Result'>
                     <span>{arr.filter((item) => item.id === id).map((item) => item.father_name)}</span>
                     <span>{arr.filter((item) => item.id === id).map((item) => item.mother_name)}</span>
                  </div>
               </div>
            </div>
            <div className="Link">
               <button className='Btn Btn1' onClick={() => setCardSchool(!cardSchool)}>{cardSchool ? "Photo profil" : "Photo profil"} {cardSchool ? <RemixIcons.RiArrowDropUpFill /> : <RemixIcons.RiArrowDropDownFill />}</button>
               <button className='Btn Btn1' onClick={oneExport}>Exporter</button>
               {
                  arr.filter((item) => item.id === id).map((item) => item.status.name === "ACTIF" ?
                     <button className='Btn Btn3' onClick={desactivated}>Désactiver ?</button> :
                     <button className='Btn Btn3' onClick={activated}>Activer ?</button>)
               }
               <button className='Btn Btn2' onClick={CancelModal}>Fermer</button>
            </div>
         </div>
         <form onSubmit={reset} className="Link">
            <button className='Btn Btn1' onClick={exportAllCard}>Exporter tout {exportWait && exportWaitByFilter === false ? <PulseLoader color="#fff" size={5} /> : ""}</button>
            <button className='Btn Btn1' onClick={exportFilter}>Exporter par statut {exportWaitByFilter && exportWait === false ? <PulseLoader color="#fff" size={5} /> : ""}</button>
            <button className='Btn Btn1' onClick={callAddForm}>Ajouter un Prof.</button>
            {
               file ? <button className='Btn Btn3' onClick={uploadFile}>Valider</button> : <button className='Btn Btn3' onClick={() => importRef.current.click()}>Importer Prof.</button>
            }
            <input type="file" ref={importRef} accept='.xls, .xlsx' hidden onChange={(e) => setFile(e.target.files[0])} />
            <input type="reset" hidden ref={clickReset} value="reset" />
         </form>
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
                        <label htmlFor="OptionBoxFilter">Filtrer par: </label>
                        <select name={filter} onChange={(e) => setFilter(e.target.value)} id="OptionBoxFilter">
                           <option value="first_name">Nom</option>
                           <option value="last_name">Prenom</option>
                           <option value="schoolMatricule">Matricule</option>
                        </select>
                     </div> */}
                     <div className="AllOptionBox">
                        <label htmlFor="OptionBoxStatut">Statut: </label>
                        <select name={statut} onChange={(e) => setStatut(e.target.value)} id="OptionBoxStatut">
                           <option value="ACTIF">Actif</option>
                           <option value="INACTIF">Inactif</option>
                        </select>
                     </div>
                     {/* <div className="AllOptionBox">
                        <label htmlFor="OptionBoxSearch">Rechercher par: </label>
                        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} id="OptionBoxSearch" placeholder='Tapez ici...' />
                     </div> */}
                  </div>
               </div>
               <div className="TableFormContent">
                  <div className="TableFormHeader">
                     <span>Liste des professeurs</span>
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
                        <span>Resultat: {arrayResult.length} / {arrayTeacher.length}</span>
                     </div>
                  </div>
                  <div className="TableDetails">
                     <table>
                        <thead>
                           <tr>
                              <td>No.</td>
                              <td>Noms</td>
                              <td>Prenoms</td>
                              <td>Matricule</td>
                              <td>Statut</td>
                              <td>Détails</td>
                           </tr>
                        </thead>
                        <tbody>
                           {
                              arrayResult.map((item, index) => {
                                 return (
                                    <tr key={index}>
                                       <td>{index + 1}</td>
                                       <td>{item.firstName}</td>
                                       <td>{item.lastName}</td>
                                       <td>{item.schoolMatricule}</td>
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
         </div>
      </>
   )
}

export default Professeur