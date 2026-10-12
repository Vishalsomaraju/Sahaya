import { useState } from 'react';
import { Clock, Pill, Droplets, Calendar as CalendarIcon, Check } from 'lucide-react';
import FloatingCard from '../../components/shared/FloatingCard';

interface ReminderItem {
  id: number;
  time: string;
  title: string;
  desc: string;
  type: 'pill' | 'water' | 'appointment';
  completed: boolean;
}

const initialReminders: ReminderItem[] = [
  {
    id: 1,
    time: '08:00 AM',
    title: 'Morning Medication',
    desc: 'Paracetamol (500mg) - After breakfast',
    type: 'pill',
    completed: true
  },
  {
    id: 2,
    time: '02:00 PM',
    title: 'Hydration Check',
    desc: 'Drink at least 2 glasses of clean boiled/filtered water',
    type: 'water',
    completed: false
  },
  {
    id: 3,
    time: '08:00 PM',
    title: 'Evening Medication',
    desc: 'Paracetamol (500mg) - After dinner',
    type: 'pill',
    completed: false
  },
  {
    id: 4,
    time: 'Tomorrow, 10:00 AM',
    title: 'Follow-up Call',
    desc: 'Video consultation check-in with Dr. Priya Sharma',
    type: 'appointment',
    completed: false
  }
];

export default function PatientReminders() {
  const [reminders, setReminders] = useState<ReminderItem[]>(initialReminders);
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'COMPLETED'>('ALL');

  const toggleReminder = (id: number) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const filteredReminders = reminders.filter(r => {
    if (filter === 'UPCOMING') return !r.completed;
    if (filter === 'COMPLETED') return r.completed;
    return true;
  });

  const completedCount = reminders.filter(r => r.completed).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pill':
        return <Pill size={16} className="text-teal-600" />;
      case 'water':
        return <Droplets size={16} className="text-blue-500" />;
      case 'appointment':
        return <CalendarIcon size={16} className="text-indigo-600" />;
      default:
        return <Clock size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-16 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Care Reminders</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Daily schedule for prescribed medication, hydration, and doctor visits
          </p>
        </div>

        {/* Progress summary chip */}
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-teal-50 text-[var(--color-primary-dark)] border border-teal-200 self-start sm:self-auto">
          <Check size={14} />
          <span>{completedCount} of {reminders.length} tasks completed today</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-medium self-start">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            filter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({reminders.length})
        </button>
        <button
          onClick={() => setFilter('UPCOMING')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            filter === 'UPCOMING' ? 'bg-white text-teal-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Upcoming ({reminders.length - completedCount})
        </button>
        <button
          onClick={() => setFilter('COMPLETED')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            filter === 'COMPLETED' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.length === 0 ? (
          <FloatingCard className="p-12 text-center text-slate-500 text-sm">
            No reminders in this category.
          </FloatingCard>
        ) : (
          filteredReminders.map((reminder) => (
            <FloatingCard
              key={reminder.id}
              onClick={() => toggleReminder(reminder.id)}
              className={`p-4 sm:p-5 border transition-all cursor-pointer ${
                reminder.completed 
                  ? 'bg-slate-50/70 border-slate-200' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    reminder.completed ? 'bg-slate-200 text-slate-400' : 'bg-slate-100'
                  }`}>
                    {getTypeIcon(reminder.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-base font-bold tracking-tight ${
                        reminder.completed ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}>
                        {reminder.title}
                      </span>

                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        <Clock size={11} className="text-slate-400" />
                        {reminder.time}
                      </span>
                    </div>

                    <p className={`text-xs leading-relaxed ${
                      reminder.completed ? 'text-slate-400' : 'text-slate-600 font-medium'
                    }`}>
                      {reminder.desc}
                    </p>
                  </div>
                </div>

                {/* Completion Checkbox Button */}
                <button
                  type="button"
                  aria-label={reminder.completed ? "Mark incomplete" : "Mark complete"}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleReminder(reminder.id);
                  }}
                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors cursor-pointer mt-1 ${
                    reminder.completed 
                      ? 'bg-emerald-600 text-white' 
                      : 'border-2 border-slate-300 hover:border-teal-500 bg-white'
                  }`}
                >
                  {reminder.completed ? <Check size={14} strokeWidth={3} /> : null}
                </button>

              </div>
            </FloatingCard>
          ))
        )}
      </div>

      <div className="p-3.5 rounded-lg bg-teal-50/50 border border-teal-100 text-xs text-slate-500">
        <strong className="text-teal-900">Care Note: </strong>
        Click any reminder checkbox to mark it as completed. Scheduled consults are updated automatically by your clinician.
      </div>

    </div>
  );
}
