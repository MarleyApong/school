import React from 'react'
import * as RemixIcons from "react-icons/ri"
import './sidebar.scss'
import profil from '../../images/profil/admin.png'
import { NavLink, useNavigate } from 'react-router-dom'
import { account_service } from '../../services/account_service'
import { ItemsAdmin } from '../../data/ItemsAdmin'
import logo from '../../images/logo/logo-smartsq.png'
// import CodeBar from '../../components/sidebar/CodeBar'
import SubMenu from '../../components/sidebar/SubMenu'


const SideBarAdmin = ({ menu }) => {
   const Navigate = useNavigate()
   const token = JSON.parse(localStorage.getItem('kfx|+rf'))

   const logout = (e) => {
      e.preventDefault()
      if (window.confirm("Attention, vous êtes sur le point de vous déconnecter !") === true) {
         account_service.logoutAdmin()
         sessionStorage.removeItem("is-already-load", "yes")
         Navigate('/auth/login')
      }
   }

   return (
      <div className={menu ? "SideBar OverSide" : "SideBar"}>
         {/* <CodeBar/> */}
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
            <span>{token[0].rol7qas === "3esftysaqerchu" ? "Super admin" : ""}</span>
         </div>
         <div className="AllItems">
            {
               ItemsAdmin.map((item, index) => {
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

export default SideBarAdmin