import React from 'react'
import { Navigate } from 'react-router-dom'
import { account_service } from '../../services/account_service'


const AuthGuardAdmin = ({ children }) => {
    let token = JSON.parse(localStorage.getItem('kfx|+rf'))
    if (!account_service.isLoggedAdmin() || !token) { 
        return <Navigate to="/auth/login" /> 
    }
    else if (account_service.isLoggedAdmin() && token[0].rol7qas === "3esftysaqerchu" ) {
        return children
    }
}


export default AuthGuardAdmin