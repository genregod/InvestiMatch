import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const LandingPage = () => {
  return (
    <div className="bg-background min-h-screen">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-primary flex items-center">
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 text-accent"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="11" y1="8" x2="11" y2="14"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
                InvestiMatch
              </div>
            </div>
            <div>
              <a href="/api/login">
                <Button>Log In</Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 mb-10 lg:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
                  Professional Investigators at Your Fingertips
                </h1>
                <p className="text-xl text-secondary mb-8">
                  Connect with verified private investigators through our secure marketplace platform. Find the right professional for your investigation needs.
                </p>
                <a href="/api/login">
                  <Button size="lg" className="mr-4">Get Started</Button>
                </a>
                <Button variant="outline" size="lg">Learn More</Button>
              </div>
              <div className="lg:w-1/2">
                <img 
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80" 
                  alt="Professional investigator at work" 
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-4">How InvestiMatch Works</h2>
              <p className="text-xl text-secondary max-w-3xl mx-auto">
                Our platform makes it easy to find, hire, and work with professional investigators
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg 
                    viewBox="0 0 24 24" 
                    width="32" 
                    height="32" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-accent"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">Create an Account</h3>
                <p className="text-secondary">
                  Sign up and choose a subscription plan that matches your investigation needs.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-accent bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg 
                    viewBox="0 0 24 24" 
                    width="32" 
                    height="32" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-accent"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">Find an Investigator</h3>
                <p className="text-secondary">
                  Browse our marketplace of verified professionals and filter by specialization.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-accent bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg 
                    viewBox="0 0 24 24" 
                    width="32" 
                    height="32" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-accent"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">Manage Your Case</h3>
                <p className="text-secondary">
                  Communicate securely, track progress, and manage payments through our platform.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Subscription Plans */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-4">Subscription Plans</h2>
              <p className="text-xl text-secondary max-w-3xl mx-auto">
                Choose the plan that works best for your investigation needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Basic Plan */}
              <Card className="border-2 border-accent">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-primary">Basic</h3>
                    <p className="text-4xl font-bold text-primary mt-4">$49<span className="text-base font-normal text-secondary">/month</span></p>
                    <p className="text-sm text-secondary mt-2 mb-6">Ideal for small businesses with occasional investigation needs.</p>
                    
                    <div className="space-y-3 mb-6 text-left">
                      <div className="flex items-start">
                        <svg 
                          viewBox="0 0 24 24" 
                          width="20" 
                          height="20" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="text-success mr-3 mt-1"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <p className="text-sm text-secondary">5 cases per month</p>
                      </div>
                      <div className="flex items-start">
                        <svg 
                          viewBox="0 0 24 24" 
                          width="20" 
                          height="20" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="text-success mr-3 mt-1"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <p className="text-sm text-secondary">Access to verified investigators</p>
                      </div>
                      <div className="flex items-start">
                        <svg 
                          viewBox="0 0 24 24" 
                          width="20" 
                          height="20" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="text-success mr-3 mt-1"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <p className="text-sm text-secondary">Basic reporting</p>
                      </div>
                      <div className="flex items-start">
                        <svg 
                          viewBox="0 0 24 24" 
                          width="20" 
                          height="20" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="text-success mr-3 mt-1"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <p className="text-sm text-secondary">Email support</p>
                      </div>
                    </div>
                    
                    <a href="/api/login">
                      <Button className="w-full">Get Started</Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
              
              {/* Pro Plan */}
              <Card className="border border-gray-200 shadow-lg transform scale-105">
                <div className="bg-accent text-white text-xs font-semibold uppercase py-1 text-center">
                  Most Popular
                </div>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-primary">Pro</h3>
                    <p className="text-4xl font-bold text-primary mt-4">$149<span className="text-base font-normal text-secondary">/month</span></p>
                    <p className="text-sm text-secondary mt-2 mb-6">Perfect for growing businesses with regular investigation needs.</p>
                    
                    <div className="space-y-3 mb-6 text-left">
                      <div className="flex items-start">
                        <svg 
                          viewBox="0 0 24 24" 
                          width="20" 
                          height="20" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="text-success mr-3 mt-1"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <p className="text-sm text-secondary">20 cases per month</p>
                      </div>
                      <div className="flex items-start">
                        <svg 
                          viewBox="0 0 24 24" 
                          width="20" 
                          height="20" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="text-success mr-3 mt-1"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <p className="text-sm text-secondary">Access to verified investigators</p>
                      </div>
                      <div className="flex items-start">
                        <svg 
                          viewBox="0 0 24 24" 
                          width="20" 
                          height="20" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="text-success mr-3 mt-1"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <p className="text-sm text-secondary">Advanced reporting</p>
                      </div>
                      <div className="flex items-start">
                        <svg 
                          viewBox="0 0 24 24" 
                          width="20" 
                          height="20" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="text-success mr-3 mt-1"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <p className="text-sm text-secondary">Priority support</p>
                      </div>
                      <div className="flex items-start">
                        <svg 
                          viewBox="0 0 24 24" 
                          width="20" 
                          height="20" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="text-success mr-3 mt-1"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <p className="text-sm text-secondary">Priority matching</p>
                      </div>
                    </div>
                    
                    <a href="/api/login">
                      <Button className="w-full">Get Started</Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
              
              {/* Enterprise Plan */}
              <Card className="border border-gray-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-primary">Enterprise</h3>
                    <p className="text-4xl font-bold text-primary mt-4">Custom<span className="text-base font-normal text-secondary"> pricing</span></p>
                    <p className="text-sm text-secondary mt-2 mb-6">Tailored solutions for businesses with extensive investigation needs.</p>
                    
                    <div className="space-y-3 mb-6 text-left">
                      <div className="flex items-start">
                        <svg 
                          viewBox="0 0 24 24" 
                          width="20" 
                          height="20" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="text-success mr-3 mt-1"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <p className="text-sm text-secondary">Unlimited cases</p>
                      </div>
                      <div className="flex items-start">
                        <svg 
                          viewBox="0 0 24 24" 
                          width="20" 
                          height="20" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="text-success mr-3 mt-1"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <p className="text-sm text-secondary">Access to elite investigators</p>
                      </div>
                      <div className="flex items-start">
                        <svg 
                          viewBox="0 0 24 24" 
                          width="20" 
                          height="20" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="text-success mr-3 mt-1"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <p className="text-sm text-secondary">Custom reporting</p>
                      </div>
                      <div className="flex items-start">
                        <svg 
                          viewBox="0 0 24 24" 
                          width="20" 
                          height="20" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="text-success mr-3 mt-1"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <p className="text-sm text-secondary">24/7 priority support</p>
                      </div>
                      <div className="flex items-start">
                        <svg 
                          viewBox="0 0 24 24" 
                          width="20" 
                          height="20" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="text-success mr-3 mt-1"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <p className="text-sm text-secondary">Dedicated account manager</p>
                      </div>
                    </div>
                    
                    <a href="/api/login">
                      <Button variant="outline" className="w-full">Contact Sales</Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-4">What Our Clients Say</h2>
              <p className="text-xl text-secondary max-w-3xl mx-auto">
                Trusted by businesses of all sizes
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-white shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-secondary mb-4">
                    "InvestiMatch connected us with an experienced corporate fraud investigator who helped us uncover an internal embezzlement scheme. The platform made the entire process seamless and secure."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                      <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100" 
                        alt="Client" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-primary">Michael Johnson</p>
                      <p className="text-xs text-secondary">CFO, TechCorp Inc.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-secondary mb-4">
                    "The subscription model is perfect for our law firm. We regularly need investigative services, and being able to manage cases through one platform has streamlined our operations significantly."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                      <img 
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100" 
                        alt="Client" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-primary">Sarah Williams</p>
                      <p className="text-xs text-secondary">Partner, Legal Associates</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-secondary mb-4">
                    "As a private investigator, joining InvestiMatch has allowed me to focus on cases rather than marketing. The platform brings me qualified clients who value my expertise."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                      <img 
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100" 
                        alt="Client" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-primary">David Rodriguez</p>
                      <p className="text-xs text-secondary">Licensed Private Investigator</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Join InvestiMatch today and connect with professional investigators for your business needs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <a href="/api/login">
                <Button size="lg" variant="secondary">
                  Sign Up Now
                </Button>
              </a>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="text-2xl font-bold text-primary flex items-center">
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 text-accent"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="11" y1="8" x2="11" y2="14"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
                InvestiMatch
              </div>
            </div>
            <div>
              <p className="text-sm text-secondary">© {new Date().getFullYear()} InvestiMatch. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
