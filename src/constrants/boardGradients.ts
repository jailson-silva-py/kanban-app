export const BOARD_GRADIENTS = [
  "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500",
  "bg-gradient-to-r from-green-300 via-blue-500 to-purple-600",
  "bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400",
  "from-black via-30% from-40% to-60% via-gray-900 to-black",
  "bg-gradient-to-r from-indigo-200 via-red-200 to-yellow-100",
  "bg-gradient-to-r from-yellow-100 via-yellow-300 to-yellow-500",
  "bg-gradient-to-r from-yellow-200 via-green-200 to-green-500",
  "bg-gradient-to-tl from-gray-200 via-gray-400 to-gray-600",
  "bg-gradient-to-br from-green-200 via-green-400 to-purple-700",
  "bg-gradient-to-b from-green-300 via-yellow-300 to-pink-300",
  "bg-gradient-to-b from-purple-200 via-purple-400 to-purple-800",
  "bg-gradient-to-bl from-red-800 via-yellow-600 to-yellow-500",
  "[background-image:conic-gradient(from_0deg,_rgb(30,41,59),_rgb(56,189,248),_rgb(167,139,250))]",
  "bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900",
  "[background-image:conic-gradient(from_0deg,_rgb(17,24,39),_rgb(243,244,246),_rgb(17,24,39))]",
  "[background-image:conic-gradient(from_90deg,_rgb(234,179,8),_rgb(168,85,247),_rgb(59,130,246))]",
  "[background-image:conic-gradient(from_45deg,_rgb(14,165,233),_rgb(254,217,163),_rgb(202,138,4))]",
  "[background-image:conic-gradient(from_270deg,_rgb(199,210,254),_rgb(71,85,99),_rgb(199,210,254))]",
  "[background-image:conic-gradient(from_90deg,_rgb(56,189,248),_rgb(30,64,175))]",
  "bg-gradient-to-bl from-indigo-900 via-indigo-400 to-indigo-900",
  "[background-image:conic-gradient(from_0deg,_rgb(124,45,18),_rgb(254,243,194),_rgb(124,45,18))]",
  "[background-image:conic-gradient(from_270deg,_rgb(127,16,16),_rgb(215,214,254),_rgb(117,16,16))]",
  "bg-gradient-to-b from-gray-900 via-purple-900 to-violet-600",
  "[background-image:radial-gradient(circle_at_top,_rgb(180,83,9),_rgb(253,186,116),_rgb(159,18,57))]",
  "[background-image:radial-gradient(circle_at_bottom_right,_rgb(180,83,9),_rgb(253,186,116),_rgb(159,18,57))]",
  "[background-image:radial-gradient(circle_at_bottom_right,_rgb(253,230,138),_rgb(124,58,237),_rgb(12,74,110))]",
];


export function getRandomGradient() {

    const arrayBuffer = new Uint8Array(1);
  
    for (let i = 0; i < BOARD_GRADIENTS.length;i++) {
        arrayBuffer[i] = i
    }

    const rn = crypto.getRandomValues(arrayBuffer);

    const number = rn[0] % BOARD_GRADIENTS.length;

    return BOARD_GRADIENTS[number];
}