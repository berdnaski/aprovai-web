import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { Toaster } from "@/components/ui/sonner"
import { RegisterPage } from "@/features/auth/register-page"
import { LoginPage } from "./features/auth/login-page"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/registrar" element={<RegisterPage />} />
          <Route path="/logar" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/registrar" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
