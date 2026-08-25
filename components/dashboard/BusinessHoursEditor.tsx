'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2 } from 'lucide-react';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export type DayHours = {
  isOpen: boolean;
  shift1Start: string;
  shift1End: string;
  shift2Start: string;
  shift2End: string;
};

export type BusinessHoursData = Record<string, DayHours>;

const defaultHours: BusinessHoursData = DAYS.reduce((acc, day) => {
  acc[day] = {
    isOpen: day !== 'Domingo',
    shift1Start: '09:00',
    shift1End: '13:00',
    shift2Start: '17:00',
    shift2End: '21:00',
  };
  return acc;
}, {} as BusinessHoursData);

interface BusinessHoursEditorProps {
  value: string; // JSON string
  onChange: (newValue: string) => void;
}

export function BusinessHoursEditor({ value, onChange }: BusinessHoursEditorProps) {
  const [hours, setHours] = useState<BusinessHoursData>(defaultHours);

  useEffect(() => {
    if (value && value.startsWith('{')) {
      try {
        setHours(JSON.parse(value));
      } catch (e) {
        // Fallback
      }
    }
  }, [value]);

  const updateDay = (day: string, field: keyof DayHours, val: string | boolean) => {
    const newHours = {
      ...hours,
      [day]: {
        ...hours[day],
        [field]: val
      }
    };
    setHours(newHours);
    onChange(JSON.stringify(newHours));
  };

  const copyToAll = (sourceDay: string) => {
    const sourceData = hours[sourceDay];
    const newHours = { ...hours };
    DAYS.forEach(day => {
      if (day !== sourceDay && day !== 'Domingo' && day !== 'Sábado') {
        newHours[day] = { ...sourceData };
      }
    });
    setHours(newHours);
    onChange(JSON.stringify(newHours));
  };

  return (
    <div className="space-y-4">
      {DAYS.map((day) => {
        const data = hours[day] || defaultHours[day];
        return (
          <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
            <div className="w-32 flex-shrink-0 flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.isOpen}
                onChange={(e) => updateDay(day, 'isOpen', e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-violet-500 focus:ring-violet-500"
              />
              <span className={`text-sm font-medium ${data.isOpen ? 'text-slate-200' : 'text-slate-500 line-through'}`}>
                {day}
              </span>
            </div>

            {data.isOpen ? (
              <div className="flex-1 flex flex-col xl:flex-row gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={data.shift1Start}
                    onChange={(e) => updateDay(day, 'shift1Start', e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-300 w-[95px] focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  <span className="text-slate-500 text-xs">a</span>
                  <input
                    type="time"
                    value={data.shift1End}
                    onChange={(e) => updateDay(day, 'shift1End', e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-300 w-[95px] focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-600 text-xs px-1">y</span>
                  <input
                    type="time"
                    value={data.shift2Start}
                    onChange={(e) => updateDay(day, 'shift2Start', e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-300 w-[95px] focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  <span className="text-slate-500 text-xs">a</span>
                  <input
                    type="time"
                    value={data.shift2End}
                    onChange={(e) => updateDay(day, 'shift2End', e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-300 w-[95px] focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 text-sm text-slate-500 italic">Cerrado</div>
            )}
          </div>
        );
      })}
      
      <div className="flex justify-end mt-2">
        <button
          type="button"
          onClick={() => copyToAll('Lunes')}
          className="text-xs text-blue-400 hover:text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 px-3 py-1.5 rounded-lg transition-colors font-medium"
        >
          Copiar Lunes a toda la semana
        </button>
      </div>
    </div>
  );
}
