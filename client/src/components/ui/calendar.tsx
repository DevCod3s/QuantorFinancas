import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

// Cálculo da data da Páscoa (algoritmo Gregoriano anônimo)
function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// Feriados nacionais fixos (mês 0-indexed, dia)
const FIXED_HOLIDAYS: Record<string, string> = {
  '0-1':  'Confraternização Universal',
  '3-21': 'Tiradentes',
  '4-1':  'Dia do Trabalho',
  '8-7':  'Independência do Brasil',
  '9-12': 'Nossa Senhora Aparecida',
  '10-2': 'Finados',
  '10-15':'Proclamação da República',
  '10-20':'Dia da Consciência Negra',
  '11-25':'Natal',
};

// Datas comemorativas (não são feriados, mas têm tooltip)
const COMMEMORATIVE_DATES: Record<string, string> = {
  '0-6':  'Dia de Reis',
  '1-14': 'Dia de São Valentim',
  '2-8':  'Dia Internacional da Mulher',
  '2-15': 'Dia do Consumidor',
  '3-19': 'Dia do Índio',
  '3-22': 'Dia da Terra',
  '4-13': 'Dia das Mães',
  '5-5':  'Dia do Meio Ambiente',
  '5-12': 'Dia dos Namorados',
  '5-24': 'Dia de São João',
  '7-11': 'Dia dos Pais',
  '7-22': 'Dia do Folclore',
  '8-5':  'Dia da Amazônia',
  '9-12': 'Dia das Crianças',
  '9-15': 'Dia do Professor',
  '9-31': 'Dia das Bruxas (Halloween)',
  '10-19':'Dia da Bandeira',
  '11-24':'Véspera de Natal',
  '11-31':'Véspera de Ano Novo',
};

function getBrazilianHolidaysWithNames(year: number): Map<string, string> {
  const easter = getEasterDate(year);
  const map = new Map<string, string>();

  // Fixos
  for (const [key, name] of Object.entries(FIXED_HOLIDAYS)) {
    map.set(key, name);
  }

  // Móveis baseados na Páscoa
  const addMovel = (offset: number, name: string) => {
    const d = new Date(easter);
    d.setDate(easter.getDate() + offset);
    map.set(`${d.getMonth()}-${d.getDate()}`, name);
  };

  addMovel(-48, 'Carnaval (Segunda)');
  addMovel(-47, 'Carnaval (Terça)');
  addMovel(-46, 'Quarta-feira de Cinzas');
  addMovel(-2,  'Sexta-feira Santa');
  addMovel(0,   'Páscoa');
  addMovel(60,  'Corpus Christi');

  return map;
}

function getBrazilianHolidays(year: number): Date[] {
  const easter = getEasterDate(year);

  const holidays: Date[] = [
    new Date(year, 0, 1),
    new Date(year, 3, 21),
    new Date(year, 4, 1),
    new Date(year, 8, 7),
    new Date(year, 9, 12),
    new Date(year, 10, 2),
    new Date(year, 10, 15),
    new Date(year, 10, 20),
    new Date(year, 11, 25),
  ];

  const addOffset = (offset: number) => {
    const d = new Date(easter);
    d.setDate(easter.getDate() + offset);
    holidays.push(d);
  };

  addOffset(-48); // Carnaval segunda
  addOffset(-47); // Carnaval terça
  addOffset(-2);  // Sexta-feira Santa
  addOffset(0);   // Páscoa
  addOffset(60);  // Corpus Christi

  return holidays;
}

const holidayCache = new Map<number, Date[]>();
const holidayNameCache = new Map<number, Map<string, string>>();

function isHoliday(date: Date): boolean {
  const year = date.getFullYear();
  if (!holidayCache.has(year)) {
    holidayCache.set(year, getBrazilianHolidays(year));
  }
  const holidays = holidayCache.get(year)!;
  return holidays.some(h =>
    h.getDate() === date.getDate() && h.getMonth() === date.getMonth()
  );
}

function getHolidayName(date: Date): string | null {
  const year = date.getFullYear();
  if (!holidayNameCache.has(year)) {
    holidayNameCache.set(year, getBrazilianHolidaysWithNames(year));
  }
  const map = holidayNameCache.get(year)!;
  const key = `${date.getMonth()}-${date.getDate()}`;
  return map.get(key) || COMMEMORATIVE_DATES[key] || null;
}

function isSunday(date: Date): boolean {
  return date.getDay() === 0;
}

// Componente DayContent customizado com tooltip para feriados/datas comemorativas
function DayContentWithTooltip(props: any) {
  const { date, displayMonth, activeModifiers } = props;
  const name = getHolidayName(date);

  if (name) {
    return (
      <div className="rdp-tooltip-wrapper">
        <span>{date.getDate()}</span>
        <span className="rdp-tooltip">{name}</span>
      </div>
    );
  }

  return <>{date.getDate()}</>;
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  modifiers: externalModifiers,
  modifiersClassNames: externalModifiersClassNames,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={ptBR}
      className={cn("p-3", className)}
      modifiers={{
        sunday: isSunday,
        holiday: isHoliday,
        ...externalModifiers,
      }}
      modifiersClassNames={{
        sunday: 'rdp-day_sunday',
        holiday: 'rdp-day_holiday',
        ...externalModifiersClassNames,
      }}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: "h-9 w-9 p-0 font-normal text-center text-sm inline-flex items-center justify-center rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-selected:opacity-100",
        day_range_end: "day-range-end",
        day_selected: "rdp-day_selected",
        day_today: "rdp-day_today",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        DayContent: DayContentWithTooltip,
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
