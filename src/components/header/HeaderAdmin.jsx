import React from 'react'
import { useLocation } from 'react-router-dom'
import * as RemixIcons from "react-icons/ri"
import './header.scss'

const SelectLink = ({ urlLink }) => {
   switch (urlLink) {
      case '/admin/dashboard':
         return "TABLEAU DE BORD"
      case '/admin/':
         return "TABLEAU DE BORD"
      case '/admin/professeurs':
         return "PANEL PROFESSEUR"
      case '/admin/professeurs/new':
         return "PANEL PROFESSEUR | Nouveau"
      case '/admin/professeurs/details/':
         return "PANEL PROFESSEUR | Details"
      case '/admin/etudiants':
         return "PANEL ETUDIANT"
      case '/admin/pointage':
         return "PANEL POINTAGE | Professeur"
      case '/admin/pointage/professeurs':
         return "PANEL POINTAGE | Professeur"
      case '/admin/pointage/etudiants':
         return "PANEL POINTAGE | Etudiant"
      case '/admin/users':
         return "USERS"
      case '/admin/verification':
         return "VERIFICATION"
      case '/admin/parametre':
         return "PARAMETRE"
      default:
         return null
   }
}

const HeaderAdmin = ({ menu, setMenu }) => {
   const location = useLocation()
   const isAlreadyLoad = sessionStorage.getItem("is-already-load")

   if (isAlreadyLoad !== "yes") {
      window.location.reload()
      sessionStorage.setItem("is-already-load", "yes")
   }

   return (
      <div className={menu ? "Header OverSide" : "Header"} id='Header'>
         <span className="Logo"><small className="Patch"><SelectLink urlLink={location.pathname} /></small></span>
         <span onClick={() => menu ? setMenu(false) : setMenu(true)}>
            <RemixIcons.RiMenu3Line />
         </span>
      </div>
   )
}

export default HeaderAdmin