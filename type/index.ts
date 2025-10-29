import { TextInputProps } from "react-native";

type PersistedState = {
  elapsedMs: number;
  running: boolean;
  startedAt?: number;
};

type ModalProps = {
  open: boolean;
  onClose?: () => void;
  dismissible?: boolean;
  children: React.ReactNode;
  backdropClassName?: string;
  contentClassName?: string;
  testID?: string;
};

type Variant =
  | "primary"
  | "secondary"
  | "accent"
  | "outline"
  | "destructive"
  | "ghost";
type Size = "sm" | "md" | "lg" | "iconsSized";

type ButtonProps = {
  title?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  size?: Size;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  textClassName?: string;
  testID?: string;
  icon?: 'edit' | 'delete' | 'play' | 'pause' | 'stop' | 'init' | 'share' | 'save';
  sizeIcon?: number;
};

type CheckboxRowProps = {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  description?: string;
  disabled?: boolean;
  className?: string;
};

type PropsDatePicker = {
  value?: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  className?: string;
  disabled?: boolean;
};

type FieldProps = {
  label?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
};

type InputProps = TextInputProps & {
  error?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  secureToggle?: boolean;
  containerClassName?: string;
  inputClassName?: string;
};

type Profile = {
  id: string;
  email: string;
  nomeCompleto: string;
  dataNascimento: string;
  congregacao: string;
  cidade: string;
  estado: string;
  createdAt?: any;
  updatedAt?: any;
};

type AuthCtx = {
  user: Profile | null;
  firebaseUser: any | null;
  loading: boolean;
  signIn(email: string, password: string): Promise<void>;
  signUp(
    email: string,
    password: string,
    profileData: Omit<Profile, "id" | "email" | "createdAt" | "updatedAt">
  ): Promise<void>;
  signOut(): Promise<void>;
  updateProfile(profileData: Partial<Profile>): Promise<void>;

  resetPassword(email: string): Promise<void>;
  confirmPasswordReset(oobCode: string, newPassword: string): Promise<void>;
  changePassword(newPassword: string): Promise<void>;

  deleteAccount(password: string): Promise<void>;
};

type VariantConfirmProvider =
  | "primary"
  | "secondary"
  | "outline"
  | "destructive"
  | "ghost";

type Option = {
  key: string;
  label: string;
  variant?: Variant;
};

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: VariantConfirmProvider;
  options?: Option[];
  dismissible?: boolean;
};

type InternalState = {
  open: boolean;
  opts: ConfirmOptions | null;
  resolve?: (value: any) => void;
};

type ConfirmContextType = {
  confirm(opts: ConfirmOptions): Promise<boolean>;
  choose(opts: ConfirmOptions & { options: Option[] }): Promise<string | null>;
};

type Revisita =
  | { enabled: false }
  | {
      enabled: true;
      nome: string;
      numeroCasa: string;
      celular?: string;
      data: string;
      horario: string;
      endereco?: string;
    };

type Estudo =
  | { enabled: false }
  | {
      enabled: true;
      nome: string;
      numeroCasa: string;
      celular?: string;
      dia: string;
      horario: string;
      endereco?: string;
      material?: string;
    };

type Note = {
  id: string;
  date: string;
  hours: number;
  locationNotes?: string;
  actions: string[];
  revisita: Revisita;
  estudo?: Estudo;
  monthKey?: string;
  userId?: string;
  createdAt?: any;
  updatedAt?: any;
};

type NotesCtx = {
  notes: Note[];
  loading: boolean;
  error: string | null;
  addNote: (
    n: Omit<Note, "id" | "userId" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateNote: (n: Note) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNote: (id: string) => Note | undefined;
  clearAll: () => Promise<void>;
};

type NoteFormProps = {
  initial?: Partial<Note>;
  onSubmit: (note: Note) => void;
};

type ReportEntry = {
  date: string;
  hours: number;
  revisita: boolean;
  estudo: boolean;
};

type Report = {
  id: string;
  month: string;
  periodLabel: string;
  entries: ReportEntry[];
  totalHours: number;
  isClosed: boolean;
  createdAt?: any;
  userId?: string;
  updatedAt?: any;
};

type ReportsCtx = {
  reports: Report[];
  loading: boolean;
  error: string | null;
  generateAndSaveCurrentMonth: (notes: Note[]) => Promise<Report>;
  deleteReport: (id: string) => Promise<void>;
  findByMonth: (yyyyMM: string) => Report | undefined;
};

export type {
  PersistedState,
  ModalProps,
  Variant,
  Size,
  ButtonProps,
  CheckboxRowProps,
  PropsDatePicker,
  FieldProps,
  InputProps,
  NoteFormProps,
  Profile,
  AuthCtx,
  VariantConfirmProvider,
  Option,
  ConfirmOptions,
  InternalState,
  ConfirmContextType,
  Note,
  NotesCtx,
  ReportEntry,
  Report,
  ReportsCtx,
};
