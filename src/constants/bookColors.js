// Paleta de colores asignados automáticamente a cada libro
const BOOK_COLORS = [
  '#00FF88', // verde primario
  '#00BFFF', // azul acento
  '#FF6B9D', // rosa
  '#FFB800', // ámbar
  '#A78BFA', // violeta
  '#FF7043', // naranja fuego
  '#26C6DA', // cyan
  '#66BB6A', // verde claro
  '#FFA726', // naranja
  '#EC407A', // fucsia
  '#42A5F5', // azul cielo
  '#AB47BC', // morado
];

export const getBookColor = (id) => BOOK_COLORS[id % BOOK_COLORS.length];

export default BOOK_COLORS;
