export interface IconDefinition {
  id: string;
  name: string;
  category: 'physical' | 'physical-stack' | 'virtual' | 'virtual-stack' | 'other';
  viewBox: string;
  svgContent: string;
  width: number;
  height: number;
}

// Shared SVG style blocks for icon content
// .f = filled shape (white fill, #4d4d4d stroke, 1.5px)
// .l = line (no fill, #4d4d4d stroke, 1.5px)
// .d = dot/endpoint marker (no fill, #4d4d4d stroke, 2px, round cap creates dots)
const SP = '<style>.f{fill:#fff;stroke:#4d4d4d;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.l{fill:none;stroke:#4d4d4d;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.d{fill:none;stroke:#4d4d4d;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}</style>';

// Virtual icon styles add .v for dashed/dotted outlines
const SV = '<style>.f{fill:#fff;stroke:#4d4d4d;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.l{fill:none;stroke:#4d4d4d;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.d{fill:none;stroke:#4d4d4d;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.v{fill:none;stroke:#4d4d4d;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:0 4.4}</style>';

// VPN icon adds .s for shield fill (white, no stroke)
const SS = '<style>.f{fill:#fff;stroke:#4d4d4d;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.l{fill:none;stroke:#4d4d4d;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.d{fill:none;stroke:#4d4d4d;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.s{fill:#fff}</style>';

