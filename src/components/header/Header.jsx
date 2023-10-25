import React from 'react'
import { useLocation } from 'react-router-dom'
import * as RemixIcons from "react-icons/ri"
import './header.scss'

const SelectLink = ({ urlLink }) => {
   switch (urlLink) {
      case '/dashboard':
         return "VERIFICATION"
      case '/':
         return "VERIFICATION"
      default:
         return null
   }
}

const Header = ({menu, setMenu}) => {
   const location = useLocation()
   const isAlreadyLoad = sessionStorage.getItem("is-already-load")

   if (isAlreadyLoad !== "yes") {
      window.location.reload()
      sessionStorage.setItem("is-already-load", "yes")
   }

   return (
      <div className={menu ? "Header OverSide" : "Header"}>
         <span className="Logo"><small className="Patch"><SelectLink urlLink={location.pathname}/></small></span>
         <span onClick={() => menu ? setMenu(false) : setMenu(true)}>
         <RemixIcons.RiMenu3Line/>
         </span>
      </div>
   )
}

export default Header