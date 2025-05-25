import { Link } from "wouter";
import { Search } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <Search className="h-6 w-6 text-accent mr-2" />
              <span className="text-primary font-semibold">PI Connect</span>
            </div>
            <p className="text-sm text-secondary mt-1">The premier marketplace for professional investigators</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link href="/terms">
              <a className="text-secondary hover:text-primary text-sm">Terms of Service</a>
            </Link>
            <Link href="/privacy">
              <a className="text-secondary hover:text-primary text-sm">Privacy Policy</a>
            </Link>
            <Link href="/contact">
              <a className="text-secondary hover:text-primary text-sm">Contact Us</a>
            </Link>
            <Link href="/help">
              <a className="text-secondary hover:text-primary text-sm">Help Center</a>
            </Link>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-xs text-secondary">&copy; {new Date().getFullYear()} PI Connect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
