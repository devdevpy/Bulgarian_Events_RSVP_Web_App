import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { LoadingButton } from './LoadingButton';
import { formatEventDate } from '../lib/dateUtils';

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
  capacity: number;
  created_by: string;
  created_at: string;
}

interface EventCapacity {
  event_id: string;
  capacity: number;
  attending_count: number;
  remaining: number;
}

interface EventDetailsPageProps {
  eventId: string;
  onBack: () => void;
}

export function EventDetailsPage({ eventId, onBack }: EventDetailsPageProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [remaining, setRemaining] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    status: 'attending' as 'attending' | 'maybe' | 'declined'
  });

  const fetchEventDetails = async () => {
    try {
      setLoading(true);

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      const { data: capacityData, error: capacityError } = await supabase
        .from('event_capacity_view')
        .select('*')
        .eq('event_id', eventId)
        .maybeSingle();

      if (capacityError) throw capacityError;

      setEvent(eventData);
      setRemaining(capacityData?.remaining ?? eventData.capacity);
    } catch (error) {
      console.error('Error fetching event:', error);
      setError('Грешка при зареждане на събитието');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);


  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.name.trim()) {
      setError('Моля, въведете вашето име');
      return;
    }

    if (!formData.email.trim()) {
      setError('Моля, въведете вашия email');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Моля, въведете валиден email адрес');
      return;
    }

    if (remaining <= 0 && formData.status === 'attending') {
      setError('Няма свободни места');
      return;
    }

    try {
      setSubmitting(true);

      const { data: existingRsvp, error: checkError } = await supabase
        .from('rsvps')
        .select('id')
        .eq('event_id', eventId)
        .eq('email', formData.email.toLowerCase())
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingRsvp) {
        setError('Вече сте се регистрирали за това събитие.');
        return;
      }

      const { error: insertError } = await supabase
        .from('rsvps')
        .insert({
          event_id: eventId,
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          status: formData.status
        });

      if (insertError) {
        if (insertError.message.includes('Няма свободни места')) {
          setError('Няма свободни места');
        } else {
          throw insertError;
        }
        return;
      }

      setSuccess(true);
      setFormData({ name: '', email: '', status: 'attending' });

      await fetchEventDetails();

      setTimeout(() => setSuccess(false), 5000);
    } catch (error: any) {
      console.error('Error submitting RSVP:', error);
      setError(error.message || 'Грешка при подаване на регистрацията');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            Събитието не е намерено
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Назад към събития
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Назад към събития
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            {event.title}
          </h1>

          <div className="space-y-4 mb-6">
            <div className="flex items-start">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Дата и час</p>
                <p className="text-lg text-gray-900 dark:text-white font-medium">
                  {formatEventDate(event.date)}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Локация</p>
                <p className="text-lg text-gray-900 dark:text-white font-medium">
                  {event.location}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Капацитет</p>
                <p className="text-lg text-gray-900 dark:text-white font-medium">
                  {remaining <= 0 ? (
                    <span className="text-red-600 dark:text-red-400">Разпродадено</span>
                  ) : (
                    <span>
                      Оставащи места: <span className="text-blue-600 dark:text-blue-400">{remaining}</span> / {event.capacity}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {event.description && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Описание
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {event.description}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            RSVP форма
          </h2>

          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start animate-slide-down shadow-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-green-800 dark:text-green-300">
                Благодарим! Записът е получен.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start animate-slide-down shadow-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
              }
            }}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Вашето име
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Иван Иванов"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email адрес
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ivan@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Статус
              </label>
              <div className="space-y-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="attending"
                    checked={formData.status === 'attending'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'attending' })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-900 dark:text-white">
                    Ще присъствам
                  </span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="maybe"
                    checked={formData.status === 'maybe'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'maybe' })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-900 dark:text-white">
                    Може би
                  </span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="declined"
                    checked={formData.status === 'declined'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'declined' })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-900 dark:text-white">
                    Няма да присъствам
                  </span>
                </label>
              </div>
            </div>

            <LoadingButton
              type="submit"
              loading={submitting}
              variant="primary"
              className="w-full px-6 py-3"
            >
              Изпрати RSVP
            </LoadingButton>
          </form>
        </div>
      </div>
    </div>
  );
}
