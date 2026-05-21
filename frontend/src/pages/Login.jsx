import { useState } from "react"
import { motion } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock } from "lucide-react"

import { loginUser } from "../services/authService"

function Login() {

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleLogin = async (e) => {

    e.preventDefault()

    try {

      const data = await loginUser(formData)

      localStorage.setItem("token", data.token)

      alert("Login Successful 🚀")

      navigate("/dashboard")

    } catch (error) {

      console.error(error)

      alert("Invalid Credentials")
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex overflow-hidden">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">

        <div className="absolute w-[500px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full" />

        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 px-16"
        >

          <h1 className="text-6xl font-black leading-tight mb-8">
            Welcome Back to <br />

            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              PriceTracker AI
            </span>
          </h1>

          <p className="text-zinc-300 text-xl leading-relaxed">
            Monitor prices intelligently with automation,
            analytics, and real-time alerts.
          </p>

        </motion.div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative">

        <div className="absolute w-[350px] h-[350px] bg-cyan-500/10 blur-[120px] rounded-full right-0 top-0" />

        <motion.form
          onSubmit={handleLogin}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md relative z-10"
        >

          <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl">

            <h2 className="text-4xl font-black mb-3">
              Login
            </h2>

            <p className="text-zinc-400 mb-10">
              Access your dashboard and tracked products.
            </p>

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
                  className="w-full bg-transparent outline-none px-4 py-4 text-white"
                />

              </div>
            </div>

            {/* PASSWORD */}
            <div className="mb-8">

              <label className="text-zinc-300 mb-2 block">
                Password
              </label>

              <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-4">

                <Lock className="text-zinc-400" size={20} />

                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  onChange={handleChange}
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
                  "0px 0px 25px rgba(16,185,129,0.5)"
              }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-2xl text-lg transition"
            >
              Login
            </motion.button>

            {/* REGISTER */}
            <p className="text-zinc-400 text-center mt-8">

              Don’t have an account?{" "}

              <Link
                to="/register"
                className="text-emerald-400 hover:text-emerald-300"
              >
                Register
              </Link>

            </p>

          </div>

        </motion.form>

      </div>

    </div>
  )
}

export default Login