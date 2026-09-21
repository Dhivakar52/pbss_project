import { BrowserRouter } from "react-router-dom"
import { AppRoutes } from "@/routes"
import { ThemeProvider } from "@/context/ThemeContext"
import { NotificationProvider } from "./context/NotificationContext"
import { Toaster } from "@/components/ui/toast"
import "./App.css"

function App() {
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