import { Clock, Pill, Droplets, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import FloatingCard from '../../components/shared/FloatingCard';
import { motion } from 'framer-motion';

const mockReminders = [
  {
    id: 1,
    time: '08:00 AM',
    title: 'Morning Medication',
    desc: 'Paracetamol (500mg) - After breakfast',
    type: 'pill',
    completed: true,
    color: 'bg-indigo-50 text-indigo-600',
    iconColor: 'text-indigo-500'
  },
  {
    id: 2,
    time: '02:00 PM',
    title: 'Hydration Check',
    desc: 'Drink at least 2 glasses of water',
    type: 'water',
    completed: false,
    color: 'bg-blue-50 text-blue-600',
    iconColor: 'text-blue-500'
  },
  {
    id: 3,
    time: '08:00 PM',
    title: 'Evening Medication',
    desc: 'Paracetamol (500mg) - After dinner',
    type: 'pill',
    completed: false,
    color: 'bg-indigo-50 text-indigo-600',
    iconColor: 'text-indigo-500'
  },
  {
    id: 4,
    time: 'Tomorrow, 10:00 AM',
    title: 'Follow-up Call',
    desc: 'Video consultation with Dr. Priya Sharma',
    type: 'appointment',
    completed: false,
    color: 'bg-emerald-50 text-emerald-600',
    iconColor: 'text-emerald-500'
  }
];

export default function PatientReminders() {
  const getIcon = (type: string, colorClass: string) => {
    switch (type) {
      case 'pill': return <Pill size={28} className={colorClass} />;
      case 'water': return <Droplets size={28} className={colorClass} />;
      case 'appointment': return <CalendarIcon size={28} className={colorClass} />;
      default: return <Clock size={28} className={colorClass} />;
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-24 pt-6 max-w-4xl mx-auto px-4 md:px-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-[var(--color-text-primary)] tracking-tight">Reminders</h1>
          <p className="text-lg text-[var(--color-text-muted)] font-medium mt-2">Your daily health schedule</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockReminders.map((reminder, index) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            key={reminder.id}
          >
            <FloatingCard className={`p-8 rounded-[32px] border-2 transition-all cursor-pointer group ${reminder.completed ? 'border-gray-100 bg-gray-50/50' : 'border-gray-100 hover:border-[var(--color-primary)] hover:shadow-md'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${reminder.color}`}>
                  {getIcon(reminder.type, reminder.iconColor)}
                </div>
                {reminder.completed ? (
                  <CheckCircle2 size={32} className="text-emerald-500" />
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 group-hover:border-[var(--color-primary)] transition-colors"></div>
                )}
              </div>
              
              <div>
                <div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
                  <Clock size={16} />
                  {reminder.time}
                </div>
                <h3 className={`text-2xl font-extrabold mb-2 ${reminder.completed ? 'text-gray-400 line-through' : 'text-[var(--color-text-primary)]'}`}>
                  {reminder.title}
                </h3>
                <p className={`text-lg font-medium ${reminder.completed ? 'text-gray-400' : 'text-[var(--color-text-muted)]'}`}>
                  {reminder.desc}
                </p>
              </div>
            </FloatingCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
