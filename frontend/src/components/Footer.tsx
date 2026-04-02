import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                <span className="font-bold">TM</span>
              </div>
              <span className="text-xl font-bold">TalentMatch</span>
            </div>
            <p className="text-gray-400">
              AI-powered recruitment platform helping companies find the perfect candidates faster.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-400 hover:text-white">Features</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-white">Pricing</a></li>
              <li><a href="#api" className="text-gray-400 hover:text-white">API</a></li>
              <li><a href="#documentation" className="text-gray-400 hover:text-white">Documentation</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#about" className="text-gray-400 hover:text-white">About</a></li>
              <li><a href="#blog" className="text-gray-400 hover:text-white">Blog</a></li>
              <li><a href="#careers" className="text-gray-400 hover:text-white">Careers</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-white">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#privacy" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
              <li><a href="#terms" className="text-gray-400 hover:text-white">Terms of Service</a></li>
              <li><a href="#cookies" className="text-gray-400 hover:text-white">Cookie Policy</a></li>
              <li><a href="#gdpr" className="text-gray-400 hover:text-white">GDPR Compliance</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">
            © {currentYear} TalentMatch. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#twitter" className="text-gray-400 hover:text-white">
              <span className="sr-only">Twitter</span>
              🐦
            </a>
            <a href="#linkedin" className="text-gray-400 hover:text-white">
              <span className="sr-only">LinkedIn</span>
              💼
            </a>
            <a href="#github" className="text-gray-400 hover:text-white">
              <span className="sr-only">GitHub</span>
              💻
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
