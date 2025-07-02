import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    
    // Home Page
    'home.title': 'Government Pension Management System',
    'home.subtitle': 'Efficient and transparent pension management for government employees',
    'home.description': 'Our digital platform streamlines the pension application process, ensuring quick processing and transparent tracking for all government employees.',
    'home.getStarted': 'Get Started',
    'home.learnMore': 'Learn More',
    'home.features.title': 'Key Features',
    'home.features.digital': 'Digital Application',
    'home.features.digitalDesc': 'Submit pension applications online with ease',
    'home.features.tracking': 'Real-time Tracking',
    'home.features.trackingDesc': 'Monitor your application status in real-time',
    'home.features.secure': 'Secure & Reliable',
    'home.features.secureDesc': 'Bank-level security for your sensitive data',
    'home.features.support': '24/7 Support',
    'home.features.supportDesc': 'Get help whenever you need it',
    'home.stats.applications': 'Applications Processed',
    'home.stats.users': 'Active Users',
    'home.stats.satisfaction': 'Satisfaction Rate',
    'home.stats.processing': 'Avg. Processing Time',
    'home.stats.days': 'days',
    
    // Authentication
    'auth.signIn': 'Sign in to your account',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.loginAs': 'Login as',
    'auth.staff': 'Staff (Manager/Admin)',
    'auth.pensionHolder': 'Pension Holder',
    'auth.signInButton': 'Sign in',
    'auth.noAccount': "Don't have an account?",
    'auth.registerHere': 'Register here',
    'auth.haveAccount': 'Already have an account?',
    'auth.signInHere': 'Sign in here',
    
    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.totalApplications': 'Total Applications',
    'dashboard.pending': 'Pending',
    'dashboard.approved': 'Approved',
    'dashboard.rejected': 'Rejected',
    
    // Common
    'common.loading': 'Loading...',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.required': 'Required',
    'common.optional': 'Optional',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.success': 'Success',
    'common.error': 'Error',
    'common.warning': 'Warning',
    'common.info': 'Information'
  },
  bn: {
    // Navigation
    'nav.home': 'হোম',
    'nav.dashboard': 'ড্যাশবোর্ড',
    'nav.login': 'লগইন',
    'nav.register': 'নিবন্ধন',
    'nav.logout': 'লগআউট',
    
    // Home Page
    'home.title': 'সরকারি পেনশন ব্যবস্থাপনা সিস্টেম',
    'home.subtitle': 'সরকারি কর্মচারীদের জন্য দক্ষ এবং স্বচ্ছ পেনশন ব্যবস্থাপনা',
    'home.description': 'আমাদের ডিজিটাল প্ল্যাটফর্ম পেনশন আবেদন প্রক্রিয়াকে সহজ করে, সকল সরকারি কর্মচারীদের জন্য দ্রুত প্রক্রিয়াকরণ এবং স্বচ্ছ ট্র্যাকিং নিশ্চিত করে।',
    'home.getStarted': 'শুরু করুন',
    'home.learnMore': 'আরও জানুন',
    'home.features.title': 'মূল বৈশিষ্ট্য',
    'home.features.digital': 'ডিজিটাল আবেদন',
    'home.features.digitalDesc': 'সহজেই অনলাইনে পেনশন আবেদন জমা দিন',
    'home.features.tracking': 'রিয়েল-টাইম ট্র্যাকিং',
    'home.features.trackingDesc': 'রিয়েল-টাইমে আপনার আবেদনের অবস্থা পর্যবেক্ষণ করুন',
    'home.features.secure': 'নিরাপদ ও নির্ভরযোগ্য',
    'home.features.secureDesc': 'আপনার সংবেদনশীল তথ্যের জন্য ব্যাংক-স্তরের নিরাপত্তা',
    'home.features.support': '২৪/৭ সহায়তা',
    'home.features.supportDesc': 'যখনই প্রয়োজন সাহায্য পান',
    'home.stats.applications': 'প্রক্রিয়াকৃত আবেদন',
    'home.stats.users': 'সক্রিয় ব্যবহারকারী',
    'home.stats.satisfaction': 'সন্তুষ্টির হার',
    'home.stats.processing': 'গড় প্রক্রিয়াকরণ সময়',
    'home.stats.days': 'দিন',
    
    // Authentication
    'auth.signIn': 'আপনার অ্যাকাউন্টে সাইন ইন করুন',
    'auth.email': 'ইমেইল ঠিকানা',
    'auth.password': 'পাসওয়ার্ড',
    'auth.confirmPassword': 'পাসওয়ার্ড নিশ্চিত করুন',
    'auth.loginAs': 'হিসেবে লগইন করুন',
    'auth.staff': 'কর্মী (ম্যানেজার/অ্যাডমিন)',
    'auth.pensionHolder': 'পেনশনভোগী',
    'auth.signInButton': 'সাইন ইন',
    'auth.noAccount': 'কোনো অ্যাকাউন্ট নেই?',
    'auth.registerHere': 'এখানে নিবন্ধন করুন',
    'auth.haveAccount': 'ইতিমধ্যে অ্যাকাউন্ট আছে?',
    'auth.signInHere': 'এখানে সাইন ইন করুন',
    
    // Dashboard
    'dashboard.welcome': 'স্বাগতম',
    'dashboard.totalApplications': 'মোট আবেদন',
    'dashboard.pending': 'অপেক্ষমাণ',
    'dashboard.approved': 'অনুমোদিত',
    'dashboard.rejected': 'প্রত্যাখ্যাত',
    
    // Common
    'common.loading': 'লোড হচ্ছে...',
    'common.submit': 'জমা দিন',
    'common.cancel': 'বাতিল',
    'common.save': 'সংরক্ষণ',
    'common.edit': 'সম্পাদনা',
    'common.delete': 'মুছুন',
    'common.view': 'দেখুন',
    'common.back': 'পিছনে',
    'common.next': 'পরবর্তী',
    'common.previous': 'পূর্ববর্তী',
    'common.search': 'অনুসন্ধান',
    'common.filter': 'ফিল্টার',
    'common.export': 'রপ্তানি',
    'common.download': 'ডাউনলোড',
    'common.upload': 'আপলোড',
    'common.required': 'আবশ্যক',
    'common.optional': 'ঐচ্ছিক',
    'common.yes': 'হ্যাঁ',
    'common.no': 'না',
    'common.success': 'সফল',
    'common.error': 'ত্রুটি',
    'common.warning': 'সতর্কতা',
    'common.info': 'তথ্য'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem('language', lang);
    }
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  const value = {
    language,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};