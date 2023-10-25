const saveToken = (token) => {
    localStorage.setItem('lkiy-', token)
}

const saveTokenAdmin = (token) => {
    localStorage.setItem('kfx|+rf', token)
}

const logout = () => {
    localStorage.removeItem('lkiy-')
    sessionStorage.removeItem("is-already-load", "yes")
}

const logoutAdmin = () => {
    localStorage.removeItem('kfx|+rf')
    sessionStorage.removeItem("is-already-load", "yes")
}

const isLogged = () => {
    const token = localStorage.getItem('lkiy-')
    return token
}

const isLoggedAdmin = () => {
    const token = JSON.parse(localStorage.getItem('kfx|+rf'))
    return !!token
}

const getToken = () => {
    const token = JSON.parse(localStorage.getItem('lkiy-'))
    return token[0].token
}

const getTokenAdmin = () => {
    const token = JSON.parse(localStorage.getItem('kfx|+rf'))
    return token[0].kenkihhgczasxmnv
}


export const account_service = {
    saveToken,
    saveTokenAdmin,
    logout,
    logoutAdmin,
    isLogged,
    isLoggedAdmin,
    getToken,
    getTokenAdmin
}