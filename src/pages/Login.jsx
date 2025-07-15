import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosConfig from '../axiosConfig';
import logo from '../assets/logo.png';

import { Eye, EyeOff, Loader } from "lucide-react";
import { useAuth } from "../utils/idb";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [loader, setLoader] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();


  const handleSubmit = async (autoEmail = null) => {
    //console.log("comingg");
    setLoader(true);
    if (!autoEmail) {
      if (!email) {
        toast.error("Pls Enter Email", {
            position: "bottom-right",
        });
        return;
      }
      if (!password) {
        toast.error("Pls Enter Password", {
            position: "bottom-right"
        });
        return;
      }
    }
    const values = {
      email:email,
      password:password
    }
    try {  
        const response = await axiosConfig.post('/api/auth/login', values)
        if (response.status == 200) {
          //console.log(response.data);
          
          login(response.data);
          toast.success("Success");
          navigate('/');
        }
    } catch (error) {
        console.log(error.message);
        toast.error('Invalid Login Credentials');
    }
    setLoader(false);
    // const u = {
    //     name: "Test",
    //     email: email,
    //     password : password
    // }
    // login(u);
    // toast.success("Sucess");
    // navigate('/')
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      
      <form className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm space-y-3" onSubmit ={(e) => {
              e.preventDefault(); // prevent form submission
              handleSubmit();
            }}>
        <h2 className="text-2xl font-semibold text-center"><img src={logo} alt="Logo" /></h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Username</label>
          <input
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="space-y-2 relative">
          <label className="block text-sm font-medium">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          {loader && <Loader className="animate-spin h-6 w-6 text-gray-500" />}
          {!loader && <button
            type="submit"
            className="text-sm bg-blue-400 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition cursor-pointer"
          >
            Login
          </button>}
          
        </div>
      </form>
    </div>
  );
};

export default Login;
