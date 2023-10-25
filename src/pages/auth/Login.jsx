import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { PulseLoader } from 'react-spinners'
import '../../styles/form.scss'
import logo from '../../images/logo/logo-smart.png'
import { authentification } from '../../services/authentification'
import { account_service } from '../../services/account_service'

const Login = () => {
   const Navigate = useNavigate()
   const [login, setLogin] = useState('')
   const [password, setPassword] = useState('')
   const [wait, setWait] = useState(true)

   const handleLogin = (e) => {
      e.preventDefault()
      if (login === "" || password === "") {
         toast.error("Veuillez remplir tous les champs !")
      }
      else {
         setWait(false)
         authentification.login(login, password)
            .then((res) => {
               if (res.data.roles.join("") === "ROLE_SUPERADMIN") {
                  const verif = [
                     { "rol7qas": "3esftysaqerchu", "kenkihhgczasxmnv": res.data.refreshToken, "firstName": res.data.user.firstName, "lastName": res.data.user.lastName }
                  ]
                  account_service.saveTokenAdmin(JSON.stringify(verif))
                  Navigate("/admin/")
               }
               else {
                  const verif = [
                     { "rol7su": "hytyimbfdlpo", "kenkihhgczasxmnv": res.data.refreshToken, "firstName": res.data.user.firstName, "lastName": res.data.user.lastName }
                  ]
                  account_service.saveToken(JSON.stringify(verif))
                  Navigate("/")
               }
            })
            .catch((err) => {
               setWait(true)
               if (err.response) {
                  if (err.response.status === 400) {
                     toast.error("Mauvaise requête !")
                  }
                  else if (err.response.data.status === "UNAUTHORIZED") {
                     toast.error("Vous avez été bloqué par votre administrateur !", {
                        style: {
                           textAlign: 'center'
                        }
                     }
                     )
                  }
                  else if (err.response.data.status === 401) {
                     toast.error("Email ou mot de passe incorrect !")
                  }
                  else if (err.response.data.error.toString() === "No value present") {
                    toast.error("Utilisateur inconnu !")
                  }
                  else {
                     toast.error("Erreur interne du serveur !")
                  }
               }
               else {
                  toast.error("La connexion au serveur a échoué !")
               }
            })
      }
   }

   return (
      <div className="login">
         <div className="container">
            <div className="left">
               <h1>WELCOME</h1>
               <p>Entrez vos identifiants pour vous connecter à votre compte</p>
            </div>
            <div className="right">
               <form onSubmit={handleLogin} method='post' className="form">
                  <img src={logo} alt="" />
                  <h2>Agent Login</h2>
                  <div className="input_box">
                     <input type="email" value={login} onChange={(e) => setLogin(e.target.value)} placeholder='Email' autoComplete='off' />
                     <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Mot de passe' autoComplete='off' />
                     {
                        wait ?
                           <input type="submit" value='Se connecter' /> :
                           <button>Vérification <PulseLoader color="#fff" size='5' /></button>
                     }
                  </div>
               </form>
               <p>Copyright &#xa9;scolarite 2023 | <a target='_blank' href="https://www.allhcorp.com" rel="noreferrer">made by allhcorp</a> </p>
            </div>
         </div>
      </div>
   )
}

export default Login