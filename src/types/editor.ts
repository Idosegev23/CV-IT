export interface FormatButton {
  icon: React.ReactNode;
  command: string;
  tooltip: string;
}

export interface Font {
  name: string;
  rtl: boolean;
}

export const FONTS: Font[] = [
  { name: 'Assistant', rtl: true },
  { name: 'Rubik', rtl: true },
  { name: 'Arial', rtl: true },
  { name: 'Times New Roman', rtl: false },
  { name: 'Helvetica', rtl: false },
];

export const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px']; 