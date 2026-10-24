// Редакционные поля справочника. Заполняются после ветеринарной проверки — до этого на странице
// честно показано «не указано». Дозировки и медицинские утверждения в редизайне не менялись.
export const dosagesEditorial: {
  source: string | null;
  reviewer: { name: string; slug?: string } | null;
  revisedAt: string | null; // ISO-дата редакции
} = {
  source: null,
  reviewer: null,
  revisedAt: null,
};
