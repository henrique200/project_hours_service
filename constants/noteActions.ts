import { Note } from "@/context/NotesContext";

const A_ENTREGOU = "Entregou publicações em mãos para o morador";
const A_DEIXOU_CARTA = "Deixou carta na caixinha da casa do morador";
const A_DEIXOU_PUB_SEM_FALAR =
  "Deixou publicação na casa do morador porém não falou com ele (Caixinha)";

const A_ABRIU_ESTUDO = "Abriu estudo com morador";
const A_REV_1 = "Primeira Revisita";
const A_REV_2 = "Segunda Revisita";
const A_NAO_QUER_ESTUDO = "Morador não quer mais o estudo";
const A_REV_1_SF =
  'Primeira Revisita (Considerando Revista "Seja Feliz para Sempre")';
const A_REV_2_SF =
  'Segunda Revisita (Considerando Revista "Seja Feliz para Sempre")';

const ACTIONS_ALL = [
  A_ENTREGOU,
  A_DEIXOU_CARTA,
  A_DEIXOU_PUB_SEM_FALAR,
  A_ABRIU_ESTUDO,
  A_REV_1,
  A_REV_2,
  A_NAO_QUER_ESTUDO,
  A_REV_1_SF,
  A_REV_2_SF,
];

const REVISITA_ACTIONS = new Set([A_REV_1, A_REV_2, A_REV_1_SF, A_REV_2_SF]);

type NoteFormProps = {
  initial?: Partial<Note>;
  onSubmit: (note: Note) => void;
};

export {
  ACTIONS_ALL,
  A_ABRIU_ESTUDO,
  A_REV_1,
  A_REV_2,
  A_REV_1_SF,
  A_REV_2_SF,
  REVISITA_ACTIONS,
};
export type { NoteFormProps };
