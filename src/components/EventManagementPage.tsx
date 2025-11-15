import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Download, Copy, Search, Filter, Trash2, CheckCircle, AlertCircle, Clock, Users, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { LoadingButton } from './LoadingButton';
import { formatEventDate } from '../lib/dateUtils';

interface RSVP {
  id: string;
  event_id: string;
  name: string;
  email: string;
  status: 'attending' | 'maybe' | 'declined';
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
  capacity: number;
  created_by: string;
}

interface EventManagementPageProps {
  eventId: string;
  onBack: () => void;
}

export function EventManagementPage({ eventId, onBack }: EventManagementPageProps) {
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [filteredRsvps, setFilteredRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatingDemo, setGeneratingDemo] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    fetchRSVPs();
  }, [eventId]);

  useEffect(() => {
    filterRSVPs();
  }, [rsvps, searchTerm, statusFilter]);

  const fetchEventDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('Грешка при зареждане на събитието');
    }
  };

  const fetchRSVPs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRsvps(data || []);
    } catch (err) {
      console.error('Error fetching RSVPs:', err);
      setError('Грешка при зареждане на RSVPs');
    } finally {
      setLoading(false);
    }
  };

  const filterRSVPs = () => {
    let filtered = [...rsvps];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(rsvp => rsvp.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(rsvp => {
        const email = rsvp.email.toLowerCase();
        const name = rsvp.name.toLowerCase();
        return email.includes(term) || name.includes(term);
      });
    }

    setFilteredRsvps(filtered);
  };

  const updateRSVPStatus = async (rsvpId: string, newStatus: 'attending' | 'maybe' | 'declined') => {
    try {
      const { error } = await supabase
        .from('rsvps')
        .update({ status: newStatus })
        .eq('id', rsvpId);

      if (error) throw error;

      setRsvps(prev => prev.map(rsvp =>
        rsvp.id === rsvpId ? { ...rsvp, status: newStatus } : rsvp
      ));
      setSuccess('Статусът е обновен успешно');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating RSVP:', err);
      setError('Грешка при обновяване на статуса');
      setTimeout(() => setError(null), 3000);
    }
  };

  const deleteRSVP = async (rsvpId: string) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете този RSVP?')) return;

    try {
      const { error } = await supabase
        .from('rsvps')
        .delete()
        .eq('id', rsvpId);

      if (error) throw error;

      setRsvps(prev => prev.filter(rsvp => rsvp.id !== rsvpId));
      setSuccess('RSVP изтрит успешно');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting RSVP:', err);
      setError('Грешка при изтриване на RSVP');
      setTimeout(() => setError(null), 3000);
    }
  };

  const exportToCSV = () => {
    const headers = ['Име', 'Email', 'Статус', 'Дата на създаване'];
    const rows = filteredRsvps.map(rsvp => [
      rsvp.name,
      rsvp.email,
      rsvp.status === 'attending' ? 'Присъства' : rsvp.status === 'maybe' ? 'Може би' : 'Отказал',
      new Date(rsvp.created_at).toLocaleString('bg-BG')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rsvps_${event?.title}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const copyAttendingEmails = () => {
    const attendingEmails = rsvps
      .filter(rsvp => rsvp.status === 'attending')
      .map(rsvp => rsvp.email)
      .join(', ');

    navigator.clipboard.writeText(attendingEmails).then(() => {
      setSuccess('Email адресите са копирани');
      setTimeout(() => setSuccess(null), 3000);
    }).catch(() => {
      setError('Грешка при копиране');
      setTimeout(() => setError(null), 3000);
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      attending: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      maybe: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      declined: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };

    const labels = {
      attending: 'Присъства',
      maybe: 'Може би',
      declined: 'Отказал'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const stats = {
    total: rsvps.length,
    attending: rsvps.filter(r => r.status === 'attending').length,
    maybe: rsvps.filter(r => r.status === 'maybe').length,
    declined: rsvps.filter(r => r.status === 'declined').length,
    remaining: event ? event.capacity - rsvps.filter(r => r.status === 'attending').length : 0
  };

  const handleGenerateDemoRSVPs = async () => {
    if (!event) return;

    setGeneratingDemo(true);
    setError(null);

    try {
      const attendingCount = rsvps.filter(r => r.status === 'attending').length;
      const availableSpots = event.capacity - attendingCount;

      if (availableSpots <= 0) {
        setError('Няма налични места за нови RSVPs');
        setGeneratingDemo(false);
        return;
      }

      const firstNames = ['Иван', 'Мария', 'Георги', 'Елена', 'Петър', 'Дарина', 'Николай', 'София', 'Димитър', 'Анна'];
      const lastNames = ['Иванов', 'Петров', 'Георгиев', 'Димитров', 'Стоянов', 'Николов', 'Христов', 'Ангелов', 'Тодоров', 'Колев'];
      const statuses: Array<'attending' | 'maybe' | 'declined'> = ['attending', 'maybe', 'declined'];

      const demoRSVPs = [];
      const numberOfRSVPs = Math.min(10, event.capacity);
      let attendingAdded = 0;

      for (let i = 0; i < numberOfRSVPs; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

        let status: 'attending' | 'maybe' | 'declined';
        if (attendingAdded >= availableSpots) {
          status = Math.random() > 0.5 ? 'maybe' : 'declined';
        } else {
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
          status = randomStatus;
          if (status === 'attending') {
            attendingAdded++;
          }
        }

        demoRSVPs.push({
          event_id: eventId,
          name: `${firstName} ${lastName}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
          status,
          guests: Math.floor(Math.random() * 3),
          dietary_restrictions: Math.random() > 0.7 ? 'Вегетариански' : null
        });
      }

      const { error: insertError } = await supabase
        .from('rsvps')
        .insert(demoRSVPs);

      if (insertError) throw insertError;

      setSuccess('Примерните RSVPs са добавени успешно');
      await fetchRSVPs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error generating demo RSVPs:', error);
      setError(error.message || 'Грешка при генериране на примерни RSVPs');
    } finally {
      setGeneratingDemo(false);
    }
  };

  if (loading || !event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Зареждане...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3 animate-slide-down shadow-lg">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3 animate-slide-down shadow-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Назад към моите събития
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{event.title}</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <CalendarIcon className="w-5 h-5" />
              <span>{formatEventDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MapPin className="w-5 h-5" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Users className="w-5 h-5" />
              <span>Капацитет: {event.capacity}</span>
            </div>
          </div>

          {event.description && (
            <p className="text-gray-600 dark:text-gray-400">{event.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Общо заявки</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Присъстват</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.attending}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Може би</div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.maybe}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Отказали</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.declined}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Оставащи места</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.remaining}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">RSVPs</h2>

            <div className="flex flex-wrap gap-3">
              <LoadingButton
                onClick={handleGenerateDemoRSVPs}
                loading={generatingDemo}
                variant="secondary"
                className="px-4 py-2"
              >
                Генерирай примерни RSVP
              </LoadingButton>
              <button
                onClick={copyAttendingEmails}
                disabled={stats.attending === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Copy className="w-4 h-4" />
                Копирай email-и (attending)
              </button>
              <button
                onClick={exportToCSV}
                disabled={filteredRsvps.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Експорт CSV
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Търсене по име или email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Всички статуси</option>
                <option value="attending">Присъства</option>
                <option value="maybe">Може би</option>
                <option value="declined">Отказал</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Име</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Статус</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Дата на създаване</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredRsvps.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Няма намерени RSVPs
                    </td>
                  </tr>
                ) : (
                  filteredRsvps.map((rsvp) => (
                    <tr key={rsvp.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {rsvp.name}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {rsvp.email}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={rsvp.status}
                          onChange={(e) => updateRSVPStatus(rsvp.id, e.target.value as any)}
                          className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="attending">Присъства</option>
                          <option value="maybe">Може би</option>
                          <option value="declined">Отказал</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                        {new Date(rsvp.created_at).toLocaleString('bg-BG')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteRSVP(rsvp.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Изтрий RSVP"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
