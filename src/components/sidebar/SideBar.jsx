import React from 'react'
import * as RemixIcons from "react-icons/ri"
import './sidebar.scss'
import profil from '../../images/profil/user.png'
import { NavLink, useNavigate } from 'react-router-dom'
import { account_service } from '../../services/account_service'
import { Items } from '../../data/Items'
import logo from '../../images/logo/logo-smartsq.png'
import CodeBar from './CodeBar'
import SubMenu from './SubMenu'


const SideBar = ({ menu }) => {
   const Navigate = useNavigate()
   const token = JSON.parse(localStorage.getItem('lkiy-'))
   const logout = (e) => {
      e.preventDefault()
      if (window.confirm("Attention, vous êtes sur le point de vous déconnecter !") === true) {
         account_service.logout()
         sessionStorage.removeItem("is-already-load", "yes")
         Navigate('/auth/login')
      }
   }

   return (
      <div className={menu ? "SideBar OverSide" : "SideBar"}>
         <p className='codeBar'><CodeBar /></p>
         <h3 className="Atf">
            <img src={logo} alt="" />
         </h3>
         <div className="LogoUserBox">
            <div className="LogoUser">
               <div className="LogoBoxCircle">
                  <img src={profil} alt="" />
               </div>
            </div>
            <h3>{token[0].firstName + " " + token[0].lastName}</h3>
            <span>{token[0].rol7su === "hytyimbfdlpo" ? "User" : ""}</span>
         </div>
         <div className="AllItems">
            {
               Items.map((item, index) => {
                  return <SubMenu item={item} key={index} />
               })
            }

            <NavLink to={'/auth/login'} onClick={logout}>
               <i><RemixIcons.RiLogoutBoxLine /></i>
               <span>Exit</span>
            </NavLink>
         </div>
      </div>
   )
}

export default SideBar