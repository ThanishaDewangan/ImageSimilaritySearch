import { Link, useLocation } from "wouter";
import { Eye } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Menu, X, Settings } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="bg-accent rounded-lg p-2 mr-2">
                <Eye className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-semibold text-dark">VisualMind</h1>
            </div>
            {!isMobile && (
              <div className="ml-6 flex space-x-6">
                <Link 
                  href="/"
                  className={`px-3 py-2 text-sm font-medium border-b-2 ${
                    location === "/"
                      ? "text-dark border-primary"
                      : "text-gray-500 border-transparent hover:text-primary"
                  }`}
                >
                  Search
                </Link>
                <Link 
                  href="/history"
                  className={`px-3 py-2 text-sm font-medium border-b-2 ${
                    location === "/history"
                      ? "text-dark border-primary"
                      : "text-gray-500 border-transparent hover:text-primary"
                  }`}
                >
                  History
                </Link>
                <Link 
                  href="/about"
                  className={`px-3 py-2 text-sm font-medium border-b-2 ${
                    location === "/about"
                      ? "text-dark border-primary"
                      : "text-gray-500 border-transparent hover:text-primary"
                  }`}
                >
                  About
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {isMobile ? (
              <button
                type="button"
                className="text-gray-500 hover:text-primary focus:outline-none"
                onClick={toggleMobileMenu}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            ) : (
              <button
                type="button"
                className="text-gray-500 hover:text-primary ml-3 focus:outline-none"
              >
                <Settings size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobile && mobileMenuOpen && (
        <div className="bg-white shadow-md">
          <div className="px-4 py-3 space-y-1">
            <Link 
              href="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location === "/"
                  ? "bg-primary bg-opacity-10 text-primary"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Search
            </Link>
            <Link 
              href="/history"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location === "/history"
                  ? "bg-primary bg-opacity-10 text-primary"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              History
            </Link>
            <Link 
              href="/about"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location === "/about"
                  ? "bg-primary bg-opacity-10 text-primary"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
