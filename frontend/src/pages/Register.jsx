import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import {
  User,
  Mail,
  Lock,
  Phone
} from "lucide-react"

import { registerUser, loginUser } from "../services/authService"
import { useToast } from "../context/ToastContext"
import { trackProduct } from "../services/productService"

function Register() {

  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: ""
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleRegister = async (e) => {

    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      showToast("Passwords do not match!", "error")
      return
    }

    try {

      await registerUser(formData)

      // Automatically login the user after successful registration
      const loginResponse = await loginUser({
        email: formData.email,
        password: formData.password
      })

      if (loginResponse && loginResponse.success && loginResponse.data && loginResponse.data.token) {
        localStorage.setItem("token", loginResponse.data.token)
        localStorage.setItem("name", loginResponse.data.name || "")

        // Auto-track product if user pasted a link on home page
        const pendingUrl = sessionStorage.getItem("pendingTrackUrl")
        if (pendingUrl) {
          try {
            showToast("Tracking your product... ⏳", "info")
            await trackProduct(pendingUrl)
            sessionStorage.removeItem("pendingTrackUrl")
            showToast("Product tracked successfully! 🚀", "success")
          } catch (trackError) {
            console.error("Auto tracking failed:", trackError)
            showToast("Could not auto-track the product. Please try adding it manually.", "error")
          }
        }

        navigate("/dashboard", { replace: true })
      } else {
        showToast("Registration Successful! Please log in.", "info")
        navigate("/login")
      }

    } catch (error) {

      console.error(error)

      showToast("Registration Failed", "error")
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex overflow-hidden">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center bg-gradient-to-br from-cyan-500/20 to-emerald-500/20">

        <div className="absolute w-[500px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full" />

        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 px-16"
        >

          <h1 className="text-6xl font-black leading-tight mb-8">
            Create Your <br />

            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Smart Account
            </span>
          </h1>

          <p className="text-zinc-300 text-xl leading-relaxed">
            Join PriceTracker AI and monitor products
            with intelligent automation and analytics.
          </p>

        </motion.div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative">

        <div className="absolute w-[350px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full right-0 top-0" />

        <motion.form
          onSubmit={handleRegister}
          autoComplete="off"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md relative z-10"
        >

          <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl">

            <h2 className="text-4xl font-black mb-3">
              Register
            </h2>

            <p className="text-zinc-400 mb-10">
              Create your account and start tracking prices.
            </p>

            {/* NAME */}
            <div className="mb-6">

              <label className="text-zinc-300 mb-2 block">
                Full Name
              </label>

              <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-4">

                <User className="text-zinc-400" size={20} />

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none px-4 py-4 text-white"
                />

              </div>
            </div>

            {/* EMAIL */}
            <div className="mb-6">

              <label className="text-zinc-300 mb-2 block">
                Email
              </label>

              <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-4">

                <Mail className="text-zinc-400" size={20} />

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  onChange={handleChange}
                  value={formData.email}
                  autoComplete="off"
                  className="w-full bg-transparent outline-none px-4 py-4 text-white"
                />

              </div>
            </div>

            {/* PHONE NUMBER */}
            <div className="mb-6">

              <label className="text-zinc-300 mb-2 block">
                Phone Number (WhatsApp)
              </label>

              <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-4">

                <Phone className="text-zinc-400" size={20} />

                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="Enter phone with country code (e.g. +91...)"
                  onChange={handleChange}
                  value={formData.phoneNumber}
                  autoComplete="off"
                  className="w-full bg-transparent outline-none px-4 py-4 text-white"
                />

              </div>
            </div>

             {/* PASSWORD */}
            <div className="mb-6">

              <label className="text-zinc-300 mb-2 block">
                Password
              </label>

              <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-4">

                <Lock className="text-zinc-400" size={20} />

                <input
                  type="password"
                  name="password"
                  placeholder="Create password"
                  onChange={handleChange}
                  value={formData.password}
                  autoComplete="new-password"
                  className="w-full bg-transparent outline-none px-4 py-4 text-white"
                />

              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="mb-8">

              <label className="text-zinc-300 mb-2 block">
                Confirm Password
              </label>

              <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-4">

                <Lock className="text-zinc-400" size={20} />

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  onChange={handleChange}
                  value={formData.confirmPassword}
                  autoComplete="new-password"
                  className="w-full bg-transparent outline-none px-4 py-4 text-white"
                />

              </div>
            </div>

            {/* BUTTON */}
            <motion.button
              type="submit"
              whileHover={{
                scale: 1.02,
                boxShadow:
                  "0px 0px 25px rgba(34,211,238,0.4)"
              }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-4 rounded-2xl text-lg transition"
            >
              Create Account
            </motion.button>

            {/* LOGIN */}
            <p className="text-zinc-400 text-center mt-8">

              Already have an account?{" "}

              <Link
                to="/login"
                className="text-cyan-400 hover:text-cyan-300"
              >
                Login
              </Link>

            </p>

          </div>

        </motion.form>

      </div>

    </div>
  )
}

export default Register