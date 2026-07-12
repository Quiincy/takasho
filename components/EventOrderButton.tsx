'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar as CalendarIcon, Phone, User, MessageSquare } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { uk } from 'date-fns/locale/uk';
import { setHours, setMinutes, format } from 'date-fns';
import { useSiteSettings } from '@/lib/settings-context';
import "react-datepicker/dist/react-datepicker.css";
import { IMaskInput } from 'react-imask';

// Register Ukrainian locale for the calendar
registerLocale('uk', uk);

const EVENT_TYPES = [
  '🎂 День народження',
  '🥂 Банкет',
  '💍 Весілля',
  '🍱 Кейтеринг',
  '🚙 Виїзний фуршет'
];

export default function EventOrderButton() {
  const { work_time_start, work_time_end } = useSiteSettings();

  const parseTime = (timeStr: string) => {
    const [h, m] = (timeStr || '10:00').split(':').map(Number);
    return setHours(setMinutes(new Date(), m || 0), h || 0);
  };

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [minDate, setMinDate] = useState<Date>(new Date());

  const [formData, setFormData] = useState({
    eventType: EVENT_TYPES[0],
    customerName: '',
    customerPhone: '',
    comment: '',
    eventDate: null as Date | null,
  });

  useEffect(() => {
    setMounted(true);
    // Set today's date as minimum
    setMinDate(new Date());
  }, []);

  useEffect(() => {
    if (isOpen && bookedDates.length === 0) {
      // Fetch booked dates when modal opens
      fetch('/api/event-order')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.bookedDates) {
            setBookedDates(data.bookedDates);
          }
        })
        .catch(err => console.error('Failed to fetch booked dates', err));
    }
  }, [isOpen, bookedDates.length]);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(true);
    setSuccess(false);
    setError('');
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset form after a short delay so animation finishes
    setTimeout(() => {
      setSuccess(false);
      setError('');
      setFormData({
        eventType: EVENT_TYPES[0],
        customerName: '',
        customerPhone: '',
        comment: '',
        eventDate: null,
      });
    }, 300);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, eventDate: date }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.eventDate) {
      setError('Будь ласка, оберіть дату та час.');
      return;
    }

    const digits = formData.customerPhone.replace(/\D/g, '');
    if (digits.length < 12) {
      setError('Номер телефону введено не повністю. Будь ласка, перевірте правильність.');
      return;
    }

    // Format local date correctly (YYYY-MM-DD) avoiding timezone shifts
    const offset = formData.eventDate.getTimezoneOffset() * 60000;
    const localDateStr = new Date(formData.eventDate.getTime() - offset).toISOString().split('T')[0];
    const localTimeStr = format(formData.eventDate, 'HH:mm');

    if (bookedDates.includes(localDateStr)) {
      setError('На жаль, обрана дата вже заброньована.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        eventDate: localDateStr,
        eventTime: localTimeStr
      };

      const res = await fetch('/api/event-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        // Add to booked dates to prevent double booking in the same session
        setBookedDates(prev => [...prev, localDateStr]);
      } else {
        setError(data.error || 'Виникла помилка. Спробуйте пізніше.');
      }
    } catch (err) {
      setError('Помилка з\'єднання. Спробуйте пізніше.');
    } finally {
      setLoading(false);
    }
  };

  const excludeDates = bookedDates.map(d => new Date(d));

  const modalContent = isOpen ? (
    <div className="event-modal-backdrop" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backdropFilter: 'blur(5px)',
    }}>
      <style>{`
        /* Hide scrollbar for modal */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Mobile fullscreen modal */
        .event-modal-container {
          background: var(--bg-primary);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 32px;
          width: 100%;
          max-width: 500px;
          position: relative;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          max-height: 95vh;
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .event-modal-backdrop {
            padding: 0 !important;
          }
          .event-modal-container {
            max-width: 100%;
            max-height: 100vh;
            height: 100vh;
            border-radius: 0;
            border: none;
            padding: 24px 20px;
          }
        }
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker {
          font-family: inherit;
          background-color: var(--bg-card);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: var(--text-primary);
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }
        .react-datepicker__header {
          background-color: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
          padding-top: 12px;
        }
        .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header {
          color: var(--text-primary);
          font-weight: 700;
        }
        .react-datepicker__day-name, .react-datepicker__day, .react-datepicker__time-name {
          color: var(--text-secondary);
        }
        .react-datepicker__day:hover {
          background-color: rgba(230, 57, 70, 0.2);
          color: var(--accent);
          border-radius: 8px;
        }
        .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected {
          background-color: var(--accent) !important;
          color: white !important;
          border-radius: 8px;
        }
        .react-datepicker__day--disabled {
          color: rgba(255,255,255,0.15) !important;
          text-decoration: line-through;
        }
        .react-datepicker__day--disabled:hover {
          background-color: transparent !important;
          color: rgba(255,255,255,0.15) !important;
        }
        .react-datepicker__navigation-icon::before {
          border-color: var(--text-secondary);
        }
        .react-datepicker__navigation:hover *::before {
          border-color: var(--accent);
        }
        .react-datepicker__time-container {
          border-left: 1px solid rgba(255,255,255,0.05) !important;
        }
        .react-datepicker__time {
          background-color: var(--bg-card) !important;
          color: var(--text-primary) !important;
        }
        .react-datepicker__time-list-item:hover {
          background-color: rgba(230, 57, 70, 0.2) !important;
          color: var(--accent) !important;
        }
        .react-datepicker__time-list-item--selected {
          background-color: var(--accent) !important;
          color: white !important;
        }
        .react-datepicker__time-list-item--disabled {
          display: none !important;
        }
      `}</style>
      <div className="no-scrollbar event-modal-container">
        <button 
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: 20, right: 20,
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            color: 'var(--text-secondary)',
            width: 48, height: 48,
            padding: 0,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <X size={20} />
        </button>

        <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>
          Замовити свято
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 15, lineHeight: 1.5 }}>
          Заповніть форму, і ми зв'яжемося з вами для обговорення всіх деталей.
        </p>

        {success ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: 'rgba(76, 175, 80, 0.1)',
            borderRadius: 16,
            border: '1px solid rgba(76, 175, 80, 0.2)'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h4 style={{ fontSize: 20, fontWeight: 700, color: '#4CAF50', marginBottom: 8 }}>Дякуємо за замовлення!</h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Ваш запит успішно відправлено. Ми скоро зв'яжемося з вами.
            </p>
            <button 
              onClick={handleClose}
              style={{
                marginTop: 24,
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 100,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Закрити
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {error && (
              <div style={{ 
                padding: '12px 16px', 
                background: 'rgba(230, 57, 70, 0.1)', 
                border: '1px solid rgba(230, 57, 70, 0.3)',
                borderRadius: 12,
                color: '#ff4d4d',
                fontSize: 14,
                fontWeight: 500
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Яке свято плануєте?
              </label>
              <select 
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                required
                style={{
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: 'var(--text-primary)',
                  fontSize: 16,
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer'
                }}
              >
                {EVENT_TYPES.map(type => (
                  <option key={type} value={type} style={{ background: '#1a1a1a' }}>{type}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Дата та час свята
              </label>
              <div style={{ position: 'relative' }}>
                <CalendarIcon size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 2 }} />
                <DatePicker 
                  selected={formData.eventDate}
                  onChange={handleDateChange}
                  minDate={minDate}
                  excludeDates={excludeDates}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={30}
                  timeCaption="Час"
                  minTime={parseTime(work_time_start)}
                  maxTime={parseTime(work_time_end)}
                  locale="uk"
                  dateFormat="dd.MM.yyyy HH:mm"
                  placeholderText="Оберіть вільну дату та час"
                  required
                  customInput={
                    <input 
                      style={{
                        width: '100%',
                        padding: '14px 16px 14px 44px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12,
                        color: 'var(--text-primary)',
                        fontSize: 16,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  }
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Ваше ім'я
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text"
                  name="customerName"
                  placeholder="Олександр"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 44px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    color: 'var(--text-primary)',
                    fontSize: 16,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Номер телефону
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <IMaskInput 
                  mask="+38\0 (00) 000 00 00"
                  lazy={false}
                  name="customerPhone"
                  placeholder="+380 (__) ___ __ __"
                  value={formData.customerPhone}
                  onAccept={(value) => setFormData(prev => ({ ...prev, customerPhone: value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 44px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    color: 'var(--text-primary)',
                    fontSize: 16,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Побажання / Коментар
              </label>
              <div style={{ position: 'relative' }}>
                <MessageSquare size={18} style={{ position: 'absolute', left: 16, top: 16, color: 'var(--text-muted)' }} />
                <textarea 
                  name="comment"
                  placeholder="Напишіть ваші побажання щодо свята..."
                  value={formData.comment}
                  onChange={handleChange}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 44px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    color: 'var(--text-primary)',
                    fontSize: 16,
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{
                marginTop: 8,
                background: 'linear-gradient(135deg, var(--accent) 0%, #c1121f 100%)',
                color: 'white',
                border: 'none',
                padding: '16px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 16,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'opacity 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              {loading ? 'Відправка...' : 'Підтвердити замовлення'}
            </button>
          </form>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <a 
        href="#" 
        onClick={handleOpen}
        className="events-btn" 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          background: 'linear-gradient(135deg, var(--accent) 0%, #c1121f 100%)',
          color: 'white',
          padding: '16px 32px',
          borderRadius: 100,
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: 16,
          boxShadow: '0 8px 25px rgba(230, 57, 70, 0.4)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(230, 57, 70, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(230, 57, 70, 0.4)';
        }}
      >
        <Phone size={18} />
        Замовити організацію
      </a>

      {mounted && typeof document !== 'undefined' && createPortal(modalContent, document.body)}
    </>
  );
}
