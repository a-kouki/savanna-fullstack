"use client"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { CartIcon } from "@/app/_components/Carticon"

export function Nav(){
    const [showMenu, setShowMenu] = useState(false)
    const menuRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
      function handleOutsideClick(e: MouseEvent) {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          setShowMenu(false)
        }
      }
      if (showMenu) document.addEventListener("mousedown", handleOutsideClick)
      return () => document.removeEventListener("mousedown", handleOutsideClick)
    }, [showMenu])

    const navLinks = [
    ["INICIO", `${process.env.NEXT_PUBLIC_BASE_URL,"/#inicio"}`],
    ["CAMISETAS", `${process.env.NEXT_PUBLIC_BASE_URL,"/#camisetas"}`],
    ["SOBRE", `${process.env.NEXT_PUBLIC_BASE_URL,"/#sobre"}`],
    ["CONTATO", `${process.env.NEXT_PUBLIC_BASE_URL,"/#contato"}`],
  ]
  return (
    <>
          <header
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
              "bg-black" 
            }`}
          >
            <div className="flex justify-center">
              <div className="flex max-w-widthGlobal w-full px-4 md:px-pxGloabl justify-between items-center py-3">
                {/* Logo */}
                <a href="/">
                  <Image
                    src="/favicon.png"
                    alt="Logo"
                    loading="lazy"
                    className="w-10 h-10"
                    width={40}
                    height={40}
                  />
                </a>
    
                {/* Nav desktop */}
                <nav className="hidden md:flex">
                  <ul className="flex gap-x-8 text-[13px] font-abeezee tracking-widest text-white">
                    {navLinks.map(([label, href]) => (
                      <li key={label}>
                        <a
                          href={href}
                          className="hover:text-secondary transition-colors duration-200"
                        >
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
    
                {/* Social icons desktop */}
                <div className="hidden md:flex gap-x-4 text-white text-sm">
                  <a href="#" aria-label="Instagram">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <circle cx="12" cy="12" r="4"/>
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                    </svg>
                  </a>
                  <a href="#" aria-label="Facebook">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                    </svg>
                  </a>

                  <CartIcon />
                </div>
    
                {/* Hamburger mobile */}
                <div className="md:hidden flex items-center gap-3">
                  <CartIcon />
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="md:hidden z-[60] relative w-10 h-10 flex flex-col justify-center items-center gap-1"
                  >
                    <span className={`w-7 h-[2px] bg-white rounded-full transition-all duration-300 ${showMenu ? "rotate-45 translate-y-[7px]" : ""}`} />
                    <span className={`w-7 h-[2px] bg-white rounded-full transition-all duration-300 ${showMenu ? "opacity-0" : ""}`} />
                    <span className={`w-7 h-[2px] bg-white rounded-full transition-all duration-300 ${showMenu ? "-rotate-45 -translate-y-[7px]" : ""}`} />
                  </button>
                </div>
              </div>
            </div>
          </header>
    
          {/* Backdrop mobile */}
          <div
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300 md:hidden ${
              showMenu ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
          />

          {/* Menu mobile */}
          <div
            ref={menuRef}
            className={`fixed top-0 right-0 h-screen w-[280px] bg-black z-50 md:hidden shadow-2xl transition-transform duration-300 ease-in-out ${
              showMenu ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <nav className="pt-32 px-8">
              <ul className="flex flex-col text-xl text-white">
                {navLinks.map(([label, href], index) => (
                  <li
                    key={label}
                    className="border-b border-white/10"
                    style={{ transitionDelay: `${index * 80}ms` }}
                  >
                    <a
                      href={href}
                      onClick={() => setShowMenu(false)}
                      className="flex py-5 tracking-widest hover:text-secondary transition-all duration-200 hover:translate-x-2"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
    </>
  )
}