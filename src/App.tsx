import { useEffect } from "react"
import { BrowserRouter } from "react-router-dom"
import { AppRoutes } from "@/routes"
import { ThemeProvider } from "@/context/ThemeContext"
import { NotificationProvider } from "./context/NotificationContext"
import { Toaster } from "@/components/ui/toast"
import { useMasterStore } from "@/store/useMasterStore"
import "./App.css"

function App() {
  const fetchMasters = useMasterStore((s) => s.fetchMasters)

  useEffect(() => {
    fetchMasters()
  }, [fetchMasters])

  return (
    <ThemeProvider>
      <NotificationProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Toaster />
      </NotificationProvider>
    </ThemeProvider>
  )
}

export default App