export const ICONS: IconDefinition[] = [
  // ──────────────────────────────────────────
  // Physical icons (frequently used)
  // ──────────────────────────────────────────
  {
    id: 'physical-storage',
    name: 'Storage, repo, database',
    category: 'physical',
    viewBox: '125.5 82 40 32',
    svgContent: `${SP}<path class="f" d="M127.13,93.5v8.44c0,5.63,8.26,10.19,18.45,10.19s18.45-4.56,18.45-10.19v-8.44"/><path class="f" d="M164.03,93.5c0,5.63-8.26,10.19-18.45,10.19s-18.45-4.56-18.45-10.19,8.26-9.69,18.45-9.69,18.45,4.06,18.45,9.69Z"/>`,
    width: 40,
    height: 32,
  },
  {
    id: 'physical-server',
    name: 'Server',
    category: 'physical',
    viewBox: '245.5 96 40 18',
    svgContent: `${SP}<rect class="f" x="247.09" y="97.93" width="36.9" height="14.25"/><line class="d" x1="278.1" y1="104.91" x2="278.1" y2="104.91"/><line class="l" x1="252.72" y1="105.04" x2="261.44" y2="105.04"/>`,
    width: 40,
    height: 18,
  },
  {
    id: 'physical-router',
    name: 'Router, switch, load balancer',
    category: 'physical',
    viewBox: '360.5 96 40 18',
    svgContent: `${SP}<rect class="f" x="362.04" y="97.93" width="36.9" height="14.25"/><line class="d" x1="393.05" y1="104.91" x2="393.05" y2="104.91"/><line class="l" x1="367.81" y1="107.89" x2="367.81" y2="102.05"/><line class="l" x1="372.04" y1="107.89" x2="372.04" y2="102.05"/><line class="l" x1="376.26" y1="107.89" x2="376.26" y2="102.05"/><line class="l" x1="380.49" y1="107.89" x2="380.49" y2="102.05"/>`,
    width: 40,
    height: 18,
  },
  {
    id: 'physical-document',
    name: 'Document, file, message',
    category: 'physical',
    viewBox: '479.5 73.5 32 41',
    svgContent: `${SP}<polygon class="f" points="509.59 112.22 481.3 112.22 481.3 81.21 487.06 75.44 509.59 75.44 509.59 112.22"/><polygon class="l" points="487.06 81.21 481.3 81.21 487.06 75.44 487.06 81.21"/><line class="l" x1="486.94" y1="88.18" x2="495.44" y2="88.18"/><line class="l" x1="486.94" y1="93.81" x2="503.95" y2="93.81"/><line class="l" x1="486.94" y1="99.45" x2="503.95" y2="99.45"/><line class="l" x1="486.94" y1="105.08" x2="503.95" y2="105.08"/>`,
    width: 32,
    height: 41,
  },
  {
    id: 'physical-user',
    name: 'User',
    category: 'physical',
    viewBox: '590 74 41 40',
    svgContent: `${SP}<path class="f" d="M628.85,112.21c0-10.06-8.26-18.22-18.45-18.22s-18.45,8.16-18.45,18.22h36.9Z"/><ellipse class="f" cx="610.4" cy="84.85" rx="9.26" ry="9.15"/>`,
    width: 41,
    height: 40,
  },
  {
    id: 'physical-cloud',
    name: 'Public access',
    category: 'physical',
    viewBox: '702 84 48 30',
    svgContent: `${SP}<path class="f" d="M740.44,98.93c0-7.33-5.99-13.27-13.38-13.27-5,0-9.36,2.73-11.65,6.76-.56-.1-1.14-.16-1.73-.16-5.55,0-10.05,4.46-10.05,9.97s4.5,9.97,10.05,9.97h26.76c3.69,0,6.69-2.97,6.69-6.64s-3-6.64-6.69-6.64Z"/>`,
    width: 48,
    height: 30,
  },

  // ──────────────────────────────────────────
  // Physical stack icons (frequently used)
  // ──────────────────────────────────────────
  {
    id: 'physical-storage-stack',
    name: 'Storage stack, repo, database',
    category: 'physical-stack',
    viewBox: '125.5 178 40 40',
    svgContent: `${SP}<path class="f" d="M145.58,180.01c-10.19,0-18.45,4.06-18.45,9.69v16.94c0,5.63,8.26,10.19,18.45,10.19s18.45-4.56,18.45-10.19v-16.94c0-5.63-8.26-9.69-18.45-9.69Z"/><path class="f" d="M164.03,200.95c0,5.63-8.26,10.19-18.45,10.19s-18.45-4.56-18.45-10.19"/><path class="f" d="M164.03,195.2c0,5.63-8.26,10.19-18.45,10.19s-18.45-4.56-18.45-10.19"/><path class="f" d="M164.03,189.7c0,5.63-8.26,10.19-18.45,10.19s-18.45-4.56-18.45-10.19,8.26-9.69,18.45-9.69,18.45,4.06,18.45,9.69Z"/>`,
    width: 40,
    height: 40,
  },
  {
    id: 'physical-server-stack',
    name: 'Server stack',
    category: 'physical-stack',
    viewBox: '245.5 178 40 40',
    svgContent: `${SP}<rect class="f" x="247.09" y="180" width="36.9" height="36.88"/><line class="d" x1="278.1" y1="209.61" x2="278.1" y2="209.61"/><line class="l" x1="252.72" y1="209.74" x2="261.44" y2="209.74"/><line class="d" x1="278.1" y1="198.31" x2="278.1" y2="198.31"/><line class="l" x1="252.72" y1="198.44" x2="261.44" y2="198.44"/><line class="d" x1="278.1" y1="187.01" x2="278.1" y2="187.01"/><line class="l" x1="252.72" y1="187.14" x2="261.44" y2="187.14"/>`,
    width: 40,
    height: 40,
  },
  {
    id: 'physical-gateway',
    name: 'Gateway',
    category: 'physical-stack',
    viewBox: '362 182 37 37',
    svgContent: `${SP}<rect class="f" x="363.74" y="183.38" width="33.5" height="33.43"/><polyline class="l" points="377.9 202.6 368.9 211.72 368.98 207.59"/><line class="l" x1="368.9" y1="211.72" x2="372.98" y2="211.64"/><polyline class="l" points="383.01 197.48 392.16 188.51 388.01 188.59"/><line class="l" x1="392.16" y1="188.51" x2="392.08" y2="192.58"/><polyline class="l" points="392.11 211.74 383.1 202.62 383.18 206.76"/><line class="l" x1="383.1" y1="202.62" x2="387.18" y2="202.7"/><polyline class="l" points="368.8 188.57 377.96 197.54 373.81 197.46"/><line class="l" x1="377.96" y1="197.54" x2="377.88" y2="193.47"/>`,
    width: 37,
    height: 37,
  },
  {
    id: 'physical-documents-stack',
    name: 'Documents, files, messages',
    category: 'physical-stack',
    viewBox: '478 175.5 35 44',
    svgContent: `${SP}<polygon class="f" points="506.59 212.11 479.93 212.11 479.93 182.96 485.36 177.53 506.59 177.53 506.59 212.11"/><polygon class="f" points="485.36 182.96 479.93 182.96 485.36 177.53 485.36 182.96"/><line class="l" x1="486.12" y1="190.51" x2="493.26" y2="190.51"/><line class="l" x1="486.12" y1="195.18" x2="500.4" y2="195.18"/><line class="l" x1="486.12" y1="199.73" x2="500.4" y2="199.73"/><line class="l" x1="486.12" y1="204.4" x2="500.4" y2="204.4"/><polyline class="l" points="510.96 182.35 510.96 216.92 484.3 216.92"/>`,
    width: 35,
    height: 44,
  },
  {
    id: 'physical-users',
    name: 'Users',
    category: 'physical-stack',
    viewBox: '583 171.5 55 48',
    svgContent: `${SP}<path class="f" d="M619.96,190c-2.08-2.84-5.42-4.78-9.52-4.8,3.77-.02,5.93-2.87,5.93-5.96s-2.38-5.97-5.97-5.97-5.97,2.86-5.97,5.97,2.17,5.94,5.93,5.96c-4.1.01-7.44,1.96-9.52,4.8"/><path class="f" d="M596.83,205.14c3.77-.02,5.93-2.87,5.93-5.96s-2.38-5.97-5.97-5.97-5.97,2.86-5.97,5.97,2.17,5.94,5.93,5.96c-7.03.02-11.86,5.71-11.86,11.88h23.79c0-6.17-4.82-11.86-11.86-11.88Z"/><path class="f" d="M624.05,205.14c3.77-.02,5.93-2.87,5.93-5.96s-2.38-5.97-5.97-5.97-5.97,2.86-5.97,5.97,2.17,5.94,5.93,5.96c-7.03.02-11.86,5.71-11.86,11.88h23.79c0-6.17-4.82-11.86-11.86-11.88Z"/><line class="l" x1="606.69" y1="198.78" x2="614.12" y2="198.78"/>`,
    width: 55,
    height: 48,
  },
  {
    id: 'physical-client',
    name: 'Client',
    category: 'physical-stack',
    viewBox: '705 187 41 32',
    svgContent: `${SP}<rect class="f" x="706.93" y="188.95" width="36.9" height="27.93"/><line class="d" x1="739.57" y1="193.14" x2="739.57" y2="193.14"/><line class="d" x1="736.73" y1="193.14" x2="736.73" y2="193.14"/><line class="d" x1="733.89" y1="193.14" x2="733.89" y2="193.14"/><line class="l" x1="711.18" y1="193.14" x2="722.54" y2="193.14"/>`,
    width: 41,
    height: 32,
  },

  // ──────────────────────────────────────────
  // Virtual icons (less frequently used)
  // ──────────────────────────────────────────
  {
    id: 'virtual-storage',
    name: 'Virtual storage, repo, database',
    category: 'virtual',
    viewBox: '122 329 48 39',
    svgContent: `${SV}<path class="v" d="M145.58,331.09c-12.68,0-21.89,5.52-21.89,13.13v8.44c0,7.64,9.61,13.63,21.89,13.63s21.89-5.99,21.89-13.63v-8.44c0-7.61-9.21-13.13-21.89-13.13Z"/><path class="f" d="M127.13,344.22v8.44c0,5.63,8.26,10.19,18.45,10.19s18.45-4.56,18.45-10.19v-8.44"/><path class="f" d="M164.03,344.22c0,5.63-8.26,10.19-18.45,10.19s-18.45-4.56-18.45-10.19,8.26-9.69,18.45-9.69,18.45,4.06,18.45,9.69Z"/>`,
    width: 48,
    height: 39,
  },
  {
    id: 'virtual-server',
    name: 'Virtual server',
    category: 'virtual',
    viewBox: '242 342 48 25',
    svgContent: `${SV}<line class="d" x1="243.65" y1="343.94" x2="243.65" y2="343.94"/><line class="v" x1="243.65" y1="348.16" x2="243.65" y2="362.95"/><line class="d" x1="243.65" y1="365.06" x2="243.65" y2="365.06"/><line class="v" x1="248.03" y1="365.06" x2="285.24" y2="365.06"/><line class="d" x1="287.42" y1="365.06" x2="287.42" y2="365.06"/><line class="v" x1="287.42" y1="360.84" x2="287.42" y2="346.05"/><line class="d" x1="287.42" y1="343.94" x2="287.42" y2="343.94"/><line class="v" x1="283.05" y1="343.94" x2="245.84" y2="343.94"/><rect class="f" x="247.09" y="347.38" width="36.9" height="14.25"/><line class="d" x1="278.1" y1="354.36" x2="278.1" y2="354.36"/><line class="l" x1="252.72" y1="354.48" x2="261.44" y2="354.48"/>`,
    width: 48,
    height: 25,
  },
  {
    id: 'virtual-router',
    name: 'Virtual router, switch, load balancer',
    category: 'virtual',
    viewBox: '357 342 48 25',
    svgContent: `${SV}<line class="d" x1="358.61" y1="343.94" x2="358.61" y2="343.94"/><line class="v" x1="358.61" y1="348.16" x2="358.61" y2="362.95"/><line class="d" x1="358.61" y1="365.06" x2="358.61" y2="365.06"/><line class="v" x1="362.98" y1="365.06" x2="400.19" y2="365.06"/><line class="d" x1="402.38" y1="365.06" x2="402.38" y2="365.06"/><line class="v" x1="402.38" y1="360.84" x2="402.38" y2="346.05"/><line class="d" x1="402.38" y1="343.94" x2="402.38" y2="343.94"/><line class="v" x1="398" y1="343.94" x2="360.79" y2="343.94"/><rect class="f" x="362.04" y="347.38" width="36.9" height="14.25"/><line class="d" x1="393.05" y1="354.36" x2="393.05" y2="354.36"/><line class="l" x1="367.81" y1="357.34" x2="367.81" y2="351.5"/><line class="l" x1="372.04" y1="357.34" x2="372.04" y2="351.5"/><line class="l" x1="376.26" y1="357.34" x2="376.26" y2="351.5"/><line class="l" x1="380.49" y1="357.34" x2="380.49" y2="351.5"/>`,
    width: 48,
    height: 25,
  },

  // ──────────────────────────────────────────
  // Virtual stack icons (less frequently used)
  // ──────────────────────────────────────────
  {
    id: 'virtual-storage-stack',
    name: 'Virtual storage stack, repo, database',
    category: 'virtual-stack',
    viewBox: '122 428 48 48',
    svgContent: `${SV}<path class="v" d="M145.58,429.84c-12.68,0-21.89,5.52-21.89,13.13v16.94c0,7.64,9.61,13.63,21.89,13.63s21.89-5.99,21.89-13.63v-16.94c0-7.61-9.21-13.13-21.89-13.13Z"/><path class="f" d="M145.58,433.28c-10.19,0-18.45,4.06-18.45,9.69v16.94c0,5.63,8.26,10.19,18.45,10.19s18.45-4.56,18.45-10.19v-16.94c0-5.63-8.26-9.69-18.45-9.69Z"/><path class="f" d="M164.03,454.22c0,5.63-8.26,10.19-18.45,10.19s-18.45-4.56-18.45-10.19"/><path class="f" d="M164.03,448.47c0,5.63-8.26,10.19-18.45,10.19s-18.45-4.56-18.45-10.19"/><path class="f" d="M164.03,442.97c0,5.63-8.26,10.19-18.45,10.19s-18.45-4.56-18.45-10.19,8.26-9.69,18.45-9.69,18.45,4.06,18.45,9.69Z"/>`,
    width: 48,
    height: 48,
  },
  {
    id: 'virtual-server-stack',
    name: 'Virtual server stack',
    category: 'virtual-stack',
    viewBox: '242 431 48 48',
    svgContent: `${SV}<line class="d" x1="243.65" y1="433.04" x2="243.65" y2="433.04"/><line class="v" x1="243.65" y1="437.42" x2="243.65" y2="474.6"/><line class="d" x1="243.65" y1="476.79" x2="243.65" y2="476.79"/><line class="v" x1="248.03" y1="476.79" x2="285.23" y2="476.79"/><line class="d" x1="287.42" y1="476.79" x2="287.42" y2="476.79"/><line class="v" x1="287.42" y1="472.42" x2="287.42" y2="435.23"/><line class="d" x1="287.42" y1="433.04" x2="287.42" y2="433.04"/><line class="v" x1="283.05" y1="433.04" x2="245.84" y2="433.04"/><rect class="f" x="247.09" y="436.48" width="36.9" height="36.88"/><line class="d" x1="278.1" y1="465.96" x2="278.1" y2="465.96"/><line class="l" x1="252.72" y1="466.21" x2="261.44" y2="466.21"/><line class="d" x1="278.1" y1="454.66" x2="278.1" y2="454.66"/><line class="l" x1="252.72" y1="454.91" x2="261.44" y2="454.91"/><line class="d" x1="278.1" y1="443.36" x2="278.1" y2="443.36"/><line class="l" x1="252.72" y1="443.61" x2="261.44" y2="443.61"/>`,
    width: 48,
    height: 48,
  },
  {
    id: 'virtual-hypervisor',
    name: 'Hypervisor',
    category: 'virtual-stack',
    viewBox: '360 440.5 41 35',
    svgContent: `${SV}<line class="d" x1="362.22" y1="454.96" x2="362.22" y2="454.96"/><line class="v" x1="362.22" y1="450.72" x2="362.22" y2="444.37"/><line class="d" x1="362.22" y1="442.25" x2="362.22" y2="442.25"/><line class="v" x1="366.27" y1="442.25" x2="396.6" y2="442.25"/><line class="d" x1="398.62" y1="442.25" x2="398.62" y2="442.25"/><line class="v" x1="398.62" y1="446.48" x2="398.62" y2="452.84"/><line class="d" x1="398.62" y1="454.96" x2="398.62" y2="454.96"/><line class="v" x1="394.58" y1="454.96" x2="364.25" y2="454.96"/><rect class="f" x="361.97" y="459.14" width="36.9" height="14.25"/><line class="d" x1="392.99" y1="466.12" x2="392.99" y2="466.12"/><line class="l" x1="367.61" y1="466.24" x2="376.33" y2="466.24"/>`,
    width: 41,
    height: 35,
  },

  // ──────────────────────────────────────────
  // Other icons (less frequently used)
  // ──────────────────────────────────────────
  {
    id: 'other-health-monitor',
    name: 'Health Monitor',
    category: 'other',
    viewBox: '587 335.5 47 32',
    svgContent: `${SP}<polyline class="l" points="614.94 337.18 629.08 337.18 629.08 360.74 591.72 360.74 591.72 337.18 605.85 337.18"/><line class="l" x1="610.4" y1="337.18" x2="610.4" y2="337.18"/><line class="l" x1="599.15" y1="352.66" x2="599.15" y2="349.79"/><line class="l" x1="606.95" y1="352.66" x2="606.95" y2="344.94"/><line class="l" x1="603.05" y1="352.66" x2="603.05" y2="347.85"/><line class="l" x1="597.22" y1="352.89" x2="608.89" y2="352.89"/><line class="l" x1="588.65" y1="365.36" x2="632.15" y2="365.36"/><ellipse class="l" cx="618.9" cy="348.94" rx="3.1" ry="3.12"/><line class="l" x1="621.09" y1="351.14" x2="622.24" y2="352.31"/><line class="l" x1="615.55" y1="345.57" x2="616.7" y2="346.74"/><line class="l" x1="621.09" y1="346.74" x2="622.24" y2="345.57"/><line class="l" x1="615.55" y1="352.31" x2="616.7" y2="351.14"/><line class="l" x1="622" y1="348.94" x2="623.63" y2="348.94"/><line class="l" x1="614.16" y1="348.94" x2="615.8" y2="348.94"/><line class="l" x1="618.9" y1="345.82" x2="618.9" y2="344.18"/><line class="l" x1="618.9" y1="353.7" x2="618.9" y2="352.06"/>`,
    width: 47,
    height: 32,
  },
  {
    id: 'other-vpn',
    name: 'VPN',
    category: 'other',
    viewBox: '594 427 33 38',
    svgContent: `${SS}<path class="s" d="M625.13,431.14l-14.56-3.1c-.11-.02-.23-.02-.34,0l-14.56,3.1c-.38.08-.66.42-.66.81v16.76c0,8.49,6.9,15.39,15.39,15.39s15.39-6.9,15.39-15.39v-16.76c0-.39-.27-.73-.66-.81Z"/><polyline class="l" points="605.68 446.21 608.52 449.01 615.06 442.52"/><path class="l" d="M610.4,463.32c-8.06,0-14.61-6.55-14.61-14.61v-16.8l14.61-3.1,14.61,3.1v16.8c0,8.06-6.55,14.61-14.61,14.61Z"/>`,
    width: 33,
    height: 38,
  },
];
