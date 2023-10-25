import React from 'react'
import { Navigate } from 'react-router-dom'
import { account_service } from '../../services/account_service'


const AuthGuard = ({ children }) => {
    let token = JSON.parse(localStorage.getItem('lkiy-'))
    if (!account_service.isLogged() || !token) { 
        return <Navigate to="/auth/login" /> 
    }
    else if (account_service.isLogged() && token[0].rol7su === "hytyimbfdlpo" ) {
        return children
    }
}


export default AuthGuard