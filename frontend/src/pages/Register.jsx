import { useState } from "react"
import { motion } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import {
  User,
  Mail,
  Lock
} from "lucide-react"

import { registerUser } from "../services/authService"

function Register() {

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleRegister = async (e) => {

    e.preventDefault()

    try {

      await registerUser(formData)

      alert("Registration Successful 🚀")

      navigate("/login")

    } catch (error) {

      console.error(error)

      alert("Registration Failed")
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
                  placeholder="Create password"
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