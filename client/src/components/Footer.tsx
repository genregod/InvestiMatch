import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">InvestiMatch</h3>
            <p className="text-sm text-secondary mb-4">
              Connecting subscribers with professional investigators through our secure marketplace platform.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-secondary hover:text-accent">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="#" className="text-secondary hover:text-accent">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a href="#" className="text-secondary hover:text-accent">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-primary mb-4">For Subscribers</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-secondary hover:text-accent">How It Works</Link></li>
              <li><Link href="/find-investigators" className="text-sm text-secondary hover:text-accent">Find an Investigator</Link></li>
              <li><Link href="/subscription" className="text-sm text-secondary hover:text-accent">Subscription Plans</Link></li>
              <li><Link href="#" className="text-sm text-secondary hover:text-accent">Success Stories</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-primary mb-4">For Investigators</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-secondary hover:text-accent">Join Our Network</Link></li>
              <li><Link href="#" className="text-sm text-secondary hover:text-accent">Resources</Link></li>
              <li><Link href="#" className="text-sm text-secondary hover:text-accent">Getting Verified</Link></li>
              <li><Link href="#" className="text-sm text-secondary hover:text-accent">Commission Structure</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-primary mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-secondary hover:text-accent">About Us</Link></li>
              <li><Link href="#" className="text-sm text-secondary hover:text-accent">Careers</Link></li>
              <li><Link href="#" className="text-sm text-secondary hover:text-accent">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm text-secondary hover:text-accent">Terms of Service</Link></li>
              <li><Link href="#" className="text-sm text-secondary hover:text-accent">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-secondary">© {new Date().getFullYear()} InvestiMatch. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex items-center">
            <p className="text-sm text-secondary mr-4">Secure payments by</p>
            <div className="flex space-x-3">
              <svg className="h-6 w-8 text-secondary" viewBox="0 0 32 24" fill="currentColor">
                <path d="M29.418 2.083H2.579A2.59 2.59 0 0 0 0 4.662v14.674a2.59 2.59 0 0 0 2.579 2.581h26.84a2.59 2.59 0 0 0 2.581-2.581V4.662a2.59 2.59 0 0 0-2.581-2.579zM11.7 17.757H8.287V6.26H11.7v11.497zm-1.7-13.062c-1.080 0-1.954-.838-1.954-1.872 0-1.035.875-1.872 1.954-1.872 1.08 0 1.954.837 1.954 1.872 0 1.034-.874 1.872-1.954 1.872zm13.063 13.062h-3.415v-5.6c0-1.268-.025-2.894-1.766-2.894-1.766 0-2.037 1.376-2.037 2.8v5.694h-3.414V6.26h3.277v1.498h.047c.452-.856 1.56-1.766 3.21-1.766 3.437 0 4.072 2.263 4.072 5.208v6.557z" />
              </svg>
              <svg className="h-6 w-8 text-secondary" viewBox="0 0 32 24" fill="currentColor">
                <path d="M29.418 2.083H2.579A2.59 2.59 0 0 0 0 4.662v14.674a2.59 2.59 0 0 0 2.579 2.581h26.84a2.59 2.59 0 0 0 2.581-2.581V4.662a2.59 2.59 0 0 0-2.581-2.579zM19.347 16.178h-2.894l-3.277-8.751h3.634l1.632 4.848 1.632-4.848h3.634l-3.277 8.751h-1.084z" />
              </svg>
              <svg className="h-6 w-8 text-secondary" viewBox="0 0 32 24" fill="currentColor">
                <path d="M29.418 2.083H2.579A2.59 2.59 0 0 0 0 4.662v14.674a2.59 2.59 0 0 0 2.579 2.581h26.84a2.59 2.59 0 0 0 2.581-2.581V4.662a2.59 2.59 0 0 0-2.581-2.579zM13.547 14.749c-.452 1.376-1.833 2.307-3.277 2.307-1.98 0-3.59-1.61-3.59-3.59 0-1.98 1.61-3.59 3.59-3.59 1.444 0 2.825.93 3.277 2.306h3.367c-.544-3.185-3.32-5.612-6.644-5.612-3.723 0-6.733 3.01-6.733 6.733 0 3.723 3.01 6.733 6.733 6.733 3.324 0 6.1-2.427 6.644-5.612h-3.367v.325zm10.44.362c0 .181-.147.328-.328.328h-1.175v1.176a.328.328 0 0 1-.328.327h-.65a.328.328 0 0 1-.329-.327v-1.176h-1.175a.328.328 0 0 1-.327-.328v-.65c0-.18.147-.328.327-.328h1.175v-1.175c0-.181.148-.328.328-.328h.651c.18 0 .328.147.328.328v1.175h1.175c.181 0 .328.147.328.328v.65zm3.917-.65c0 .18-.147.328-.328.328H26.4v1.175c0 .181-.147.328-.328.328h-.65a.328.328 0 0 1-.329-.328v-1.175h-1.175a.328.328 0 0 1-.327-.329v-.65c0-.181.147-.328.327-.328h1.175v-1.175c0-.181.148-.328.328-.328h.651c.181 0 .328.147.328.328v1.175h1.175c.181 0 .328.147.328.328v.65z" />
              </svg>
              <svg className="h-6 w-8 text-secondary" viewBox="0 0 32 24" fill="currentColor">
                <path d="M29.418 2.083H2.579A2.59 2.59 0 0 0 0 4.662v14.674a2.59 2.59 0 0 0 2.579 2.581h26.84a2.59 2.59 0 0 0 2.581-2.581V4.662a2.59 2.59 0 0 0-2.581-2.579zM16 17.919c-3.723 0-6.733-3.01-6.733-6.733 0-3.723 3.01-6.733 6.733-6.733s6.733 3.01 6.733 6.733c0 3.723-3.01 6.733-6.733 6.733zm0-11.837c-2.806 0-5.104 2.298-5.104 5.104 0 2.806 2.298 5.104 5.104 5.104 2.806 0 5.104-2.298 5.104-5.104 0-2.806-2.298-5.104-5.104-5.104z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
