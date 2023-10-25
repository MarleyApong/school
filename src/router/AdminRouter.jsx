import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { LayoutAdmin, Dashboard, Etudiant, PointageProfesseur, PointageEtudiant, Professeur, Verification, Users } from '../pages/admin'
import SideBarAdmin from '../components/sidebar/SideBarAdmin'
import HeaderAdmin from '../components/header/HeaderAdmin'

const AdminRouter = () => {
   const [menu, setMenu] = useState(false)

   return (
      <div className='Pages'>
         <SideBarAdmin menu={menu} setMenu={setMenu} />
         <div className={menu ? "Main OverSide" : "Main"}>
            <HeaderAdmin menu={menu} setMenu={setMenu} />
            <div className="Content">
               <Routes>
                  <Route element={<LayoutAdmin />}>
                     <Route index element={<Dashboard />} />
                     <Route path='/dashboard' element={<Dashboard />} />
                     <Route path='/etudiants' element={<Etudiant />} />
                     <Route path='/etudiants/details' element={<Etudiant />} />
                     <Route path='/professeurs' element={<Professeur />} />
                     <Route path='/professeurs/details' element={<Professeur />} />
                     <Route path='/etudiants/new' element={<Etudiant />} />
                     <Route path='/professeurs/new' element={<Professeur />} />
                     <Route path='/professeurs/details/:id' element={<Professeur />} />
                     <Route path='/etudiants/details/:id' element={<Etudiant />} />
                     <Route path='/pointage' element={<PointageProfesseur />} />
                     <Route path='/pointage/professeurs' element={<PointageProfesseur />} />
                     <Route path='/pointage/professeurs/:id' element={<PointageProfesseur />} />
                     <Route path='/pointage/etudiants' element={<PointageEtudiant />} />
                     <Route path='/pointage/etudiants/:id' element={<PointageEtudiant />} />
                     <Route path='/verification' element={<Verification />} />
                     <Route path='/verification/tranche' element={<Verification />} />
                     <Route path='/verification/tranche/update/:id' element={<Verification />} />
                     <Route path='/verification/control' element={<Verification />} />
                     <Route path='/verification/tranche/new' element={<Verification />} />
                     <Route path='/verification/control/new' element={<Verification />} />
                     <Route path='/verification/control/update/:id' element={<Verification />} />
                     <Route path='/users' element={<Users />} />
                     <Route path='/users/:id' element={<Users />} />
                     <Route path='/users/new' element={<Users />} />
                     <Route path='*' element={<Dashboard />} />
                  </Route>
               </Routes>
            </div>
         </div>
      </div>
   )
}

export default AdminRouter