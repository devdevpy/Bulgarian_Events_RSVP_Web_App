import { Calendar, Users, CheckCircle, Lock, Eye } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string, eventId?: string, mode?: 'login' | 'signup') => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            За приложението
          </h1>

          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            Добре дошли в нашата платформа за управление на събития! Тук можете лесно да
            организирате събития и да управлявате присъствието на участниците.
          </p>

          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  За публични посетители
                </h2>
              </div>

              <div className="space-y-4 ml-10">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    1. Разглеждане на предстоящи събития
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Отворете началната страница и кликнете на "Събития"</li>
                    <li>Разгледайте списъка с всички предстоящи събития</li>
                    <li>Използвайте търсачката за да намерите конкретно събитие</li>
                    <li>Кликнете на събитие за да видите пълните детайли</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    2. Подаване на RSVP без регистрация
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Отворете детайлите на избраното събитие</li>
                    <li>Попълнете формата за RSVP с вашите данни (име, email)</li>
                    <li>Изберете дали ще присъствате, може би или отказвате</li>
                    <li>Посочете брой допълнителни гости (по избор)</li>
                    <li>Добавете диетични ограничения ако имате (по избор)</li>
                    <li>Кликнете "Изпрати RSVP" за да потвърдите</li>
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Важно:</strong> Не е необходима регистрация за да подадете RSVP!
                    Просто попълнете формата и сте готови.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-7 h-7 text-green-600 dark:text-green-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  За организатори
                </h2>
              </div>

              <div className="space-y-4 ml-10">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    1. Създаване на профил
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Кликнете на "Вход" в горното меню</li>
                    <li>Изберете таб "Регистрация"</li>
                    <li>Въведете вашия email адрес и парола</li>
                    <li>Кликнете "Регистрирай се"</li>
                    <li>Вече имате профил и можете да създавате събития!</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    2. Създаване на събитие
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Влезте във вашия профил</li>
                    <li>Отворете "Моите събития" от менюто</li>
                    <li>Кликнете на "Създай събитие"</li>
                    <li>Попълнете детайлите: заглавие, описание, дата, час, локация и капацитет</li>
                    <li>Кликнете "Запази" за да публикувате събитието</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    3. Управление на събития
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>В "Моите събития" виждате всички ваши създадени събития</li>
                    <li>Кликнете "Редактирай" за да промените детайлите на събитие</li>
                    <li>Кликнете "Изтрий" за да премахнете събитие</li>
                    <li>Кликнете "Управление" за да видите RSVPs и статистики</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    4. Преглед на RSVPs
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>В страницата за управление виждате всички получени RSVPs</li>
                    <li>Филтрирайте по статус: присъстващи, може би, отказали</li>
                    <li>Търсете по име или email</li>
                    <li>Копирайте email адресите на присъстващите за комуникация</li>
                    <li>Експортирайте списъка в CSV формат</li>
                    <li>Изтривайте отделни RSVPs при необходимост</li>
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    <strong>Съвет:</strong> Използвайте бутона "Създай примерни събития" за бързо
                    тестване на функционалността!
                  </p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-7 h-7 text-red-600 dark:text-red-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Сигурност и поверителност
                </h2>
              </div>

              <div className="space-y-3 ml-10">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Всеки организатор вижда само RSVPs за своите събития
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Не можете да редактирате или изтривате събития на други потребители
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Паролите се съхраняват сигурно и криптирано
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    Row Level Security (RLS) осигурява защита на всички нива
                  </p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Често задавани въпроси
                </h2>
              </div>

              <div className="space-y-4 ml-10">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    Мога ли да променя RSVP след като го изпратя?
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Не, в момента не можете да редактирате изпратен RSVP. Свържете се
                    с организатора ако искате да промените статуса си.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    Колко събития мога да създам?
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Няма ограничение! Можете да създадете толкова събития, колкото желаете.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    Какво се случва когато събитието е пълно?
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Когато броят на присъстващите достигне капацитета, събитието се маркира
                    като "Разпродадено", но посетителите все пак могат да подадат RSVP със
                    статус "може би" или "отказвам".
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-10 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Готови да започнете?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Разгледайте предстоящите събития или създайте своя профил за да
                започнете да организирате събития още днес!
              </p>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => onNavigate('events')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Виж събития
                </button>
                <button
                  onClick={() => onNavigate('auth', undefined, 'signup')}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Регистрирай се
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
