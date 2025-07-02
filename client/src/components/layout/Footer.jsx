import { useLanguage } from '../../contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-government-800 dark:bg-gray-900 text-white transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Government Pension System</h3>
            <p className="text-government-300 dark:text-gray-400 text-sm">
              Managing pension applications and services for government employees with efficiency and transparency.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-government-300 dark:text-gray-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-government-300 dark:text-gray-400 hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="text-government-300 dark:text-gray-400 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-government-300 dark:text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="text-government-300 dark:text-gray-400 text-sm space-y-2">
              <p>Phone: +880-2-XXXXXXX</p>
              <p>Email: pension@gov.bd</p>
              <p>Office Hours: 9:00 AM - 5:00 PM</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-government-700 dark:border-gray-700 mt-8 pt-6 text-center text-sm text-government-400 dark:text-gray-500">
          <p>&copy; 2024 Government of Bangladesh. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;