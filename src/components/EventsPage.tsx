import { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
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

interface EventsPageProps {
  onNavigate: (page: string, eventId?: string, mode?: 'login' | 'signup') => void;
}

export function EventsPage({ onNavigate }: EventsPageProps) {
  const [events, setEvents] = useState<EventWithCapacity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const itemsPerPage = 10;

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const now = new Date().toISOString();

      let query = supabase
        .from('events')
        .select('*', { count: 'exact' });

      if (dateFilter === 'upcoming') {
        query = query.gte('date', now);
      } else {
        query = query.lt('date', now);
      }

      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
      }

      query = query.order('date', { ascending: dateFilter === 'upcoming' });

      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage - 1;
      query = query.range(start, end);

      const { data: eventsData, error: eventsError, count } = await query;

      if (eventsError) throw eventsError;

      setTotalEvents(count || 0);

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
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchQuery, dateFilter, currentPage]);


  const totalPages = Math.ceil(totalEvents / itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Всички събития
        </h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Търсене по заглавие или локация..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setDateFilter('upcoming');
                setCurrentPage(1);
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                dateFilter === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Предстоящи
            </button>
            <button
              onClick={() => {
                setDateFilter('past');
                setCurrentPage(1);
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                dateFilter === 'past'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Изминали
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Няма намерени събития
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 mb-8">
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

                  <div className="flex-shrink-0">
                    <button
                      onClick={() => onNavigate('event-details', event.id)}
                      className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Детайли
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="text-gray-500 dark:text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
