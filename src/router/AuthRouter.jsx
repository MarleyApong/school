import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from '../pages/auth/Login'

const AuthRouter = () => {
    return (
        <Routes>
            <Route path='login' element={<Login/>} />
            <Route path='*' element={<Login />} />
        </Routes>
    )
}

export default AuthRouter