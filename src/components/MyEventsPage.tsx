import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Plus, Edit2, Trash2, X, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { EventManagementPage } from './EventManagementPage';
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

interface EventWithCapacity extends Event {
  remaining: number;
}

export function MyEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventWithCapacity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewingEventId, setViewingEventId] = useState<string | null>(null);
  const [creatingDemo, setCreatingDemo] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    capacity: 0
  });

  const fetchMyEvents = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', user.id)
        .order('date', { ascending: false });

      if (eventsError) throw eventsError;

      if (eventsData && eventsData.length > 0) {
        const { data: capacityData, error: capacityError } = await supabase
          .from('event_capacity_view')
          .select('*')
          .in('event_id', eventsData.map(e => e.id));

        if (capacityError) throw capacityError;

        const capacityMap = new Map(
          capacityData?.map(c => [c.event_id, c.remaining]) || []
        );

        const eventsWithCapacity = eventsData.map(event => ({
          ...event,
          remaining: capacityMap.get(event.id) ?? event.capacity
        }));

        setEvents(eventsWithCapacity);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Грешка при зареждане на събитията');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, [user]);


  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleCreate = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      date: '',
      location: '',
      capacity: 0
    });
    setShowForm(true);
    setError(null);
    setSuccess(false);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      date: formatDateForInput(event.date),
      location: event.location,
      capacity: event.capacity
    });
    setShowForm(true);
    setError(null);
    setSuccess(false);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      date: '',
      location: '',
      capacity: 0
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!user) return;

    if (!formData.title.trim()) {
      setError('Моля, въведете заглавие');
      return;
    }

    if (!formData.date) {
      setError('Моля, изберете дата и час');
      return;
    }

    const selectedDate = new Date(formData.date);
    if (isNaN(selectedDate.getTime())) {
      setError('Моля, въведете валидна стойност. Данните в полето са непълни или датата е невалидна.');
      return;
    }

    if (!formData.location.trim()) {
      setError('Моля, въведете локация');
      return;
    }

    if (formData.capacity < 0) {
      setError('Капацитетът трябва да е >= 0');
      return;
    }

    try {
      setSubmitting(true);

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        date: selectedDate.toISOString(),
        location: formData.location.trim(),
        capacity: formData.capacity,
        created_by: user.id
      };

      if (editingEvent) {
        const { error: updateError } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('events')
          .insert(eventData);

        if (insertError) throw insertError;
      }

      setSuccess(true);
      setShowForm(false);
      await fetchMyEvents();

      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error saving event:', error);
      setError(error.message || 'Грешка при запазване на събитието');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (deleteError) throw deleteError;

      setDeleteConfirm(null);
      await fetchMyEvents();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      setError(error.message || 'Грешка при изтриване на събитието');
    }
  };

  const handleCreateDemoEvents = async () => {
    if (!user) return;

    setCreatingDemo(true);
    setError(null);

    try {
      const now = new Date();
      const today = new Date(now);
      today.setHours(19, 0, 0, 0);

      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(18, 30, 0, 0);

      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(20, 0, 0, 0);

      const demoEvents = [
        {
          title: 'Среща с екипа',
          description: 'Месечна среща за обсъждане на напредъка и планове',
          date: today.toISOString(),
          location: 'Офис София, ет. 3',
          capacity: 15,
          created_by: user.id
        },
        {
          title: 'Технически семинар',
          description: 'Семинар за новите технологии и best practices',
          date: tomorrow.toISOString(),
          location: 'Конферентна зала А',
          capacity: 30,
          created_by: user.id
        },
        {
          title: 'Team Building',
          description: 'Развлекателна екипна активност на открито',
          date: nextWeek.toISOString(),
          location: 'Витоша',
          capacity: 50,
          created_by: user.id
        }
      ];

      const { error: insertError } = await supabase
        .from('events')
        .insert(demoEvents);

      if (insertError) throw insertError;

      setSuccess(true);
      await fetchMyEvents();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error creating demo events:', error);
      setError(error.message || 'Грешка при създаване на примерни събития');
    } finally {
      setCreatingDemo(false);
    }
  };

  if (viewingEventId) {
    return (
      <EventManagementPage
        eventId={viewingEventId}
        onBack={() => setViewingEventId(null)}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Моите събития
        </h1>
        <div className="flex gap-3">
          <LoadingButton
            onClick={handleCreateDemoEvents}
            loading={creatingDemo}
            variant="secondary"
            className="px-4 py-2"
          >
            Създай примерни събития
          </LoadingButton>
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Създай събитие</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start animate-slide-down shadow-lg">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
          <p className="text-green-800 dark:text-green-300">Успешно запазено</p>
        </div>
      )}

      {error && !showForm && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start animate-slide-down shadow-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingEvent ? 'Редактиране на събитие' : 'Създаване на събитие'}
              </h2>
              <button
                onClick={handleCloseForm}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6" onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit(e);
              }
            }}>
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start animate-slide-down">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-red-800 dark:text-red-300">{error}</p>
                </div>
              )}

              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Заглавие
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Въведете заглавие"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Описание
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Въведете описание (опционално)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Дата
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={formData.date.includes('T') ? formData.date.split('T')[0] : ''}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      const currentTime = formData.date.includes('T') ? formData.date.split('T')[1] : '00:00';
                      if (dateValue) {
                        setFormData({ ...formData, date: `${dateValue}T${currentTime}` });
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="time"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Час
                  </label>
                  <input
                    type="time"
                    id="time"
                    value={formData.date.includes('T') ? formData.date.split('T')[1] : ''}
                    onChange={(e) => {
                      const timeValue = e.target.value;
                      const currentDate = formData.date.includes('T') ? formData.date.split('T')[0] : '';
                      if (currentDate && timeValue) {
                        setFormData({ ...formData, date: `${currentDate}T${timeValue}` });
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Локация
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Въведете локация"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="capacity"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Капацитет
                </label>
                <input
                  type="number"
                  id="capacity"
                  min="0"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <LoadingButton
                  type="submit"
                  loading={submitting}
                  variant="primary"
                  className="flex-1 px-6 py-3"
                >
                  Запази
                </LoadingButton>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                >
                  Отказ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 animate-scale-up">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Потвърждение за изтриване
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Сигурни ли сте, че искате да изтриете това събитие? Това действие не може да бъде отменено.
            </p>
            <div className="flex gap-3">
              <LoadingButton
                onClick={() => handleDelete(deleteConfirm)}
                variant="danger"
                className="flex-1 px-6 py-3"
              >
                Изтрий
              </LoadingButton>
              <LoadingButton
                onClick={() => setDeleteConfirm(null)}
                variant="secondary"
                className="px-6 py-3"
              >
                Отказ
              </LoadingButton>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            Все още нямате създадени събития
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Създай първото си събитие</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Calendar className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span>{formatEventDate(event.date)}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Users className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span>
                        {event.remaining <= 0 ? (
                          <span className="text-red-600 dark:text-red-400 font-semibold">
                            Разпродадено
                          </span>
                        ) : (
                          <span>
                            Оставащи места: <span className="font-semibold">{event.remaining}</span> / {event.capacity}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>

                <div className="flex md:flex-col gap-2">
                  <button
                    onClick={() => setViewingEventId(event.id)}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>RSVPs</span>
                  </button>
                  <button
                    onClick={() => handleEdit(event)}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Редактирай</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(event.id)}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Изтрий</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
