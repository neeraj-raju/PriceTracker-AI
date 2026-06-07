import AppRoutes from "./routes/AppRoutes"
import { ToastProvider } from "./context/ToastContext"

function App() {
  return (
    <ToastProvider>
      <div className="w-full min-h-screen bg-black text-white overflow-x-hidden">
        <AppRoutes />
      </div>
    </ToastProvider>
  )
}

export default App