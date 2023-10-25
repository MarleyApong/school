import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate, useLocation } from 'react-router-dom'
import * as RemixIcons from "react-icons/ri"
import { user_service } from '../../services/user_service'
import { account_service } from '../../services/account_service'
import '../../styles/users.scss'

const Users = () => {
   const Navigate = useNavigate()
   const Location = useLocation()
   const [user, setUser] = useState({
      email: "",
      telephone: "",
      password: "",
      firstName: "",
      lastName: "",
      roleName: ""
   })
   const [order, setOrder] = useState('asc')
   const [filter, setFilter] = useState('firstName')
   const [statut, setStatut] = useState('USER_ENABLED')
   const [search, setSearch] = useState('')
   const [arr, setArr] = useState([])
   const [form, setForm] = useState(false)
   const [formDetails, setFormDetails] = useState(false)
   const [id, setId] = useState(null)
   const [refresh, setRefresh] = useState(0)

   const patch = (itemId) => {
      Navigate(`/admin/users/${itemId}`)
      setId(itemId)
   }

   const handleAddUser = (e) => {
      setUser({
         ...user, [e.target.name]: e.target.value
      })
   }

   const callAddForm = () => {
      Navigate('/admin/users/new')
   }

   const CancelModal = () => {
      Navigate('/admin/users/')
   }

   useEffect(() => {
      const modal = () => {
         if (Location.pathname === "/admin/users/new") { setForm(true) }
         else { setForm(false) }
      }
      modal()
   }, [form, Location.pathname])

   useEffect(() => {
      const loadData = () => {
         user_service.getAll()
            .then((res) => {
               if (order === 'asc') {
                  const sorted = () => {
                     if (filter === "firstName") {
                        return [...res.data.content].sort((a, b) => a.firstName.toLowerCase() > b.firstName.toLowerCase() ? 1 : -1)
                     }
                     else if (filter === "lastName") {
                        return [...res.data.content].sort((a, b) => a.lastName.toLowerCase() > b.lastName.toLowerCase() ? 1 : -1)
                     }
                     else if (filter === "email") {
                        return [...res.data.content].sort((a, b) => a.email.toLowerCase() > b.email.toLowerCase() ? 1 : -1)
                     }
                     else if (filter === "role") {
                        return [...res.data.content].sort((a, b) => a.roles[0].name.toLowerCase() > b.roles[0].name.toLowerCase() ? 1 : -1)
                     }
                     else if (filter === "telephone") {
                        return [...res.data.content].sort((a, b) => a.telephone.toLowerCase() > b.telephone.toLowerCase() ? 1 : -1)
                     }
                     else if (filter === "createdDate") {
                        return [...res.data.content].sort((a, b) => a.createdDate.toLowerCase() > b.createdDate.toLowerCase() ? 1 : -1)
                     }
                  }
                  setArr(sorted)
               }
               else {
                  const sorted = () => {
                     if (filter === "firstName") {
                        return [...res.data.content].sort((a, b) => a.firstName.toLowerCase() < b.firstName.toLowerCase() ? 1 : -1)
                     }
                     else if (filter === "lastName") {
                        return [...res.data.content].sort((a, b) => a.lastName.toLowerCase() < b.lastName.toLowerCase() ? 1 : -1)
                     }
                     else if (filter === "email") {
                        return [...res.data.content].sort((a, b) => a.email.toLowerCase() < b.email.toLowerCase() ? 1 : -1)
                     }
                     else if (filter === "role") {
                        return [...res.data.content].sort((a, b) => a.roles[0].toLowerCase() < b.roles[0].toLowerCase() ? 1 : -1)
                     }
                     else if (filter === "telephone") {
                        return [...res.data.content].sort((a, b) => a.telephone.toLowerCase() < b.telephone.toLowerCase() ? 1 : -1)
                     }
                     else if (filter === "createdDate") {
                        return [...res.data.content].sort((a, b) => a.createdDate.toLowerCase() < b.createdDate.toLowerCase() ? 1 : -1)
                     }
                  }
                  setArr(sorted)
               }
            })
            .catch((err) => {
               if (err.response.status === 400) {
                  toast.error("format inattendu !")
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
                  toast.error("Erreur de données utilisateur !")
                  account_service.logoutAdmin()
                  Navigate("/auth/login")
               }
            })
      }
      loadData()
   }, [order, filter, search, Navigate, refresh])

   useEffect(() => {
      const modalDetails = () => {
         if (Location.pathname === `/admin/users/${id}`) {
            setFormDetails(true)
         }
         else { setFormDetails(false) }
      }
      modalDetails()
   }, [formDetails, Location.pathname, id])

   const arrayResult = arr.filter((item) => {
      return (
         item.firstName.includes(search.toLowerCase()) ||
         item.lastName.includes(search.toLowerCase()) ||
         item.email.includes(search.toLowerCase()) ||
         item.roles[0].name.includes(search.toLowerCase()) ||
         item.telephone.includes(search.toLowerCase()) ||
         item.createdDate.includes(search.toLowerCase())
      )
   }).filter((item) => statut === 'USER_ENABLED' ? item.status.id === 1 : item.status.id === 2)

   const addUsers = (e) => {
      e.preventDefault()
      if (user.firstName === "" || user.lastName === "" || user.telephone === "" || user.email === "" || user.password === "" || user.roleName === "") {
         toast.error("Remplir tous les champs !")
      }
      else {
         user_service.signUp(user)
            .then((res) => {
               setUser({
                  email: "",
                  telephone: "",
                  password: "",
                  firstName: "",
                  lastName: "",
                  roleName: ""
               })
               setRefresh((current) => current + refresh)
               Navigate('/admin/users/')
            })
            .catch((err) => {
               if (err.response.status === 400) {
                  toast.error("Champs mal renseigné ou format inattendu !")
               }
               else if (err.response.status === 401) {
                  toast.error("La session a expiré !")
                  Navigate("/auth/login")
                  account_service.logoutAdmin()
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
                  toast.error("Erreur de données utilisateurs !")
                  Navigate("/auth/login")
                  account_service.logoutAdmin()
               }
            }
            )

      }
   }

   const deleteUser = (id, name) => {
      if (window.confirm(`Supprimer l'utilisateur ${name} ?`)) {
         user_service.deleteUser(id)
            .then((res) => {
               setRefresh((current) => current + refresh)
               toast.success(`Utilisateur ${name} a été supprimé !`)
               Navigate('/admin/users/')
            })
            .catch((err) => {
               toast.error("erreur, quelque chose a mal tourné!")
            })
      }
   }

   const desactiveUser = (id, name) => {
      if (window.confirm(`Bloquer l'utilisateur ${name} ?`)) {
         user_service.changeStatus(id, 0)
            .then((res) => {
               setRefresh((current) => current + refresh)
               toast.success(`Utilisateur ${name} a été bloqué !`)
               Navigate('/admin/users/')
            })
            .catch((err) => {
               toast.error("erreur, quelque chose a mal tourné!")
            })
      }
   }

   const activeUser = (id, name) => {
      if (window.confirm(`Activer l'utilisateur ${name} ?`)) {
         user_service.changeStatus(id, 1)
            .then((res) => {
               setRefresh((current) => current + refresh)
               toast.success(`Utilisateur ${name} a été activé !`)
               Navigate('/admin/users/')
            })
            .catch((err) => {
               toast.error("erreur, quelque chose a mal tourné!")
            })
      }
   }

   return (
      <>
         <div className={form ? "ModalForm" : "ModalForm None"}>
            <div className='ModalFormHeader'>
               <h3>Ajouter un utilisateur :</h3>
               <span onClick={CancelModal} className='BtnClose'>
                  <RemixIcons.RiCloseLine />
               </span>
            </div>
            <form onSubmit={addUsers} className='form'>
               <input type="text" placeholder='Nom' name='firstName' value={user.firstName} onChange={handleAddUser} autoComplete='off' />
               <input type="text" placeholder='Prénom' name='lastName' value={user.lastName} onChange={handleAddUser} autoComplete='off' />
               <input type="number" placeholder='Téléphone' name='telephone' value={user.telephone} onChange={handleAddUser} autoComplete='off' />
               <input type="email" placeholder='email' name='email' value={user.email} onChange={handleAddUser} autoComplete='off' />
               <input type="text" placeholder='Mot de passe' name='password' value={user.password} onChange={handleAddUser} autoComplete='off' />
               <div className="InputBox">
                  <label htmlFor="Role">Rôle: </label>
                  <select name="roleName" onChange={handleAddUser} id="Role">
                     <option value="">...</option>
                     <option value="ROLE_USER">Manager</option>
                     <option value="ROLE_SUPERADMIN">Super admin</option>
                  </select>
               </div>
               <input type="submit" className='Btn Btn1' value='Ajouter' />
            </form>
         </div>

         <div className={formDetails ? "ModalForm" : "ModalForm None"}>
            <div className='ModalFormHeader'>
               <h3>Détails de l'utilisateur : {arrayResult.filter((item) => item.userId === id).map((item, index) => item.firstName + " " + item.lastName)}</h3>
               <span onClick={CancelModal} className='BtnClose'>
                  <RemixIcons.RiCloseLine />
               </span>
            </div>
            <div className='ModalDetails'>
               <div className="Left">
                  <div className='Info'>
                     <span>Noms :</span>
                     <span>Prenoms :</span>
                     <span>email :</span>
                     <span>Rôle :</span>
                     <span>Status :</span>
                     <span>Date création :</span>
                     <span>Dernière date création :</span>
                  </div>
                  <div className='Result'>
                     <span>{arr.filter((item) => item.userId === id).map((item) => item.firstName)}</span>
                     <span>{arr.filter((item) => item.userId === id).map((item) => item.lastName)}</span>
                     <span>{arr.filter((item) => item.userId === id).map((item) => item.email)}</span>
                     <span>{arr.filter((item) => item.userId === id).map((item) => item.roles[0].name === "ROLE_SUPERADMIN" ? "Super admin" : "User")}</span>
                     <span>{arr.filter((item) => item.userId === id).map((item) => item.status.name === "USER_ENABLED") ? "Actif" : "Inactif"}</span>
                     <span>{arr.filter((item) => item.userId === id).map((item) => item.createdDate).toString().replace("T", " à ")}</span>
                     <span>{arr.filter((item) => item.userId === id).map((item) => item.dateLastLogin ? item.dateLastLogin : "---").toString().replace("T", " à ")}</span>
                  </div>
               </div>
            </div>
            <div className="Link">
               {
                  arr.filter((item) => item.userId === id).map((item) => item.roles[0].name === "ROLE_SUPERADMIN" ? "" :
                     <>
                        <button className='Btn Btn2' onClick={() => deleteUser(id, item.firstName)}>Supprimer ?</button>
                        {
                           arr.filter((item) => item.userId === id).map((item) => item.status.name.toString() === 'USER_ENABLED' ?
                              <button className='Btn Btn3' onClick={() => desactiveUser(id, item.firstName)}>Bloquer ?</button> :
                              <button className='Btn Btn3' onClick={() => activeUser(id, item.firstName)}>Activer ?</button>)
                        }
                     </>
                  )
               }
               <button className='Btn Btn2' onClick={CancelModal}>Fermer</button>
            </div>
         </div>
         <div className="Link">
            <button className='Btn Btn1' onClick={callAddForm}>Ajouter un user</button>
         </div>
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
                           <option value="firstName">firstName</option>
                           <option value="lastName">lastName</option>
                           <option value="email">Email</option>
                           <option value="role">Rôle</option>
                           <option value="telephone">Téléphone</option>
                           <option value="createdDate">Date création</option>
                           <option value="dateLastLogin">Date dernière connexion</option>
                        </select>
                     </div>
                     <div className="AllOptionBox">
                        <label htmlFor="OptionBoxStatut">Statut: </label>
                        <select name={statut} onChange={(e) => setStatut(e.target.value)} id="OptionBoxStatut">
                           <option value="USER_ENABLED">Actif</option>
                           <option value="">Inactif</option>
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
                     <span>Liste des Utilisateurs</span>
                     <span>Resultat: {arrayResult.length}</span>
                  </div>
                  <div className="TableDetails">
                     <table>
                        <thead>
                           <tr>
                              <td>No.</td>
                              <td>Noms</td>
                              <td>Prenoms</td>
                              <td>Email</td>
                              <td>Rôle</td>
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
                                       <td>{item.email}</td>
                                       <td>{item.roles[0].name === "ROLE_SUPERADMIN" ? "Super admin" : "User"}</td>
                                       <td>{item.status.name === statut ? "Actif" : "Inactif"}</td>
                                       <td className='TdLink' onClick={() => patch(item.userId)}>
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

export default Users