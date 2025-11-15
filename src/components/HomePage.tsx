import { Calendar, Users, Bell, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HomePageProps {
  onNavigate: (page: string, eventId?: string, mode?: 'login' | 'signup') => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Организирайте събития лесно
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
              Създавайте събития, канете приятели и управлявайте потвърждения на едно място.
              Всичко, от което се нуждаете за перфектното събитие.
            </p>
            <button
              onClick={() => onNavigate(user ? 'my-events' : 'auth')}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <span>{user ? 'Моите събития' : 'Разгледай събития'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Създавайте събития
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Организирайте всякакви събития - от рождени дни до бизнес срещи.
              Добавете дата, час, локация и описание.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Канете участници
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Споделете вашите събития с приятели и колеги.
              Проследявайте кой ще дойде, може би или не може.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Управлявайте RSVP
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Получавайте потвърждения в реално време.
              Вижте точно колко души планират да присъстват.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Готови да започнете?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Създайте акаунт безплатно и започнете да организирате събития още днес.
            </p>
            {!user && (
              <button
                onClick={() => onNavigate('auth', undefined, 'signup')}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Регистрирайте се безплатно
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
