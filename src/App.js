import { Route, Routes } from 'react-router-dom'
import AuthRouter from './router/AuthRouter'
import AuthGuard from './pages/auth/AuthGuard'
import UserRouter from './router/UserRouter'
import AdminRouter from './router/AdminRouter'
import AuthGuardAdmin from './pages/auth/AuthGuardAdmin'
const App = () => {
  return (
    <Routes>
      <Route path="/*" element={
        <AuthGuard>
          <UserRouter/>
        </AuthGuard>
      } />
      <Route path="/admin/*" element={
        <AuthGuardAdmin>
          <AdminRouter/>
        </AuthGuardAdmin>
      } />
      <Route path="/auth/*" element={<AuthRouter />} />
    </Routes>
  )
}

export default App
