import { createRoot } from "react-dom/client";
// import App from "./App";
import "./index.css";

// Reprodução exata da imagem fornecida
const root = document.getElementById("root")!;
root.innerHTML = `
  <div style="
    min-height: 100vh; 
    display: flex; 
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  ">
    <!-- Left Panel - Login Form -->
    <div style="
      width: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      padding: 2rem;
    ">
      <div style="
        width: 100%; 
        max-width: 320px;
        background: white;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      ">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 2rem;">
          <div style="
            width: 48px; 
            height: 48px; 
            border: 3px solid #8b5cf6; 
            border-radius: 50%; 
            margin: 0 auto 1rem;
          "></div>
          <h2 style="
            color: #8b5cf6; 
            font-size: 1rem; 
            margin: 0; 
            font-weight: 400;
          ">Log in / Sign Up On Circle</h2>
        </div>

        <!-- Form -->
        <div style="space-y: 1rem;">
          <!-- Email Field -->
          <div style="margin-bottom: 1rem;">
            <label style="
              display: block; 
              font-size: 0.875rem; 
              color: #6b7280; 
              margin-bottom: 0.5rem;
            ">Email Address:</label>
            <input 
              type="email" 
              value="abc@xyz.com" 
              style="
                width: 100%; 
                padding: 0.75rem; 
                border: 2px solid #e5e7eb; 
                border-radius: 6px; 
                font-size: 0.875rem;
                outline: none;
                transition: border-color 0.2s;
              "
              onfocus="this.style.borderColor='#8b5cf6'"
              onblur="this.style.borderColor='#e5e7eb'"
            />
          </div>

          <!-- Password Field -->
          <div style="margin-bottom: 1rem;">
            <label style="
              display: block; 
              font-size: 0.875rem; 
              color: #6b7280; 
              margin-bottom: 0.5rem;
            ">Password:</label>
            <input 
              type="password" 
              value="••••••••••••••" 
              style="
                width: 100%; 
                padding: 0.75rem; 
                border: 2px solid #e5e7eb; 
                border-radius: 6px; 
                font-size: 0.875rem;
                outline: none;
                transition: border-color 0.2s;
              "
              onfocus="this.style.borderColor='#8b5cf6'"
              onblur="this.style.borderColor='#e5e7eb'"
            />
          </div>

          <!-- Remember me and Forgot password -->
          <div style="
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            margin-bottom: 1.5rem;
            font-size: 0.875rem;
          ">
            <label style="
              display: flex; 
              align-items: center; 
              color: #6b7280;
              cursor: pointer;
            ">
              <input 
                type="checkbox" 
                style="margin-right: 0.5rem;"
              />
              Remember me
            </label>
            <a href="#" style="
              color: #8b5cf6; 
              text-decoration: none;
            ">Forgot password?</a>
          </div>

          <!-- Login Button -->
          <button style="
            width: 100%;
            background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
            color: white;
            border: none;
            padding: 0.75rem;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            margin-bottom: 1.5rem;
            transition: opacity 0.2s;
          " 
          onmouseover="this.style.opacity='0.9'"
          onmouseout="this.style.opacity='1'"
          onclick="location.href='/api/login'"
          >
            Log in
          </button>

          <!-- Divider -->
          <div style="
            text-align: center; 
            color: #6b7280; 
            font-size: 0.875rem; 
            margin: 1.5rem 0;
          ">
            or connect with
          </div>

          <!-- Social Login -->
          <div style="
            display: flex; 
            justify-content: center; 
            gap: 1rem;
            margin-bottom: 1.5rem;
          ">
            <button style="
              width: 40px; 
              height: 40px; 
              background: #1877f2; 
              border-radius: 50%; 
              border: none;
              display: flex; 
              align-items: center; 
              justify-content: center; 
              cursor: pointer;
              transition: opacity 0.2s;
            "
            onmouseover="this.style.opacity='0.9'"
            onmouseout="this.style.opacity='1'"
            onclick="location.href='/api/login'"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            <button style="
              width: 40px; 
              height: 40px; 
              background: white; 
              border: 2px solid #e5e7eb;
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              cursor: pointer;
              transition: background-color 0.2s;
            "
            onmouseover="this.style.backgroundColor='#f9fafb'"
            onmouseout="this.style.backgroundColor='white'"
            onclick="location.href='/api/login'"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
          </div>

          <!-- Sign up link -->
          <div style="
            text-align: center; 
            font-size: 0.875rem; 
            color: #6b7280;
          ">
            Don't have an account? <a href="#" style="color: #8b5cf6; text-decoration: none;">Sign up</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel - Circle -->
    <div style="
      width: 50%; 
      position: relative; 
      overflow: hidden;
      background: linear-gradient(135deg, #f3e8ff 0%, #a855f7 50%, #ec4899 100%);
    ">
      <div style="
        position: absolute;
        right: -200px;
        top: 50%;
        transform: translateY(-50%);
        width: 600px;
        height: 600px;
        background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: white;
        padding: 0 3rem;
      ">
        <h1 style="
          font-size: 4rem; 
          font-weight: 700; 
          margin: 0 0 1rem 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">Circle</h1>
        <p style="
          font-size: 1rem; 
          line-height: 1.6; 
          margin: 0 0 2rem 0;
          opacity: 0.9;
          max-width: 300px;
        ">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
        </p>
        <div style="
          display: flex; 
          align-items: center; 
          gap: 1rem;
        ">
          <button style="
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 0.5rem 1.5rem;
            border-radius: 25px;
            font-size: 0.875rem;
            cursor: pointer;
            transition: background-color 0.2s;
          "
          onmouseover="this.style.backgroundColor='rgba(255,255,255,0.3)'"
          onmouseout="this.style.backgroundColor='rgba(255,255,255,0.2)'"
          >
            Learn More
          </button>
          <button style="
            width: 48px;
            height: 48px;
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background-color 0.2s;
          "
          onmouseover="this.style.backgroundColor='rgba(255,255,255,0.3)'"
          onmouseout="this.style.backgroundColor='rgba(255,255,255,0.2)'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
`;

// createRoot(document.getElementById("root")!).render(<App />);
