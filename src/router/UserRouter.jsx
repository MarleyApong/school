import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Verification from '../pages/users/Verification'
import Login from '../pages/auth/Login'

const UserRouter = () => {
    return (
        <Routes>
            <Route index element={<Verification />} />
            <Route exact path='/' element={<Verification />} />
            <Route path='/verification' element={<Verification />} />
            <Route path='/tranche' element={<Verification />} />
            <Route path='/tranche/update/:id' element={<Verification />} />
            <Route path='/control' element={<Verification />} />
            <Route path='/tranche/new' element={<Verification />} />
            <Route path='/control/new' element={<Verification />} />
            <Route path='/control/update/:id' element={<Verification />} />
            <Route path='*' element={<Login />} />
        </Routes>
    )
}

export default UserRouter