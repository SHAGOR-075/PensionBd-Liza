import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  FileText, 
  Shield, 
  Clock, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Star,
  TrendingUp,
  Award,
  Headphones
} from 'lucide-react';

const Home = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: FileText,
      title: t('home.features.digital'),
      description: t('home.features.digitalDesc')
    },
    {
      icon: Clock,
      title: t('home.features.tracking'),
      description: t('home.features.trackingDesc')
    },
    {
      icon: Shield,
      title: t('home.features.secure'),
      description: t('home.features.secureDesc')
    },
    {
      icon: Headphones,
      title: t('home.features.support'),
      description: t('home.features.supportDesc')
    }
  ];

  const stats = [
    {
      icon: FileText,
      value: '50,000+',
      label: t('home.stats.applications')
    },
    {
      icon: Users,
      value: '25,000+',
      label: t('home.stats.users')
    },
    {
      icon: Star,
      value: '98%',
      label: t('home.stats.satisfaction')
    },
    {
      icon: TrendingUp,
      value: '7',
      label: t('home.stats.processing'),
      suffix: t('home.stats.days')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-government-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-government-600/10 dark:from-primary-900/20 dark:to-government-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full mb-6 shadow-lg">
                <FileText className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {t('home.title')}
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('home.subtitle')}
            </p>
            
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
              {t('home.description')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/login" 
                className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                {t('home.getStarted')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                to="#features" 
                className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200"
              >
                {t('home.learnMore')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg mb-4">
                    <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                    {stat.suffix && <span className="text-lg text-gray-500 dark:text-gray-400 ml-1">{stat.suffix}</span>}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover the powerful features that make pension management simple and efficient
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg mb-6 shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-government-600 dark:from-primary-800 dark:to-government-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of government employees who have simplified their pension process
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/pension-holder/register" 
                className="inline-flex items-center px-8 py-4 bg-white hover:bg-gray-100 text-primary-600 font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Users className="mr-2 w-5 h-5" />
                Register as Pension Holder
              </Link>
              <Link 
                to="/login" 
                className="inline-flex items-center px-8 py-4 bg-transparent hover:bg-white/10 text-white font-semibold rounded-lg border-2 border-white transition-all duration-200"
              >
                <Shield className="mr-2 w-5 h-5" />
                Staff Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-8 opacity-60">
              <div className="flex items-center space-x-2">
                <Award className="w-8 h-8 text-primary-600" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Government Certified</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-green-600" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Secure Platform</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-8 h-8 text-blue-600" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Trusted by 25K+ Users</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;